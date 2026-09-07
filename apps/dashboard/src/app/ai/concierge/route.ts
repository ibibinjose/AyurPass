import { NextRequest, NextResponse } from "next/server";
import { API_URL } from "@/lib/env";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json(
        { error: "Unauthorized", detail: "Sign in to use the care concierge." },
        { status: 401 },
      );
    }

    const body = await req.json().catch(() => ({}));

    const backendUrl = `${API_URL}/ai/concierge`;
    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
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
