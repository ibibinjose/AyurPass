import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/env";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized", detail: "Sign in to load your care memory profile." },
        { status: 401 },
      );
    }

    const backendUrl = `${API_URL}/ai/memory-profile`;
    const res = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data ?? { error: "Invalid response from AI memory profile service" }, {
      status: res.status,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { error: "AI memory profile route error", detail: message },
      { status: 502 },
    );
  }
}
