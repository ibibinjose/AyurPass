"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";
import type { HealthAuthorityBadge } from "@/lib/types";
import { HEALTH_AUTHORITY_PRESETS, normalizeAuthorities } from "@/lib/credentials";
import {
  HANDLE_NAMESPACES,
  PROFESSIONAL_TITLE_KINDS,
  defaultNamespaceForTitleKind,
  normalizeHandle,
  isValidHandle,
  isReservedRootHandle,
} from "@ayurpass/shared";
import { practitionerPath } from "@/lib/paths";
import {
  DashCard,
  DashFormActions,
  DashHeader,
  DashStickySave,
} from "@/components/dashboard/DashboardKit";
import { SettingsLivePreview } from "@/components/dashboard/DashboardPreview";
import { MediaField } from "@/components/MediaField";
import { Button, ErrorNote, Field, Input, Select, SuccessNote } from "@/components/ui";

const ROLE_LABEL: Record<string, string> = {
  CONSUMER: "Seeker",
  PROFESSIONAL: "Practitioner",
  PROVIDER_ADMIN: "Practice admin",
  PLATFORM_ADMIN: "Platform admin",
};

export default function SettingsPage() {
  const { user, refreshProfile } = useAuth();
  const professional = user?.professional ?? null;
  const hasPractice = Boolean(user?.provider ?? professional?.provider);

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [title, setTitle] = useState("");
  const [titleKind, setTitleKind] = useState("");
  const [handle, setHandle] = useState("");
  const [handleNamespace, setHandleNamespace] = useState("pro");
  const [vanityHandle, setVanityHandle] = useState("");
  const [vanityStatus, setVanityStatus] = useState("none");
  const [requestVanity, setRequestVanity] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [licenceNumber, setLicenceNumber] = useState("");
  const [authorityCodes, setAuthorityCodes] = useState<string[]>([]);
  const [customAuthority, setCustomAuthority] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [baseline, setBaseline] = useState<string>("");

  function snapshot(data: {
    fullName: string;
    phone: string;
    avatarUrl: string;
    coverImageUrl: string;
    title: string;
    titleKind: string;
    handle: string;
    handleNamespace: string;
    vanityHandle: string;
    requestVanity: boolean;
    registrationNumber: string;
    licenceNumber: string;
    authorityCodes: string[];
    customAuthority: string;
  }) {
    return JSON.stringify({
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      avatarUrl: data.avatarUrl.trim(),
      coverImageUrl: data.coverImageUrl.trim(),
      title: data.title.trim(),
      titleKind: data.titleKind,
      handle: data.handle.trim().toLowerCase(),
      handleNamespace: data.handleNamespace,
      vanityHandle: data.vanityHandle.trim().toLowerCase(),
      requestVanity: data.requestVanity,
      registrationNumber: data.registrationNumber.trim(),
      licenceNumber: data.licenceNumber.trim(),
      authorityCodes: [...data.authorityCodes].sort(),
      customAuthority: data.customAuthority.trim(),
    });
  }

  function markDirty() {
    setDirty(true);
    setSaved(false);
  }

  useEffect(() => {
    if (!user) return;
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (!active) return;
      const initialCover = user.provider?.brandProfile?.coverImageUrl ?? professional?.provider?.brandProfile?.coverImageUrl ?? "";
      const next = {
        fullName: user.fullName ?? "",
        phone: user.phone ?? "",
        // Keep raw DB URL — MediaField resolves / heals preview; don't rewrite on load
        avatarUrl: user.avatarUrl ?? "",
        coverImageUrl: initialCover,
        title: "",
        titleKind: "",
        handle: "",
        handleNamespace: "pro",
        vanityHandle: "",
        requestVanity: false,
        registrationNumber: "",
        licenceNumber: "",
        authorityCodes: [] as string[],
        customAuthority: "",
      };
      setFullName(next.fullName);
      setPhone(next.phone);
      setAvatarUrl(next.avatarUrl);
      setCoverImageUrl(next.coverImageUrl);
      if (!professional?.id) {
        setBaseline(snapshot(next));
        setDirty(false);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [user, professional?.id]);

  useEffect(() => {
    if (!professional?.id || !user) return;
    api
      .publicProfessionalsByProvider(professional.providerId)
      .then((list) => {
        const me = list.find((p) => p.id === professional.id) ?? professional;
        const initialCover = user.provider?.brandProfile?.coverImageUrl ?? me.provider?.brandProfile?.coverImageUrl ?? "";
        const next = {
          fullName: user.fullName ?? "",
          phone: user.phone ?? "",
          avatarUrl: user.avatarUrl ?? "",
          coverImageUrl: initialCover,
          title: me.title ?? "",
          titleKind: me.titleKind ?? "",
          handle: me.handle ?? me.slug ?? "",
          handleNamespace: me.handleNamespace ?? "pro",
          vanityHandle: me.vanityHandle ?? "",
          requestVanity: false,
          registrationNumber: me.registrationNumber ?? "",
          licenceNumber: me.licenceNumber ?? "",
          authorityCodes: normalizeAuthorities(me.healthAuthorities).map((a) => a.code),
          customAuthority: "",
        };
        setAvatarUrl(next.avatarUrl);
        setCoverImageUrl(next.coverImageUrl);
        setTitle(next.title);
        setTitleKind(next.titleKind);
        setHandle(next.handle);
        setHandleNamespace(next.handleNamespace);
        setVanityHandle(next.vanityHandle);
        setVanityStatus(me.vanityStatus ?? "none");
        setRequestVanity(false);
        setRegistrationNumber(next.registrationNumber);
        setLicenceNumber(next.licenceNumber);
        setAuthorityCodes(next.authorityCodes);
        setBaseline(snapshot(next));
        setDirty(false);
      })
      .catch(() => {
        const initialCover = user.provider?.brandProfile?.coverImageUrl ?? professional.provider?.brandProfile?.coverImageUrl ?? "";
        const next = {
          fullName: user.fullName ?? "",
          phone: user.phone ?? "",
          avatarUrl: user.avatarUrl ?? "",
          coverImageUrl: initialCover,
          title: professional.title ?? "",
          titleKind: professional.titleKind ?? "",
          handle: professional.handle ?? professional.slug ?? "",
          handleNamespace: professional.handleNamespace ?? "pro",
          vanityHandle: professional.vanityHandle ?? "",
          requestVanity: false,
          registrationNumber: professional.registrationNumber ?? "",
          licenceNumber: professional.licenceNumber ?? "",
          authorityCodes: normalizeAuthorities(professional.healthAuthorities).map((a) => a.code),
          customAuthority: "",
        };
        setCoverImageUrl(next.coverImageUrl);
        setTitle(next.title);
        setTitleKind(next.titleKind);
        setHandle(next.handle);
        setHandleNamespace(next.handleNamespace);
        setVanityHandle(next.vanityHandle);
        setVanityStatus(professional.vanityStatus ?? "none");
        setRegistrationNumber(next.registrationNumber);
        setLicenceNumber(next.licenceNumber);
        setAuthorityCodes(next.authorityCodes);
        setBaseline(snapshot(next));
        setDirty(false);
      });
  }, [professional, user]);

  const currentSnap = useMemo(
    () =>
      snapshot({
        fullName,
        phone,
        avatarUrl,
        coverImageUrl,
        title,
        titleKind,
        handle,
        handleNamespace,
        vanityHandle,
        requestVanity,
        registrationNumber,
        licenceNumber,
        authorityCodes,
        customAuthority,
      }),
    [
      fullName,
      phone,
      avatarUrl,
      coverImageUrl,
      title,
      titleKind,
      handle,
      handleNamespace,
      vanityHandle,
      requestVanity,
      registrationNumber,
      licenceNumber,
      authorityCodes,
      customAuthority,
    ],
  );

  useEffect(() => {
    if (!baseline) return;
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (active) {
        setDirty(currentSnap !== baseline);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [currentSnap, baseline]);

  const initials =
    fullName
      .split(" ")
      .map((s) => s[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "AP";

  function discard() {
    if (!baseline) return;
    try {
      const data = JSON.parse(baseline) as {
        fullName: string;
        phone: string;
        avatarUrl: string;
        title: string;
        titleKind: string;
        handle: string;
        handleNamespace: string;
        vanityHandle: string;
        requestVanity: boolean;
        registrationNumber: string;
        licenceNumber: string;
        authorityCodes: string[];
        customAuthority: string;
      };
      setFullName(data.fullName);
      setPhone(data.phone);
      setAvatarUrl(data.avatarUrl);
      setTitle(data.title);
      setTitleKind(data.titleKind);
      setHandle(data.handle);
      setHandleNamespace(data.handleNamespace);
      setVanityHandle(data.vanityHandle);
      setRequestVanity(data.requestVanity);
      setRegistrationNumber(data.registrationNumber);
      setLicenceNumber(data.licenceNumber);
      setAuthorityCodes(data.authorityCodes);
      setCustomAuthority(data.customAuthority);
      setDirty(false);
      setSaved(false);
      setError(null);
    } catch {
      /* ignore */
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setSaved(false);
    setError(null);
    try {
      // Persist the URL the uploader returned (S3 in prod). Don't rewrite to a guessed path.
      const nextAvatar = avatarUrl.trim() || undefined;
      await api.updateUser(user.id, {
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        avatarUrl: nextAvatar,
      });
      if (nextAvatar) setAvatarUrl(nextAvatar);
      if (professional?.id) {
        const h = normalizeHandle(handle);
        if (h && !isValidHandle(h)) {
          setError("Handle must be 3–32 characters (letters, numbers, . _ -).");
          setBusy(false);
          return;
        }
        const vh = normalizeHandle(vanityHandle);
        if (vh && (!isValidHandle(vh) || isReservedRootHandle(vh))) {
          setError(
            vh && isReservedRootHandle(vh)
              ? "That root username is reserved. Choose another."
              : "Root vanity handle is invalid.",
          );
          setBusy(false);
          return;
        }
        const presetByCode = new Map(HEALTH_AUTHORITY_PRESETS.map((p) => [p.code, p]));
        const healthAuthorities: HealthAuthorityBadge[] = authorityCodes.map((code) => {
          const preset = presetByCode.get(code);
          return {
            code,
            name: preset?.name ?? code,
            region: preset?.region,
            verified: true,
          };
        });
        if (customAuthority.trim()) {
          healthAuthorities.push({
            code: customAuthority.trim().slice(0, 24),
            name: customAuthority.trim(),
            verified: false,
          });
        }
        const updated = await api.updateProfessional(professional.id, {
          title: title.trim() || undefined,
          titleKind: titleKind || null,
          handle: h || null,
          handleNamespace: h ? handleNamespace : null,
          vanityHandle: vh || null,
          requestVanity: requestVanity && Boolean(vh),
          registrationNumber: registrationNumber.trim() || null,
          licenceNumber: licenceNumber.trim() || null,
          healthAuthorities,
        });
        setVanityStatus(updated.vanityStatus ?? "none");
        setRequestVanity(false);
      }
      await refreshProfile();
      setBaseline(
        snapshot({
          fullName,
          phone,
          avatarUrl,
          coverImageUrl,
          title,
          titleKind,
          handle,
          handleNamespace,
          vanityHandle,
          requestVanity: false,
          registrationNumber,
          licenceNumber,
          authorityCodes,
          customAuthority: "",
        }),
      );
      setCustomAuthority("");
      setDirty(false);
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Your details couldn't be saved right now.",
      );
    } finally {
      setBusy(false);
    }
  }

  const publicPathPreview =
    professional &&
    practitionerPath({
      id: professional.id,
      slug: professional.slug,
      handle: handle || null,
      handleNamespace: handleNamespace || null,
      vanityHandle: vanityHandle || null,
      vanityStatus: requestVanity ? "pending" : vanityStatus,
    });

  return (
    <div className="space-y-6 pb-24">
      <DashHeader
        eyebrow="Account"
        title="Settings"
        description="Your personal profile, contact details, and practitioner credentials."
      />

      {/* Account strip */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-hairline bg-surface px-4 py-3 sm:px-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-clay text-sm font-bold text-forest">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolveMediaUrl(avatarUrl) || avatarUrl}
              alt=""
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : (
            initials
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-forest">
            {fullName.trim() || user?.email || "Your account"}
          </p>
          <p className="truncate text-xs font-medium text-ink-muted">{user?.email}</p>
        </div>
        <span className="inline-flex items-center rounded-full bg-clay px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-ink-secondary">
          {ROLE_LABEL[user?.role ?? ""] ?? user?.role ?? "Account"}
        </span>
        {hasPractice ? (
          <Link
            href="/dashboard/business"
            className="inline-flex min-h-9 items-center rounded-full border border-hairline px-3 text-xs font-semibold text-forest hover:border-leaf"
          >
            Business profile
          </Link>
        ) : null}
      </div>

      <form id="settings-form" onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem] lg:items-start">
        <div className="min-w-0 space-y-5">
          <DashCard
            title="Profile Visuals"
            description="How your photo and cover banner appear across bookings, team rosters, and public practitioner pages."
          >
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <MediaField
                  label="Profile photo"
                  shape="avatar"
                  value={avatarUrl}
                  onChange={(url) => {
                    setAvatarUrl(url);
                    markDirty();
                  }}
                  recommended="square · 512×512"
                  hint="Upload a clear headshot or paste an image link. Shown on practitioner cards and team roster."
                />
                <MediaField
                  label="Profile cover banner"
                  shape="cover"
                  value={coverImageUrl}
                  onChange={(url) => {
                    setCoverImageUrl(url);
                    markDirty();
                  }}
                  recommended="wide · 1600×900"
                  hint="Hero cover banner image displayed at the top of your public profile page."
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Full name"
                  required
                  hint="Used on bookings and public profiles."
                >
                  <Input
                    required
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      markDirty();
                    }}
                    placeholder="Your name"
                  />
                </Field>
                <Field
                  label="Phone"
                  optional
                  hint="For booking reminders and enquiries."
                >
                  <Input
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      markDirty();
                    }}
                    placeholder="+61 400 000 000"
                  />
                </Field>
              </div>
              <Field
                label="Email"
                hint="Sign-in email can’t be changed here. Contact support if you need a new address."
              >
                <Input value={user?.email ?? ""} disabled readOnly />
              </Field>
            </div>
          </DashCard>

          {professional ? (
            <>
            <DashCard
              title="Professional title & public URL"
              description="Choose your profession title and a public handle. Root usernames (ayurpass.com/you) need admin approval to protect brands and celebrities."
            >
              <div className="space-y-5">
                <Field
                  label="Profession"
                  hint="Structured title shown on your public profile."
                >
                  <Select
                    value={titleKind}
                    onChange={(e) => {
                      const kind = e.target.value;
                      setTitleKind(kind);
                      const ns = defaultNamespaceForTitleKind(kind || null);
                      setHandleNamespace(ns);
                      const label =
                        PROFESSIONAL_TITLE_KINDS.find((t) => t.id === kind)?.label ?? "";
                      if (!title.trim() && label && kind !== "OTHER") setTitle(label);
                      markDirty();
                    }}
                  >
                    <option value="">Select title…</option>
                    {Object.entries(
                      PROFESSIONAL_TITLE_KINDS.reduce<Record<string, typeof PROFESSIONAL_TITLE_KINDS>>(
                        (acc, t) => {
                          (acc[t.group] ||= []).push(t);
                          return acc;
                        },
                        {},
                      ),
                    ).map(([group, items]) => (
                      <optgroup key={group} label={group}>
                        {items.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </Select>
                </Field>
                <Field
                  label="Display title"
                  optional
                  hint="Override the label if needed (e.g. Senior Yoga Teacher)."
                >
                  <Input
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      markDirty();
                    }}
                    placeholder="Ayurvedic Doctor · Yoga Instructor · …"
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)]">
                  <Field label="Path">
                    <Select
                      value={handleNamespace}
                      onChange={(e) => {
                        setHandleNamespace(e.target.value);
                        markDirty();
                      }}
                    >
                      {HANDLE_NAMESPACES.map((n) => (
                        <option key={n.id} value={n.id}>
                          /{n.id}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field
                    label="Handle"
                    hint={
                      handle
                        ? `Public page: ayurpass.com/${handleNamespace}/${normalizeHandle(handle) || "…"}`
                        : "3–32 characters · letters, numbers, . _ -"
                    }
                  >
                    <Input
                      value={handle}
                      onChange={(e) => {
                        setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""));
                        markDirty();
                      }}
                      placeholder="your-name"
                      autoComplete="username"
                    />
                  </Field>
                </div>
                {publicPathPreview ? (
                  <p className="rounded-xl bg-clay/40 px-3 py-2 text-xs font-medium text-ink-secondary">
                    Canonical URL:{" "}
                    <Link href={publicPathPreview} className="font-semibold text-forest hover:underline">
                      {publicPathPreview}
                    </Link>
                  </p>
                ) : null}

                <div className="rounded-2xl border border-hairline bg-clay/20 p-4">
                  <p className="text-sm font-semibold text-forest">Root vanity username</p>
                  <p className="mt-1 text-xs font-medium leading-relaxed text-ink-muted">
                    Request <span className="font-mono">ayurpass.com/you</span> for brands and
                    notable practitioners. Platform admin must approve before it goes live —
                    this protects celebrities and trademarked names.
                  </p>
                  <Field className="mt-3" label="Requested username" optional>
                    <Input
                      value={vanityHandle}
                      onChange={(e) => {
                        setVanityHandle(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""));
                        markDirty();
                      }}
                      placeholder="yourbrand"
                    />
                  </Field>
                  <label className="mt-3 flex items-center gap-2 text-sm font-medium text-ink-secondary">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-[var(--forest)]"
                      checked={requestVanity}
                      onChange={(e) => {
                        setRequestVanity(e.target.checked);
                        markDirty();
                      }}
                      disabled={!vanityHandle.trim()}
                    />
                    Submit for admin approval
                  </label>
                  {vanityStatus && vanityStatus !== "none" ? (
                    <p className="mt-2 text-xs font-bold uppercase tracking-wide text-ink-muted">
                      Status: {vanityStatus}
                      {vanityStatus === "approved" && vanityHandle
                        ? ` · live at /${vanityHandle}`
                        : ""}
                    </p>
                  ) : null}
                </div>
              </div>
            </DashCard>

            <DashCard
              title="Practitioner credentials"
              description="Registration, licence and health-authority marks (e.g. AAA) appear next to your name on public profiles."
            >
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Registration number" optional>
                    <Input
                      value={registrationNumber}
                      onChange={(e) => {
                        setRegistrationNumber(e.target.value);
                        markDirty();
                      }}
                      placeholder="Association / board ID"
                    />
                  </Field>
                  <Field label="Licence number" optional>
                    <Input
                      value={licenceNumber}
                      onChange={(e) => {
                        setLicenceNumber(e.target.value);
                        markDirty();
                      }}
                      placeholder="Clinical / practice licence"
                    />
                  </Field>
                </div>

                <div>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      Health authority approvals
                    </p>
                    <span className="text-xs font-medium text-ink-muted">
                      {authorityCodes.length} selected
                    </span>
                  </div>
                  <p className="mb-3 text-xs font-medium leading-relaxed text-ink-muted">
                    Tap to toggle. Verified marks help seekers trust your listing.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {HEALTH_AUTHORITY_PRESETS.map((preset) => {
                      const active = authorityCodes.includes(preset.code);
                      return (
                        <button
                          key={preset.code}
                          type="button"
                          title={preset.name}
                          onClick={() => {
                            setAuthorityCodes((prev) =>
                              active
                                ? prev.filter((c) => c !== preset.code)
                                : [...prev, preset.code],
                            );
                            markDirty();
                          }}
                          aria-pressed={active}
                          className={`inline-flex min-h-10 max-w-full items-center gap-1.5 rounded-full px-3.5 py-2 text-left text-sm font-semibold transition-colors ${
                            active
                              ? "bg-[var(--system-blue)] text-white shadow-sm"
                              : "border border-hairline bg-surface text-ink-secondary hover:border-leaf hover:text-forest"
                          }`}
                        >
                          <span>{preset.code}</span>
                          <span
                            className={`text-[10px] font-bold uppercase tracking-wide ${
                              active ? "text-white/80" : "text-ink-muted"
                            }`}
                          >
                            {preset.region}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  {authorityCodes.length > 0 ? (
                    <ul className="mt-3 space-y-1 rounded-xl bg-clay/40 px-3 py-2.5">
                      {authorityCodes.map((code) => {
                        const preset = HEALTH_AUTHORITY_PRESETS.find((p) => p.code === code);
                        return (
                          <li key={code} className="text-xs font-medium text-ink-secondary">
                            <span className="font-bold text-forest">{code}</span>
                            {preset ? ` — ${preset.name}` : null}
                          </li>
                        );
                      })}
                    </ul>
                  ) : null}
                  <Field
                    className="mt-4"
                    label="Custom authority"
                    optional
                    hint="Any board or association not listed above."
                  >
                    <Input
                      value={customAuthority}
                      onChange={(e) => {
                        setCustomAuthority(e.target.value);
                        markDirty();
                      }}
                      placeholder="Other board or association"
                    />
                  </Field>
                </div>
              </div>
            </DashCard>

            <DashCard
              title="Languages Spoken"
              description="Select the languages you and your consultation team speak fluently (e.g., English, Malayalam, Hindi, Tamil, Sanskrit)."
            >
              <div className="space-y-3">
                <p className="text-xs font-medium leading-relaxed text-ink-muted">
                  Tap languages to toggle. Spoken languages are highlighted on your public practice directory profile for seekers worldwide.
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "English",
                    "Malayalam",
                    "Hindi",
                    "Tamil",
                    "Sanskrit",
                    "Telugu",
                    "Kannada",
                    "Gujarati",
                    "Marathi",
                    "Bengali",
                    "German",
                    "French",
                    "Spanish",
                    "Arabic",
                  ].map((lang) => {
                    const active = authorityCodes.includes(`LANG_${lang}`) || lang === "English" || lang === "Malayalam" || lang === "Hindi";
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => {
                          setAuthorityCodes((prev) =>
                            prev.includes(`LANG_${lang}`)
                              ? prev.filter((c) => c !== `LANG_${lang}`)
                              : [...prev, `LANG_${lang}`],
                          );
                          markDirty();
                        }}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all ${
                          active
                            ? "bg-forest text-gold-soft shadow-sm ring-1 ring-gold/40"
                            : "border border-hairline bg-surface text-ink-secondary hover:border-leaf hover:text-forest"
                        }`}
                      >
                        <span>🗣️</span>
                        <span>{lang}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </DashCard>
            </>
          ) : null}

          <ErrorNote message={error} />
          <SuccessNote message={saved && !dirty ? "Your details were saved." : null} />

          <DashFormActions>
            <Button type="submit" disabled={busy || !dirty} className="min-h-11 px-6">
              {busy ? "Saving…" : dirty ? "Save changes" : "All changes saved"}
            </Button>
            {dirty ? (
              <Button type="button" variant="ghost" onClick={discard} disabled={busy}>
                Discard
              </Button>
            ) : null}
          </DashFormActions>

          {user?.role === "CONSUMER" ? (
            <p className="text-sm font-medium text-ink-muted">
              Manage who can see your health data in{" "}
              <Link
                href="/dashboard/permissions"
                className="font-semibold text-forest hover:underline"
              >
                Privacy & permissions
              </Link>
              .
            </p>
          ) : null}

          {hasPractice ? (
            <p className="text-sm font-medium text-ink-muted">
              Practice logo, cover and public listing live on{" "}
              <Link
                href="/dashboard/business"
                className="font-semibold text-forest hover:underline"
              >
                Business profile
              </Link>
              .
            </p>
          ) : null}
        </div>

        {/* Live preview */}
        <aside className="hidden lg:sticky lg:top-20 lg:block lg:self-start">
          <SettingsLivePreview
            fullName={fullName}
            title={title}
            phone={phone}
            email={user?.email}
            avatarUrl={avatarUrl}
            authorityCodes={
              customAuthority.trim()
                ? [...authorityCodes, customAuthority.trim().slice(0, 24)]
                : authorityCodes
            }
            registrationNumber={registrationNumber}
            licenceNumber={licenceNumber}
            isProfessional={Boolean(professional)}
          />
        </aside>
      </form>

      <div className="lg:hidden">
        <SettingsLivePreview
          fullName={fullName}
          title={title}
          phone={phone}
          email={user?.email}
          avatarUrl={avatarUrl}
          authorityCodes={
            customAuthority.trim()
              ? [...authorityCodes, customAuthority.trim().slice(0, 24)]
              : authorityCodes
          }
          registrationNumber={registrationNumber}
          licenceNumber={licenceNumber}
          isProfessional={Boolean(professional)}
        />
      </div>

      <DashStickySave
        dirty={dirty}
        busy={busy}
        formId="settings-form"
        onDiscard={discard}
        label="Save settings"
        message="Unsaved profile changes"
      />
    </div>
  );
}
