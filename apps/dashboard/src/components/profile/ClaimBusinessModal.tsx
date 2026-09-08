"use client";

import { useEffect, useId, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api, ApiError } from "@/lib/api";
import { CLAIM_OPTIONS } from "@/lib/feedback";
import { Button, ErrorNote, Field, Input, Select, Textarea } from "@/components/ui";
import { CheckIcon, XIcon, ShieldIcon } from "@/components/icons";
import type { Provider } from "@/lib/types";

const ROLE_OPTIONS = [
  "Owner / Founder",
  "Director / Principal Practitioner",
  "Practice Manager / Clinic Administrator",
  "Authorized Representative",
  "Other",
];

export function ClaimBusinessModal({
  open,
  onClose,
  provider,
  professionalName,
  context = "practice",
}: {
  open: boolean;
  onClose: () => void;
  provider: Provider;
  /** When claiming from a practitioner public profile */
  professionalName?: string;
  context?: "practice" | "practitioner";
}) {
  const { user } = useAuth();
  const titleId = useId();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState(ROLE_OPTIONS[0]);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  const [verificationMethod, setVerificationMethod] = useState<string>(CLAIM_OPTIONS[0].id);
  const [registrationNumber, setRegistrationNumber] = useState(provider.registrationNumber || "");
  const [licenceNumber, setLicenceNumber] = useState(provider.licenceNumber || "");
  const [proofDetails, setProofDetails] = useState("");
  const [docFiles, setDocFiles] = useState<{ url: string; name: string }[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [refId, setRefId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (!active) return;
      setStep(1);
      setFullName(user?.fullName ?? "");
      setRole(ROLE_OPTIONS[0]);
      setContactEmail(user?.email ?? "");
      setContactPhone(user?.phone ?? "");
      setVerificationMethod(CLAIM_OPTIONS[0].id);
      setRegistrationNumber(provider.registrationNumber || "");
      setLicenceNumber(provider.licenceNumber || "");
      setProofDetails("");
      setDocFiles([]);
      setError(null);
      setDone(false);
      setRefId(null);
    };
    run();
    return () => {
      active = false;
    };
  }, [open, user, provider]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  const canProceedStep1 =
    fullName.trim().length >= 2 &&
    contactEmail.trim().includes("@") &&
    Boolean(role);

  const canSubmit =
    canProceedStep1 &&
    Boolean(verificationMethod);

  async function handleDocUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingDoc(true);
    setError(null);
    try {
      for (const file of files) {
        const res = await api.uploadImage(file);
        setDocFiles((prev) => [...prev, { url: res.url, name: file.name }]);
      }
    } catch {
      setError("Document upload failed. Please select a valid file.");
    } finally {
      setUploadingDoc(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || busy) return;
    setBusy(true);
    setError(null);

    const docUrlsFormatted = docFiles.length
      ? docFiles.map((d) => `• ${d.name}: ${d.url}`).join("\n")
      : null;

    const message = [
      `CLAIM BUSINESS REQUEST for "${provider.businessName}" (ID: ${provider.id})`,
      professionalName?.trim()
        ? `Practitioner profile: ${professionalName.trim()}`
        : null,
      context === "practitioner" ? `Claim context: practitioner profile` : null,
      `Claimant Name: ${fullName.trim()}`,
      `Role: ${role}`,
      `Contact Phone: ${contactPhone.trim() || "N/A"}`,
      `Verification Method: ${verificationMethod}`,
      registrationNumber.trim() ? `Registration No: ${registrationNumber.trim()}` : null,
      licenceNumber.trim() ? `Licence No: ${licenceNumber.trim()}` : null,
      proofDetails.trim() ? `Proof / Additional Info: ${proofDetails.trim()}` : null,
      docUrlsFormatted ? `Attached Verification Documents:\n${docUrlsFormatted}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    try {
      const res = await api.submitFeedback({
        kind: "claim",
        category: verificationMethod,
        message,
        targetType: "provider",
        targetId: provider.id,
        targetLabel: provider.businessName,
        pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
        contactEmail: contactEmail.trim(),
        contactName: fullName.trim(),
      });
      setRefId(res.id);
      setDone(true);
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Claim request submission failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center p-3 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-forest/50 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={onClose}
      />
      <div className="relative z-[1] max-h-[min(92vh,740px)] w-full max-w-lg overflow-y-auto overflow-x-hidden rounded-3xl border border-hairline bg-surface shadow-[0_24px_60px_rgba(36,56,46,0.2)]">
        <div className="sticky top-0 z-[1] flex items-start justify-between gap-3 border-b border-hairline bg-surface/95 px-5 py-4 backdrop-blur-sm">
          <div className="flex min-w-0 items-start gap-3">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-xs">
              <ShieldIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h2 id={titleId} className="font-display text-lg font-semibold text-forest">
                {context === "practitioner"
                  ? `Claim your profile${professionalName ? ` — ${professionalName}` : ""}`
                  : `Claim your profile — ${provider.businessName}`}
              </h2>
              <p className="text-xs font-medium text-ink-secondary">
                {context === "practitioner"
                  ? `Verify ownership of affiliated practice ${provider.businessName} to manage this listing & enquiries`
                  : "Verify ownership to manage directory listing & enquiries"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-ink-muted transition-colors hover:bg-clay/40 hover:text-forest"
            aria-label="Close dialog"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        {done ? (
          <div className="px-5 py-8 text-center sm:px-8">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
              <CheckIcon className="h-7 w-7" />
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold text-forest">
              Claim Request Submitted
            </h3>
            <p className="mt-2 text-sm font-medium leading-relaxed text-ink-secondary">
              Thank you for verifying your claim for <strong className="text-forest">{provider.businessName}</strong>.
              Our team will review your credentials within 24 to 48 hours.
            </p>
            {refId ? (
              <div className="mt-4 rounded-2xl border border-hairline/80 bg-clay/20 px-4 py-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
                  Claim Reference Number
                </p>
                <p className="mt-1 font-mono text-sm font-semibold text-forest">{refId}</p>
              </div>
            ) : null}
            <div className="mt-6 flex justify-center">
              <Button type="button" variant="primary" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
            {/* Step Indicator */}
            <div className="flex items-center justify-between border-b border-hairline pb-4">
              {[
                { s: 1, label: "1. Claimant Info" },
                { s: 2, label: "2. Verification Proof" },
                { s: 3, label: "3. Confirm & Submit" },
              ].map(({ s, label }) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    if (s === 1 || (s === 2 && canProceedStep1) || (s === 3 && canSubmit)) {
                      setStep(s as 1 | 2 | 3);
                    }
                  }}
                  className={`text-xs font-semibold tracking-tight transition-colors ${
                    step === s
                      ? "text-forest border-b-2 border-forest pb-1 font-bold"
                      : s < step
                        ? "text-emerald-700 hover:underline"
                        : "text-ink-muted opacity-60 cursor-not-allowed"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {error ? <ErrorNote message={error} /> : null}

            {step === 1 && (
              <div className="space-y-4">
                <p className="text-xs font-medium text-ink-secondary">
                  Provide your contact details and official capacity at this practice.
                </p>
                <Field label="Your Full Name" required>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Maya Sharma"
                    required
                  />
                </Field>

                <Field label="Business Role / Capacity" required>
                  <Select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Official Contact Email" required hint="Email associated with your business or website domain">
                  <Input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="maya@clinicname.com"
                    required
                  />
                </Field>

                <Field label="Contact Phone Number" hint="For quick verification confirmation">
                  <Input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="+61 400 000 000"
                  />
                </Field>

                <div className="flex justify-end pt-2">
                  <Button
                    type="button"
                    variant="primary"
                    disabled={!canProceedStep1}
                    onClick={() => setStep(2)}
                  >
                    Next: Verification Method →
                  </Button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <p className="text-xs font-medium text-ink-secondary">
                  Select how you would like to verify your ownership of this business.
                </p>

                <Field label="Verification Method" required>
                  <Select
                    value={verificationMethod}
                    onChange={(e) => setVerificationMethod(e.target.value)}
                  >
                    {CLAIM_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                </Field>

                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="AHPRA / Reg. Number" hint="Optional">
                    <Input
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      placeholder="e.g. MED0001234"
                    />
                  </Field>

                  <Field label="Operating Licence / Permit" hint="Optional">
                    <Input
                      value={licenceNumber}
                      onChange={(e) => setLicenceNumber(e.target.value)}
                      placeholder="e.g. LIC-98765"
                    />
                  </Field>
                </div>

                <Field label="Verification Proof & Links" hint="Include website URL, official social link, or verification details">
                  <Textarea
                    rows={3}
                    value={proofDetails}
                    onChange={(e) => setProofDetails(e.target.value)}
                    placeholder="e.g. I am listed as principal practitioner on clinic website https://example.com/team..."
                  />
                </Field>

                <Field label="Attach Verification Documents" hint="Upload qualification certificates, photo ID, or operating permits (PDF, PNG, JPG)">
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      multiple
                      onChange={handleDocUpload}
                      disabled={uploadingDoc}
                      className="block w-full text-xs text-ink-secondary file:mr-3 file:rounded-full file:border-0 file:bg-forest file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white hover:file:bg-forest-deep"
                    />
                    {uploadingDoc && <p className="text-xs text-forest animate-pulse">Uploading document...</p>}
                    {docFiles.length > 0 && (
                      <ul className="space-y-1 rounded-xl bg-clay/30 p-2 text-xs">
                        {docFiles.map((d, i) => (
                          <li key={i} className="flex items-center justify-between text-forest">
                            <span className="truncate font-medium">📄 {d.name}</span>
                            <span className="text-[10px] text-emerald-700 font-semibold">Uploaded</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Field>

                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep(1)}
                  >
                    ← Back
                  </Button>
                  <Button
                    type="button"
                    variant="primary"
                    onClick={() => setStep(3)}
                  >
                    Next: Review Claim →
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-hairline/90 bg-clay/15 p-4 space-y-2.5 text-sm">
                  <div className="flex justify-between border-b border-hairline/50 pb-2">
                    <span className="text-xs font-medium text-ink-muted">Business:</span>
                    <span className="font-semibold text-forest">{provider.businessName}</span>
                  </div>
                  <div className="flex justify-between border-b border-hairline/50 pb-2">
                    <span className="text-xs font-medium text-ink-muted">Claimant:</span>
                    <span className="font-medium text-forest">{fullName} ({role})</span>
                  </div>
                  <div className="flex justify-between border-b border-hairline/50 pb-2">
                    <span className="text-xs font-medium text-ink-muted">Email:</span>
                    <span className="font-medium text-forest">{contactEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs font-medium text-ink-muted">Verification Method:</span>
                    <span className="font-medium text-forest">
                      {CLAIM_OPTIONS.find((c) => c.id === verificationMethod)?.label || verificationMethod}
                    </span>
                  </div>
                </div>

                <p className="text-xs leading-relaxed text-ink-secondary">
                  By submitting this claim, you confirm under penalty of account suspension that you are authorized to manage and represent <strong>{provider.businessName}</strong> on AyurPass.
                </p>

                <div className="flex justify-between pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={busy}
                    onClick={() => setStep(2)}
                  >
                    ← Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={!canSubmit || busy}
                  >
                    {busy ? "Submitting Claim..." : "Submit Claim Request"}
                  </Button>
                </div>
              </div>
            )}
          </form>
        )}
      </div>
    </div>
  );
}