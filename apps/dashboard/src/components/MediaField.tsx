"use client";

import { useEffect, useId, useRef, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { resolveMediaUrl, validateImageLink } from "@/lib/media";
import { Button, Field, Input } from "@/components/ui";

type Mode = "upload" | "link";

const MAX_BYTES = 5 * 1024 * 1024;
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

function validateImageFile(file: File): string | null {
  if (!file.type.startsWith("image/")) {
    return "Please choose an image file (JPEG, PNG, WebP or GIF).";
  }
  if (file.size > MAX_BYTES) {
    return "Image must be 5 MB or smaller.";
  }
  return null;
}

/**
 * Image field with Upload or paste-URL modes.
 * Used for avatars, brand marks, covers, product/service/retreat images.
 *
 * Set `deferUpload` when the user is not authenticated yet (e.g. list-your-business):
 * the file is kept locally for preview and handed to the parent via `onDeferredFile`.
 */
export function MediaField({
  label,
  value,
  onChange,
  hint,
  shape = "rect",
  disabled,
  deferUpload = false,
  onDeferredFile,
  recommended,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
  /**
   * avatar = circle; brand = square rounded mark; cover = wide banner; rect = square-ish
   */
  shape?: "avatar" | "brand" | "cover" | "rect";
  disabled?: boolean;
  /** Keep the file locally until the parent uploads after auth. */
  deferUpload?: boolean;
  onDeferredFile?: (file: File | null) => void;
  /** e.g. "512×512 px" shown under the uploader */
  recommended?: string;
}) {
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const blobUrlRef = useRef<string | null>(null);
  // Prefer Upload mode for local/blob or empty; Link only when a remote URL is already set
  const [mode, setMode] = useState<Mode>(() => {
    if (!value || value.startsWith("blob:")) return "upload";
    return "link";
  });
  const [linkDraft, setLinkDraft] = useState(() =>
    value && !value.startsWith("blob:") ? value : "",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewBroken, setPreviewBroken] = useState(false);

  const displayUrl = resolveMediaUrl(value) || value || "";

  useEffect(() => {
    setPreviewBroken(false);
  }, [displayUrl]);

  // Keep link draft in sync when parent value changes from outside
  useEffect(() => {
    if (mode === "link" && value && !value.startsWith("blob:")) {
      setLinkDraft(value);
    }
  }, [value, mode]);

  useEffect(() => {
    return () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  function clearBlobPreview() {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
  }

  function clearValue() {
    clearBlobPreview();
    onDeferredFile?.(null);
    setLinkDraft("");
    setError(null);
    setPreviewBroken(false);
    onChange("");
  }

  async function onFile(file: File | null | undefined) {
    if (!file) return;
    setError(null);
    const invalid = validateImageFile(file);
    if (invalid) {
      setError(invalid);
      return;
    }

    if (deferUpload) {
      clearBlobPreview();
      const objectUrl = URL.createObjectURL(file);
      blobUrlRef.current = objectUrl;
      onDeferredFile?.(file);
      onChange(objectUrl);
      setMode("upload");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }

    setBusy(true);
    try {
      const res = await api.uploadImage(file);
      clearBlobPreview();
      onDeferredFile?.(null);
      // Stay on Upload mode — show preview of the uploaded image, not a raw URL field
      onChange(res.url);
      setLinkDraft(res.url);
      setMode("upload");
      setPreviewBroken(false);
    } catch (e) {
      setError(
        e instanceof ApiError || e instanceof Error
          ? e.message
          : "Upload failed. Try again or paste a URL.",
      );
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function applyLink() {
    const raw = linkDraft.trim();
    const invalid = validateImageLink(raw);
    if (invalid) {
      setError(invalid);
      return;
    }
    clearBlobPreview();
    onDeferredFile?.(null);
    const resolved = resolveMediaUrl(raw) || raw;
    onChange(resolved);
    setError(null);
    setPreviewBroken(false);
  }

  const previewClass =
    shape === "avatar"
      ? "h-24 w-24 rounded-full object-cover"
      : shape === "brand"
        ? "h-24 w-24 rounded-2xl object-cover ring-1 ring-hairline"
        : shape === "cover"
          ? "h-28 w-full rounded-xl object-cover"
          : "h-28 w-28 rounded-xl object-cover";

  const emptyDropClass =
    shape === "cover"
      ? "min-h-[7.5rem]"
      : shape === "brand" || shape === "avatar"
        ? "min-h-[8.5rem]"
        : "min-h-[7rem]";

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <div className="inline-flex rounded-full border border-hairline bg-surface p-0.5">
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setMode("upload");
              setError(null);
            }}
            className={`rounded-full px-3 py-1 text-[11px] font-bold ${
              mode === "upload" ? "bg-forest text-white" : "text-ink-muted"
            }`}
          >
            Upload
          </button>
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              setMode("link");
              setError(null);
              if (value && !value.startsWith("blob:")) setLinkDraft(value);
            }}
            className={`rounded-full px-3 py-1 text-[11px] font-bold ${
              mode === "link" ? "bg-forest text-white" : "text-ink-muted"
            }`}
          >
            Link
          </button>
        </div>
      </div>
      {hint ? <p className="text-xs font-medium text-ink-muted">{hint}</p> : null}

      {mode === "upload" ? (
        <div
          className={`rounded-xl border border-dashed border-hairline bg-clay/25 px-4 py-5 text-center ${emptyDropClass} flex flex-col items-center justify-center`}
        >
          <input
            ref={fileRef}
            id={inputId}
            type="file"
            accept={ACCEPT}
            className="sr-only"
            disabled={disabled || busy}
            onChange={(e) => void onFile(e.target.files?.[0])}
          />
          {!value ? (
            <div
              className={`mb-3 flex items-center justify-center border border-dashed border-hairline/80 bg-surface/60 ${
                shape === "cover"
                  ? "h-12 w-full max-w-[12rem] rounded-lg"
                  : shape === "avatar"
                    ? "h-14 w-14 rounded-full"
                    : "h-14 w-14 rounded-2xl"
              }`}
              aria-hidden
            >
              <span className="text-[10px] font-bold uppercase tracking-wide text-ink-muted">
                {shape === "cover" ? "Banner" : shape === "brand" ? "Mark" : "Image"}
              </span>
            </div>
          ) : null}
          <label
            htmlFor={inputId}
            className={`inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full bg-forest px-5 text-sm font-semibold text-white ${
              busy || disabled ? "opacity-60" : "hover:bg-forest-deep"
            }`}
          >
            {busy
              ? "Uploading…"
              : value
                ? "Replace image"
                : shape === "brand"
                  ? "Add brand mark"
                  : shape === "cover"
                    ? "Add cover image"
                    : "Choose image"}
          </label>
          <p className="mt-2 text-[11px] font-medium text-ink-muted">
            JPEG, PNG, WebP or GIF · max 5 MB
            {recommended ? ` · ${recommended}` : ""}
            {deferUpload ? " · uploads when you publish" : ""}
          </p>
          {value && !value.startsWith("blob:") ? (
            <p className="mt-1.5 text-[11px] font-semibold text-forest">Image ready — save the form to keep it.</p>
          ) : null}
        </div>
      ) : (
        <div className="space-y-2">
          <Field
            label="Image URL"
            hint="Paste a direct image link (https://…). Works with CDN links from LinkedIn, X, Instagram, your website, etc."
          >
            <Input
              type="url"
              value={linkDraft}
              disabled={disabled}
              onChange={(e) => {
                setLinkDraft(e.target.value);
                setError(null);
              }}
              onBlur={() => {
                if (linkDraft.trim() && linkDraft.trim() !== value) applyLink();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyLink();
                }
              }}
              placeholder="https://media.example.com/photo.jpg"
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              disabled={disabled || !linkDraft.trim()}
              onClick={applyLink}
            >
              Use this link
            </Button>
            {value ? (
              <Button type="button" variant="ghost" disabled={disabled} onClick={clearValue}>
                Clear
              </Button>
            ) : null}
          </div>
        </div>
      )}

      {displayUrl && !previewBroken ? (
        <div className="flex flex-wrap items-end gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayUrl}
            alt=""
            className={`border border-hairline bg-clay ${previewClass}`}
            onError={() => setPreviewBroken(true)}
          />
          {mode === "upload" ? (
            <Button
              type="button"
              variant="ghost"
              className="!text-xs"
              disabled={disabled}
              onClick={clearValue}
            >
              Remove
            </Button>
          ) : null}
        </div>
      ) : null}

      {previewBroken && value ? (
        <div
          className={`flex items-center justify-center border border-dashed border-hairline bg-clay/40 text-xs font-medium text-ink-muted ${previewClass}`}
        >
          Preview unavailable
        </div>
      ) : null}

      {error ? (
        <p className="text-xs font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Multi-image gallery with upload + URL add. */
export function MediaGalleryField({
  label,
  values,
  onChange,
  hint,
  max = 12,
}: {
  label: string;
  values: string[];
  onChange: (urls: string[]) => void;
  hint?: string;
  max?: number;
}) {
  const [urlDraft, setUrlDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  async function onFiles(list: FileList | null) {
    if (!list?.length) return;
    setError(null);
    const remaining = max - values.length;
    if (remaining <= 0) {
      setError(`Maximum ${max} images.`);
      return;
    }
    const files = Array.from(list).slice(0, remaining);
    setBusy(true);
    try {
      if (files.length === 1) {
        const res = await api.uploadImage(files[0]);
        onChange([...values, res.url]);
      } else {
        const res = await api.uploadImages(files);
        onChange([...values, ...res.urls].slice(0, max));
      }
    } catch (e) {
      setError(
        e instanceof ApiError || e instanceof Error ? e.message : "Upload failed.",
      );
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function addUrl() {
    const u = urlDraft.trim();
    if (!u) return;
    const invalid = validateImageLink(u);
    if (invalid) {
      setError(invalid);
      return;
    }
    if (values.length >= max) {
      setError(`Maximum ${max} images.`);
      return;
    }
    onChange([...values, resolveMediaUrl(u) || u]);
    setUrlDraft("");
    setError(null);
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        {hint ? <p className="mt-0.5 text-xs font-medium text-ink-muted">{hint}</p> : null}
      </div>

      {values.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {values.map((url, i) => {
            const src = resolveMediaUrl(url) || url;
            return (
              <div key={`${url}-${i}`} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={src}
                  alt=""
                  className="h-20 w-20 rounded-xl border border-hairline object-cover"
                />
                <button
                  type="button"
                  className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-forest text-[10px] font-bold text-white shadow"
                  onClick={() => onChange(values.filter((_, j) => j !== i))}
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <input
          ref={fileRef}
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          multiple
          className="sr-only"
          disabled={busy || values.length >= max}
          onChange={(e) => void onFiles(e.target.files)}
        />
        <label
          htmlFor={inputId}
          className={`inline-flex min-h-10 cursor-pointer items-center rounded-full bg-forest px-4 text-sm font-semibold text-white ${
            busy || values.length >= max ? "opacity-50" : "hover:bg-forest-deep"
          }`}
        >
          {busy ? "Uploading…" : "Upload images"}
        </label>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <Field label="Or paste image URL" hint="Direct https image link (CDN, website, social media).">
            <Input
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              placeholder="https://…"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addUrl();
                }
              }}
            />
          </Field>
        </div>
        <Button type="button" variant="ghost" onClick={addUrl} disabled={!urlDraft.trim()}>
          Add URL
        </Button>
      </div>
      {error ? (
        <p className="text-xs font-medium text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
