"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Code2,
  Copy,
  Download,
  Expand,
  ExternalLink,
  Eye,
  Info,
  Layers,
  Palette,
  RotateCcw,
  Sliders,
  Sparkles,
  Type,
  X,
} from "lucide-react";

type LogoVariant = {
  id: string;
  name: string;
  subtitle: string;
  src: string;
  width: number;
  height: number;
  recommendedUse: string;
  aspectRatio: string;
};

const LOGO_VARIANTS: LogoVariant[] = [
  {
    id: "primary",
    name: "Primary Logomark",
    subtitle: "Main brand emblem & icon mark",
    src: "/brand/ayurpass-logo.png",
    width: 1024,
    height: 1024,
    recommendedUse: "App Icon, Hero Headers, Social Media & Favicon",
    aspectRatio: "1:1 Square",
  },
  {
    id: "stacked",
    name: "Stacked Logo",
    subtitle: "Vertical composition with title",
    src: "/brand/ayurpass-logo-stacked.png",
    width: 800,
    height: 800,
    recommendedUse: "Splash Screens, Login Cards & Brand Displays",
    aspectRatio: "1:1 Vertical",
  },
  {
    id: "mark",
    name: "Icon Emblem",
    subtitle: "Clean vector emblem mark",
    src: "/brand/ayurpass-mark.png",
    width: 512,
    height: 512,
    recommendedUse: "Navigation Bar, Favicon & Mobile Tab Bar",
    aspectRatio: "1:1 Badge",
  },
  {
    id: "verified",
    name: "Verified Provider Badge",
    subtitle: "Official vetting certification seal",
    src: "/brand/ayurpass-verified-mark.png",
    width: 512,
    height: 512,
    recommendedUse: "Vetted Clinic Badges, Doctor Profiles & Certificates",
    aspectRatio: "1:1 Seal",
  },
];

type BgMode = "dark" | "ivory" | "white" | "grid";

const BG_MODES: { id: BgMode; label: string; classNames: string }[] = [
  { id: "dark", label: "Forest Dark", classNames: "bg-[#142019] text-white border-white/20" },
  { id: "ivory", label: "Ivory Surface", classNames: "bg-[#f4f0e8] text-[#1a1714] border-[#ddd6c8]" },
  { id: "white", label: "Pure White", classNames: "bg-white text-[#1a1714] border-gray-200" },
  { id: "grid", label: "Transparent Grid", classNames: "bg-[radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:16px_16px] bg-[#1a1714] text-white border-white/20" },
];

type BrandColor = { name: string; hex: string; role: string; textDark?: boolean };

const BRAND_COLORS: BrandColor[] = [
  { name: "Forest Deep", hex: "#1e3228", role: "Primary Brand / Hero Header" },
  { name: "Leaf Green", hex: "#2f5a44", role: "Secondary Accents & Buttons" },
  { name: "Ayur Gold", hex: "#a67a24", role: "Badges / Verification Gold" },
  { name: "Gold Soft", hex: "#e9d9b8", role: "Muted Glow & Subtitles", textDark: true },
  { name: "Surface Ivory", hex: "#f4f0e8", role: "App Background Canvas", textDark: true },
  { name: "Vata Violet", hex: "#4a3aa7", role: "Vata Dosha (Air & Ether)" },
  { name: "Pitta Spice", hex: "#eb6834", role: "Pitta Dosha (Fire & Transformation)" },
  { name: "Kapha Emerald", hex: "#1baf7a", role: "Kapha Dosha (Earth & Water)" },
];

type CodeSnippetType = "next" | "rn" | "html";

export default function LogoPage() {
  const [selectedVariant, setSelectedVariant] = useState<LogoVariant>(LOGO_VARIANTS[0]);
  const [bgMode, setBgMode] = useState<BgMode>("dark");
  const [scale, setScale] = useState<number>(100);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [codeType, setCodeType] = useState<CodeSnippetType>("next");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const activeBg = BG_MODES.find((m) => m.id === bgMode)!;

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2200);
  }

  const codeSnippets = {
    next: `<Image\n  src="${selectedVariant.src}"\n  alt="${selectedVariant.name}"\n  width={${selectedVariant.width}}\n  height={${selectedVariant.height}}\n  priority\n/>`,
    rn: `<Image\n  source={require(".${selectedVariant.src}")}\n  style={{ width: 120, height: 120 }}\n  resizeMode="contain"\n/>`,
    html: `<img\n  src="${selectedVariant.src}"\n  alt="${selectedVariant.name}"\n  width="${selectedVariant.width}"\n  height="${selectedVariant.height}"\n/>`,
  };

  return (
    <main className="relative flex min-h-screen w-full flex-col items-center justify-between overflow-x-hidden bg-forest-deep text-surface font-sans">
      {/* Dynamic Background Mesh */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-leaf/20 blur-[140px]" />
      <div className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 h-[500px] w-[700px] rounded-full bg-gold/15 blur-[160px]" />

      {/* Floating Toast Notification */}
      {copiedText && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-2xl border border-gold/40 bg-forest-deep px-5 py-3 text-sm font-semibold text-white shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4">
          <Check className="h-4 w-4 text-gold-soft" />
          <span>Copied {copiedText} to clipboard!</span>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header className="relative z-10 flex w-full max-w-7xl items-center justify-between p-6 md:p-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-surface backdrop-blur-md transition-all hover:border-gold-soft hover:bg-white/20 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>

        <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-bold text-gold-soft backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Brand & Asset Hub</span>
        </div>
      </header>

      {/* Hero Title Section */}
      <section className="relative z-10 text-center px-4 pt-2 pb-6">
        <h1 className="font-display text-4xl font-bold tracking-tight text-white md:text-6xl">
          AyurPass <span className="text-gold-soft">Brand Studio</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm text-surface/80 md:text-base mx-auto">
          Explore official brand marks, download high-res vector assets, inspect color tokens and code integration snippets.
        </p>
      </section>

      {/* Main Interactive Stage */}
      <section className="relative z-10 flex w-full max-w-6xl flex-col gap-8 px-4 py-4">
        {/* Controls Toolbar: Variant Selector + Background Mode */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4 rounded-3xl border border-white/15 bg-surface/10 p-3 backdrop-blur-xl">
          {/* Variant Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full lg:w-auto">
            {LOGO_VARIANTS.map((variant) => {
              const isActive = selectedVariant.id === variant.id;
              return (
                <button
                  key={variant.id}
                  type="button"
                  onClick={() => setSelectedVariant(variant)}
                  className={`flex-1 lg:flex-none inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-semibold transition-all ${
                    isActive
                      ? "bg-gold text-forest-deep shadow-md font-bold"
                      : "text-surface/80 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Layers className="h-3.5 w-3.5" />
                  <span>{variant.name}</span>
                </button>
              );
            })}
          </div>

          {/* Right Controls: Canvas Theme & Scale Slider */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
            {/* Canvas Theme Selector */}
            <div className="flex items-center gap-1 rounded-2xl bg-white/5 p-1 border border-white/10">
              <span className="px-2 text-[11px] font-bold uppercase tracking-wider text-surface/60 flex items-center gap-1">
                <Eye className="h-3 w-3" /> Canvas:
              </span>
              {BG_MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setBgMode(mode.id)}
                  className={`rounded-xl px-2.5 py-1 text-xs font-medium transition-all ${
                    bgMode === mode.id
                      ? "bg-white/20 text-white font-bold shadow-xs"
                      : "text-surface/60 hover:text-white"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Zoom / Scale Control */}
            <div className="flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-1.5 border border-white/10">
              <Sliders className="h-3.5 w-3.5 text-gold-soft" />
              <span className="text-xs font-mono font-bold text-surface/90 w-10 text-center">
                {scale}%
              </span>
              <input
                type="range"
                min="50"
                max="200"
                step="10"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="h-1.5 w-20 cursor-pointer accent-gold"
                aria-label="Logo scale slider"
              />
              <button
                type="button"
                onClick={() => setScale(100)}
                className="text-surface/50 hover:text-white p-1"
                title="Reset Scale"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Stage Display Area */}
        <div className="relative flex min-h-[440px] md:min-h-[500px] w-full flex-col items-center justify-center rounded-3xl border border-white/20 p-6 md:p-10 shadow-2xl transition-all duration-300 backdrop-blur-2xl">
          {/* Ambient stage aura */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-b from-leaf/20 to-gold/10 blur-2xl pointer-events-none" />

          {/* Fullscreen Button Top Right */}
          <button
            type="button"
            onClick={() => setIsFullscreen(true)}
            className="absolute top-4 right-4 z-20 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white backdrop-blur-md transition-all hover:bg-white/20"
            title="View Fullscreen Lightbox"
          >
            <Expand className="h-3.5 w-3.5" />
            <span>Full Page View</span>
          </button>

          {/* Canvas box */}
          <div
            className={`relative flex min-h-[320px] md:min-h-[360px] w-full max-w-3xl items-center justify-center rounded-2xl border p-8 shadow-inner transition-all duration-300 overflow-hidden ${activeBg.classNames}`}
          >
            <div
              className="transition-transform duration-300 flex items-center justify-center"
              style={{ transform: `scale(${scale / 100})` }}
            >
              <Image
                src={selectedVariant.src}
                alt={selectedVariant.name}
                width={selectedVariant.width}
                height={selectedVariant.height}
                priority
                className="h-auto max-h-[300px] md:max-h-[340px] w-auto max-w-[85%] object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Asset Metadata & Action Bar */}
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 w-full max-w-3xl border-t border-white/10 pt-6">
            <div className="text-left w-full md:w-auto">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="font-display text-xl font-bold text-white">
                  {selectedVariant.name}
                </h2>
                <span className="rounded-full bg-gold/20 border border-gold/30 px-2.5 py-0.5 text-[11px] font-bold text-gold-soft">
                  {selectedVariant.aspectRatio}
                </span>
              </div>
              <p className="text-xs text-surface/70 flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5 text-gold-soft" />
                <span>Recommended: {selectedVariant.recommendedUse}</span>
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
              <button
                type="button"
                onClick={() => copyToClipboard(selectedVariant.src, "Path")}
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-white/20"
              >
                <Copy className="h-3.5 w-3.5" />
                <span>Copy Path</span>
              </button>

              <a
                href={selectedVariant.src}
                download={`${selectedVariant.id}-logo.png`}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-gold to-gold/80 px-5 py-2.5 text-xs font-bold text-forest-deep shadow-md transition-all hover:brightness-110"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download PNG</span>
              </a>

              <a
                href={selectedVariant.src}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 p-2.5 rounded-xl border border-white/15 bg-white/5 text-surface/80 hover:text-white"
                title="Open raw image asset in new tab"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        {/* Section 2: Integration Code Snippets */}
        <div className="rounded-3xl border border-white/15 bg-surface/10 p-6 md:p-8 backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-gold/20 p-2 text-gold-soft">
                <Code2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white">Integration Snippets</h3>
                <p className="text-xs text-surface/70">Ready-to-use component code for React & React Native</p>
              </div>
            </div>

            {/* Code type tabs */}
            <div className="flex items-center gap-1 rounded-xl bg-white/5 p-1 border border-white/10 self-start sm:self-auto">
              <button
                type="button"
                onClick={() => setCodeType("next")}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  codeType === "next" ? "bg-gold text-forest-deep shadow-xs" : "text-surface/70 hover:text-white"
                }`}
              >
                Next.js
              </button>
              <button
                type="button"
                onClick={() => setCodeType("rn")}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  codeType === "rn" ? "bg-gold text-forest-deep shadow-xs" : "text-surface/70 hover:text-white"
                }`}
              >
                React Native
              </button>
              <button
                type="button"
                onClick={() => setCodeType("html")}
                className={`rounded-lg px-3 py-1 text-xs font-bold transition-all ${
                  codeType === "html" ? "bg-gold text-forest-deep shadow-xs" : "text-surface/70 hover:text-white"
                }`}
              >
                HTML
              </button>
            </div>
          </div>

          <div className="relative rounded-2xl border border-white/10 bg-[#0d1611] p-4 text-xs font-mono text-emerald-300">
            <button
              type="button"
              onClick={() => copyToClipboard(codeSnippets[codeType], "Code Snippet")}
              className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-sans font-medium text-white transition-all hover:bg-white/20"
            >
              <Copy className="h-3 w-3" />
              <span>Copy Code</span>
            </button>
            <pre className="overflow-x-auto p-2 leading-relaxed">{codeSnippets[codeType]}</pre>
          </div>
        </div>

        {/* Section 3: Brand Color System Matrix */}
        <div className="rounded-3xl border border-white/15 bg-surface/10 p-6 md:p-8 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2.5">
              <div className="rounded-xl bg-gold/20 p-2 text-gold-soft">
                <Palette className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-white">Brand Color System</h3>
                <p className="text-xs text-surface/70">Click any color card to copy its HEX code to your clipboard</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {BRAND_COLORS.map((color) => (
              <button
                key={color.hex}
                type="button"
                onClick={() => copyToClipboard(color.hex, color.name)}
                className="group flex flex-col justify-between rounded-2xl border border-white/10 p-4 text-left transition-all hover:scale-[1.02] hover:border-gold/50 shadow-md"
                style={{ backgroundColor: color.hex, color: color.textDark ? "#1a1714" : "#ffffff" }}
              >
                <div className="flex items-center justify-between w-full mb-8">
                  <span className="text-[11px] font-bold uppercase tracking-wider opacity-85">{color.name}</span>
                  <Copy className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <div className="font-mono text-sm font-bold">{color.hex}</div>
                  <div className="text-[11px] opacity-75 leading-tight">{color.role}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Section 4: Typography Specimen */}
        <div className="rounded-3xl border border-white/15 bg-surface/10 p-6 md:p-8 backdrop-blur-xl">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="rounded-xl bg-gold/20 p-2 text-gold-soft">
              <Type className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-white">Brand Typography</h3>
              <p className="text-xs text-surface/70">Curated Google Fonts pair for luxury wellness aesthetic</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Display Font Card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-soft">Display Serif</span>
                <span className="text-xs font-mono text-surface/60">Fraunces</span>
              </div>
              <p className="font-display text-2xl font-bold text-white mb-2">
                Ayurvedic Wellness & Vitality
              </p>
              <p className="text-xs text-surface/70 leading-relaxed">
                Used for primary page titles, luxury hero headers, and brand logotype typography.
              </p>
            </div>

            {/* Body Font Card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gold-soft">Body Sans</span>
                <span className="text-xs font-mono text-surface/60">Inter</span>
              </div>
              <p className="font-sans text-lg font-medium text-white mb-2">
                Vetted Practitioners & Instant Pass Access
              </p>
              <p className="text-xs text-surface/70 leading-relaxed">
                Used for UI controls, body text, form elements, and high-readability outdoor mobile views.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Fullscreen Lightbox Overlay Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 backdrop-blur-2xl animate-in fade-in">
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="absolute top-6 right-6 z-50 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white hover:bg-white/20"
            title="Close Fullscreen View"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="flex max-h-[90vh] max-w-[90vw] flex-col items-center justify-center p-6 text-center">
            <Image
              src={selectedVariant.src}
              alt={selectedVariant.name}
              width={selectedVariant.width}
              height={selectedVariant.height}
              priority
              className="h-auto max-h-[75vh] w-auto max-w-[85vw] object-contain drop-shadow-2xl"
            />
            <h2 className="mt-6 font-display text-2xl font-bold text-white">
              {selectedVariant.name}
            </h2>
            <p className="text-xs text-surface/70 mt-1">{selectedVariant.recommendedUse}</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 w-full p-6 text-center text-xs text-surface/50 border-t border-white/10 mt-12">
        © {new Date().getFullYear()} AyurPass Inc. • Vetted Wellness Infrastructure
      </footer>
    </main>
  );
}