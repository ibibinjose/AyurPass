"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button, EmptyState, ErrorNote, Field, Input, Textarea } from "@/components/ui";
import { CheckIcon, ShieldIcon } from "@/components/icons";
import type { Provider } from "@/lib/types";

const COMMON_ASSOCIATIONS = [
  { code: "AAA", name: "Australian Association of Ayurveda" },
  { code: "ATMS", name: "Australian Traditional-Medicine Society" },
  { code: "AAPNA", name: "Association of Ayurvedic Professionals of North America" },
  { code: "NAMA", name: "National Ayurvedic Medical Association" },
  { code: "AAC", name: "Ayurvedic Advisory Council" },
];

export default function VerificationPage() {
  const { user } = useAuth();
  const providerId = user?.provider?.id;

  const [provider, setProvider] = useState<Provider | null | undefined>(undefined);
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [licenceNumber, setLicenceNumber] = useState("");
  const [associations, setAssociations] = useState<string[]>([]);
  const [customAssociation, setCustomAssociation] = useState("");

  const [docFiles, setDocFiles] = useState<{ url: string; name: string; type: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!providerId) return;
    api
      .provider(providerId)
      .then((p) => {
        setProvider(p ?? null);
        if (p) {
          setRegistrationNumber(p.registrationNumber || "");
          setLicenceNumber(p.licenceNumber || "");
          const healthAuths = Array.isArray(p.healthAuthorities) ? p.healthAuthorities : [];
          setAssociations(healthAuths.map((h: { code?: string; name?: string }) => h.code || h.name).filter(Boolean) as string[]);
          const existingDocs = (p.brandProfile as Record<string, unknown> | null)?.verificationDocs;
          if (Array.isArray(existingDocs)) {
            setDocFiles(existingDocs);
          }
        }
      })
      .catch(() => setProvider(null));
  }, [providerId]);

  if (!user || user.role === "CONSUMER") {
    return <EmptyState title="Practitioner Dashboard" body="Please log in as a practice or practitioner to view verification." />;
  }

  if (provider === undefined) {
    return <div className="h-64 animate-pulse rounded-2xl bg-clay/70" />;
  }

  if (!provider) {
    return <EmptyState title="Practice listing not found" body="Create or claim a practice listing first." />;
  }

  const isVerified = provider.verificationStatus === "verified";
  const isPending = provider.verificationStatus === "pending";

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of files) {
        const res = await api.uploadImage(file);
        const doc = { url: res.url, name: file.name, type: file.type || "Document" };
        setDocFiles((prev) => [...prev, doc]);
      }
    } catch {
      setError("File upload failed. Please upload a valid document.");
    } finally {
      setUploading(false);
    }
  }

  function toggleAssociation(code: string) {
    setAssociations((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  }

  function addCustomAssoc() {
    if (!customAssociation.trim()) return;
    const clean = customAssociation.trim();
    if (!associations.includes(clean)) {
      setAssociations((prev) => [...prev, clean]);
    }
    setCustomAssociation("");
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!provider) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    const healthAuthorities = associations.map((code) => {
      const match = COMMON_ASSOCIATIONS.find((a) => a.code === code);
      return { code, name: match ? match.name : code, verified: true };
    });

    const updatedProfile = {
      ...((provider.brandProfile as Record<string, unknown> | null) || {}),
      verificationDocs: docFiles,
    };

    try {
      const res = await api.updateProvider(provider.id, {
        registrationNumber: registrationNumber.trim() || null,
        licenceNumber: licenceNumber.trim() || null,
        healthAuthorities,
        brandProfile: updatedProfile as Record<string, unknown>,
      });
      setProvider(res);
      setSuccess("Verification details updated successfully. Admin review is in progress.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update verification details.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="font-display text-3xl text-forest">Practice Verification & Credentials</h1>
        <p className="mt-1 text-ink-muted">
          Submit professional registration, council licences, and qualification documents to earn the Verified Practice mark.
        </p>
      </div>

      {/* Verification Status Banner */}
      <div
        className={`rounded-3xl border p-6 flex flex-wrap items-center justify-between gap-4 ${
          isVerified
            ? "border-emerald-200 bg-emerald-50/70 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
            : isPending
              ? "border-amber-200 bg-amber-50/80 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
              : "border-red-200 bg-red-50/70 text-red-900 dark:bg-red-950/40 dark:text-red-200"
        }`}
      >
        <div className="flex items-center gap-3">
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-full ${
              isVerified
                ? "bg-emerald-600 text-white"
                : isPending
                  ? "bg-amber-500 text-white"
                  : "bg-red-600 text-white"
            }`}
          >
            {isVerified ? <CheckIcon className="h-6 w-6" /> : <ShieldIcon className="h-6 w-6" />}
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold capitalize">
              Listing Status: {provider.verificationStatus}
            </h2>
            <p className="text-xs opacity-90">
              {isVerified
                ? "Your practice is fully verified. Patients see your official green verification tick."
                : isPending
                  ? "Your credentials are under review by the AyurPass verification board (24–48 hours)."
                  : "Verification was not approved. Please review details below and resubmit."}
            </p>
          </div>
        </div>
      </div>

      {error ? <ErrorNote message={error} /> : null}
      {success ? (
        <div className="rounded-2xl bg-emerald-100 p-4 text-sm font-medium text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200">
          {success}
        </div>
      ) : null}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Licensing & Registration Numbers */}
        <div className="rounded-3xl border border-hairline bg-surface p-6 space-y-4">
          <h3 className="font-display text-lg text-forest font-semibold">
            1. Registration & Operating Licences
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="AHPRA / Council / Board Registration Number" hint="Official registration code">
              <Input
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                placeholder="e.g. AHPRA-MED987654"
              />
            </Field>

            <Field label="Operating Permit / Council Licence" hint="Local health authority permit">
              <Input
                value={licenceNumber}
                onChange={(e) => setLicenceNumber(e.target.value)}
                placeholder="e.g. LIC-2026-0412"
              />
            </Field>
          </div>
        </div>

        {/* Association & Board Memberships */}
        <div className="rounded-3xl border border-hairline bg-surface p-6 space-y-4">
          <h3 className="font-display text-lg text-forest font-semibold">
            2. Professional Associations & Accreditation Boards
          </h3>
          <p className="text-xs text-ink-muted">
            Select all accredited associations your practice or practitioners hold active membership with:
          </p>
          <div className="flex flex-wrap gap-2.5">
            {COMMON_ASSOCIATIONS.map((assoc) => {
              const active = associations.includes(assoc.code);
              return (
                <button
                  key={assoc.code}
                  type="button"
                  onClick={() => toggleAssociation(assoc.code)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                    active
                      ? "border-forest bg-forest text-white"
                      : "border-hairline bg-surface text-ink-secondary hover:border-leaf"
                  }`}
                >
                  {assoc.code} · {assoc.name}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center gap-2 max-w-md">
            <Input
              value={customAssociation}
              onChange={(e) => setCustomAssociation(e.target.value)}
              placeholder="Other association (e.g. BAMS Board India)"
              className="text-xs"
            />
            <Button type="button" variant="ghost" onClick={addCustomAssoc} className="!text-xs">
              Add
            </Button>
          </div>
        </div>

        {/* Document Attachments */}
        <div className="rounded-3xl border border-hairline bg-surface p-6 space-y-4">
          <h3 className="font-display text-lg text-forest font-semibold">
            3. Qualification & Verification Documents
          </h3>
          <p className="text-xs text-ink-muted">
            Upload qualification certificates, practitioner diplomas, liability insurance, or photo ID (PDF, PNG, JPG).
          </p>

          <input
            type="file"
            accept=".pdf,.png,.jpg,.jpeg"
            multiple
            onChange={handleFileUpload}
            disabled={uploading}
            className="block w-full text-xs text-ink-secondary file:mr-3 file:rounded-full file:border-0 file:bg-forest file:px-4 file:py-2 file:text-xs file:font-semibold file:text-white hover:file:bg-forest-deep"
          />
          {uploading ? <p className="text-xs text-forest animate-pulse">Uploading file...</p> : null}

          {docFiles.length > 0 ? (
            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
                Uploaded Verification Files ({docFiles.length})
              </p>
              <ul className="divide-y divide-hairline rounded-2xl border border-hairline bg-clay/20 p-2">
                {docFiles.map((doc, idx) => (
                  <li key={idx} className="flex items-center justify-between p-2.5 text-xs">
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-forest hover:underline truncate max-w-md"
                    >
                      📄 {doc.name}
                    </a>
                    <button
                      type="button"
                      onClick={() => setDocFiles((prev) => prev.filter((_, i) => i !== idx))}
                      className="text-red-600 hover:underline font-medium text-[11px]"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-ink-muted italic">No verification documents attached yet.</p>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" variant="primary" disabled={saving}>
            {saving ? "Saving Verification Details…" : "Save & Submit Credentials"}
          </Button>
        </div>
      </form>
    </div>
  );
}
