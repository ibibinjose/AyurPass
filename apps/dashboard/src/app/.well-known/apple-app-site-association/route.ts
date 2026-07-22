import { readFile } from "node:fs/promises";
import path from "node:path";

/** Serve AASA with correct content-type (Apple requires application/json). */
export async function GET() {
  const filePath = path.join(
    process.cwd(),
    "public",
    ".well-known",
    "apple-app-site-association",
  );
  let body: string;
  try {
    body = await readFile(filePath, "utf8");
  } catch {
    body = JSON.stringify({
      applinks: {
        apps: [],
        details: [
          {
            appID: "TEAMID.com.thepassionarc.ayurpass",
            paths: ["*"],
          },
        ],
      },
    });
  }
  return new Response(body, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
