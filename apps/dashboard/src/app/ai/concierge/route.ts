import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/env";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const authHeader = req.headers.get("authorization");

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (authHeader) {
      headers["Authorization"] = authHeader;
    }

    const backendUrl = `${API_URL}/ai/concierge`;
    const res = await fetch(backendUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => null);
    return NextResponse.json(data ?? { error: "Invalid response from AI service" }, {
      status: res.status,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { error: "Concierge route error", detail: message },
      { status: 502 },
    );
  }
}
