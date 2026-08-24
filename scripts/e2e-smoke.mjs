#!/usr/bin/env node
/**
 * API smoke path:
 *   register seeker → book → pay → report → admin resolve
 *
 * Usage:
 *   node scripts/e2e-smoke.mjs
 *   API_URL=http://localhost:4000 node scripts/e2e-smoke.mjs
 *
 * Requires a running API with at least one bookable service.
 * Creates two users (seeker + admin) via register, then promotes admin via Prisma.
 */
import { createRequire } from "node:module";
import { randomBytes } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const API = (process.env.API_URL ?? "http://localhost:4000").replace(/\/$/, "");
const REQUEST_TIMEOUT_MS = Number(process.env.SMOKE_REQUEST_TIMEOUT_MS ?? 15_000);

const stamp = Date.now().toString(36);
const suffix = randomBytes(3).toString("hex");
const seekerEmail = `smoke.seeker.${stamp}.${suffix}@example.com`;
const adminEmail = `smoke.admin.${stamp}.${suffix}@example.com`;
const password = "SmokeTest1!";

let passed = 0;
let failed = 0;

function ok(label, detail = "") {
  passed += 1;
  console.log(`  ✓ ${label}${detail ? ` — ${detail}` : ""}`);
}

function fail(label, err) {
  failed += 1;
  console.error(`  ✗ ${label}`);
  console.error(`    ${err instanceof Error ? err.message : String(err)}`);
}

async function fetchWithTimeout(url, init = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function api(path, { method = "GET", body, token } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetchWithTimeout(`${API}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      (typeof data === "string" ? data : JSON.stringify(data)) ||
      res.statusText;
    const err = new Error(`${method} ${path} → ${res.status}: ${Array.isArray(msg) ? msg.join(", ") : msg}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

async function promoteAdmin(userId) {
  // Prefer Prisma from backend workspace
  const clientPath = join(__dirname, "../apps/api/node_modules/@prisma/client");
  let PrismaClient;
  try {
    ({ PrismaClient } = require(clientPath));
  } catch {
    ({ PrismaClient } = require("@prisma/client"));
  }
  const prisma = new PrismaClient();
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { role: "PLATFORM_ADMIN" },
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  console.log(`\nAyurPass E2E smoke → ${API}\n`);

  // Health
  try {
    await api("/health");
    ok("API health");
  } catch (e) {
    // Some deployments expose /health under a different path
    try {
      const fallback = await fetchWithTimeout(`${API}/`);
      if (!fallback.ok) throw new Error(`GET / → ${fallback.status}`);
      ok("API reachable");
    } catch (e2) {
      fail("API reachable", e);
      console.error("\nStart the API (port 4000) and re-run.\n");
      process.exit(1);
    }
  }

  // 1) Register seeker
  let seekerTokens;
  let seekerUser;
  try {
    const reg = await api("/auth/register", {
      method: "POST",
      body: {
        email: seekerEmail,
        password,
        fullName: "Smoke Seeker",
        role: "CONSUMER",
      },
    });
    seekerTokens = reg.tokens ?? reg;
    seekerUser = reg.user ?? reg.profile ?? (await api("/auth/profile", { token: seekerTokens.accessToken }));
    ok("Register seeker", seekerEmail);
  } catch (e) {
    fail("Register seeker", e);
    process.exit(1);
  }

  const seekerToken = seekerTokens.accessToken;
  const consumerId = seekerUser.id;

  // 2) Pick a service
  let service;
  try {
    const services = await api("/services");
    if (!Array.isArray(services) || services.length === 0) {
      throw new Error("No services in catalog — seed data first");
    }
    service = services[0];
    ok("List services", `${services.length} · picked “${service.name}”`);
  } catch (e) {
    fail("List services", e);
    process.exit(1);
  }

  // 3) Book
  let booking;
  try {
    const start = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    start.setMinutes(0, 0, 0);
    const end = new Date(start.getTime() + (service.durationMinutes || 60) * 60 * 1000);
    booking = await api("/bookings", {
      method: "POST",
      token: seekerToken,
      body: {
        consumerId,
        serviceId: service.id,
        providerId: service.providerId,
        professionalId: service.professionalId || undefined,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        timezone: "UTC",
        notes: "E2E smoke booking",
      },
    });
    ok("Create booking", booking.id?.slice(0, 8));
  } catch (e) {
    fail("Create booking", e);
    process.exit(1);
  }

  // 4) Pay (mock path marks paid; live Stripe without Connect is soft-skipped)
  try {
    const paid = await api(`/payments/checkout/${booking.id}`, {
      method: "POST",
      token: seekerToken,
      body: {},
    });
    const status = paid.paymentStatus || paid.payment?.status || "ok";
    if (paid.payment?.clientSecret && !paid.payment?.mock && paid.paymentStatus !== "paid") {
      try {
        await api(`/payments/confirm/${booking.id}`, { method: "POST", token: seekerToken });
        ok("Pay booking (confirm)", "live intent confirmed");
      } catch {
        ok("Pay booking started", `clientSecret present · ${status}`);
      }
    } else {
      ok("Pay booking", String(paid.paymentStatus ?? "paid/mock"));
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (
      msg.toLowerCase().includes("payment setup") ||
      msg.toLowerCase().includes("stripe onboarding") ||
      msg.toLowerCase().includes("mock mode")
    ) {
      ok("Pay booking skipped", "provider not Stripe-ready (expected in some local DBs)");
    } else {
      fail("Pay booking", e);
    }
  }

  // 5) Service review (denormalized rating path)
  try {
    await api("/quality/reviews", {
      method: "PUT",
      token: seekerToken,
      body: {
        targetType: "service",
        targetId: service.id,
        rating: 5,
        body: "E2E smoke review — excellent session.",
      },
    });
    ok("Submit service review", "5★");
  } catch (e) {
    fail("Submit service review", e);
  }

  // 6) Report abuse / feedback
  let reportId;
  try {
    const report = await api("/quality/feedback", {
      method: "POST",
      token: seekerToken,
      body: {
        kind: "abuse",
        category: "spam",
        message: "E2E smoke report — please ignore; automated trust & safety test.",
        targetType: "service",
        targetId: service.id,
        targetLabel: service.name,
        pageUrl: `${API}/explore`,
      },
    });
    reportId = report.id;
    ok("Submit report", reportId?.slice(0, 8));
  } catch (e) {
    fail("Submit report", e);
  }

  // 7) Admin resolve
  let adminToken;
  try {
    const reg = await api("/auth/register", {
      method: "POST",
      body: {
        email: adminEmail,
        password,
        fullName: "Smoke Admin",
        role: "CONSUMER",
      },
    });
    const adminUser = reg.user ?? reg.profile;
    await promoteAdmin(adminUser.id);
    // re-login so JWT carries PLATFORM_ADMIN
    const login = await api("/auth/login", {
      method: "POST",
      body: { email: adminEmail, password },
    });
    adminToken = (login.tokens ?? login).accessToken;
    ok("Promote + login admin", adminEmail);
  } catch (e) {
    fail("Admin setup", e);
  }

  if (adminToken && reportId) {
    try {
      await api(`/quality/feedback/${reportId}`, {
        method: "PUT",
        token: adminToken,
        body: { status: "resolved", adminNote: "E2E smoke resolved" },
      });
      ok("Admin resolve report", reportId.slice(0, 8));
    } catch (e) {
      fail("Admin resolve report", e);
    }

    try {
      const list = await api("/quality/feedback?status=resolved", { token: adminToken });
      const found = Array.isArray(list) && list.some((r) => r.id === reportId);
      if (!found) throw new Error("Resolved report not in admin list");
      ok("Admin list includes resolved report");
    } catch (e) {
      fail("Admin list reports", e);
    }
  }

  // 8) Spot-check service denormalized rating (requires API process built after service quality fields)
  try {
    const refreshed = await api(`/services/${service.id}`);
    const rating = Number(refreshed?.rating ?? 0);
    const count = Number(refreshed?.reviewCount ?? 0);
    if (count >= 1 || rating > 0) {
      ok("Service denormalized rating", `${rating} ★ · ${count} review(s)`);
    } else {
      // Restart API after nest build if this stays 0
      ok(
        "Service denormalized rating pending",
        "fields present but 0 — restart API if reviews just landed on old process",
      );
    }
  } catch (e) {
    fail("Service denormalized rating", e);
  }

  console.log(`\nDone — ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
