import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "AyurPass — Find and book Ayurveda, Yoga and Wellness";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const logoData = await readFile(
  join(process.cwd(), "public", "brand", "ayurpass-botanical-a-mark.png"),
  "base64",
);
const logoSrc = `data:image/png;base64,${logoData}`;

/**
 * Canonical large-format card for social networks and messaging apps.
 * Route-level metadata automatically supplies this image to shared links.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "linear-gradient(135deg, #f8f7f2 0%, #f4ecdc 100%)",
        color: "#174b3a",
        display: "flex",
        height: "100%",
        justifyContent: "space-between",
        overflow: "hidden",
        padding: "72px 88px",
        position: "relative",
        width: "100%",
      }}
    >
      <div
        style={{
          background: "rgba(194, 112, 76, 0.11)",
          borderRadius: "999px",
          height: "620px",
          position: "absolute",
          right: "-180px",
          top: "-220px",
          width: "620px",
        }}
      />
      <div
        style={{
          background: "rgba(23, 75, 58, 0.08)",
          borderRadius: "999px",
          bottom: "-280px",
          height: "500px",
          left: "-140px",
          position: "absolute",
          width: "500px",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          maxWidth: "690px",
          position: "relative",
        }}
      >
        <div style={{ alignItems: "center", display: "flex", gap: "18px" }}>
          <img
            alt=""
            src={logoSrc}
            style={{ height: "82px", objectFit: "contain", width: "82px" }}
          />
          <div
            style={{
              display: "flex",
              fontSize: "56px",
              fontWeight: 700,
              letterSpacing: "-3px",
            }}
          >
            <span>Ayur</span>
            <span style={{ color: "#a67a24" }}>Pass</span>
          </div>
        </div>
        <div
          style={{
            fontSize: "57px",
            fontWeight: 700,
            letterSpacing: "-2px",
            lineHeight: 1.08,
            marginTop: "62px",
          }}
        >
          Find and book wellness that feels right for you.
        </div>
        <div
          style={{
            color: "#405048",
            display: "flex",
            fontSize: "25px",
            lineHeight: 1.35,
            marginTop: "24px",
          }}
        >
          Ayurveda · Yoga · Spa · Meditation · Wellness
        </div>
      </div>
      <div
        style={{
          alignItems: "center",
          background: "rgba(255, 255, 255, 0.75)",
          border: "1px solid rgba(23, 75, 58, 0.15)",
          borderRadius: "44px",
          display: "flex",
          height: "286px",
          justifyContent: "center",
          padding: "28px",
          position: "relative",
          width: "286px",
        }}
      >
        <img
          alt=""
          src={logoSrc}
          style={{ height: "226px", objectFit: "contain", width: "226px" }}
        />
      </div>
    </div>,
    size,
  );
}
