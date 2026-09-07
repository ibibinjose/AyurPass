import { NextRequest, NextResponse } from "next/server";

/**
 * Allowlisted external logo proxy.
 * Used when browser / Next Image loads fail due to hotlink or referrer checks
 * (e.g. AAA directory hosts). Prefer caching logos into ayurpass-media at import
 * for a lasting fix — this route is a resilience backstop only.
 */
const ALLOWED_HOSTS = new Set(["www.ayurved.org.au", "ayurved.org.au"]);

function hostAllowed(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (ALLOWED_HOSTS.has(h)) return true;
  return h.endsWith(".ayurved.org.au");
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url");
  if (!raw?.trim()) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(raw.trim());
  } catch {
    return NextResponse.json({ error: "Invalid url" }, { status: 400 });
  }

  if (target.protocol !== "https:") {
    return NextResponse.json({ error: "Only https URLs are allowed" }, { status: 400 });
  }
  if (!hostAllowed(target.hostname)) {
    return NextResponse.json({ error: "Host not allowlisted" }, { status: 403 });
  }

  try {
    const upstream = await fetch(target.toString(), {
      headers: {
        Accept: "image/avif,image/webp,image/apng,image/*,*/*;q=0.8",
        "User-Agent":
          "Mozilla/5.0 (compatible; AyurPassImageProxy/1.0; +https://ayurpass.com)",
      },
      redirect: "follow",
      next: { revalidate: 86_400 },
    });

    if (!upstream.ok) {
      return NextResponse.json(
        { error: "Upstream fetch failed", status: upstream.status },
        { status: 502 },
      );
    }

    const contentType = upstream.headers.get("content-type") || "";
    if (!contentType.toLowerCase().startsWith("image/")) {
      return NextResponse.json({ error: "Upstream response is not an image" }, { status: 502 });
    }

    const body = await upstream.arrayBuffer();
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Proxy error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
