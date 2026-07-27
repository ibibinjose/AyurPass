/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { api, formatLocalizedPrice } from "@/lib/api";
import type { ApplicationStatus, EmploymentType, JobApplication, JobListing, ServiceCategory } from "@/lib/types";
import {
  DashCard,
  DashHeader,
} from "@/components/dashboard/DashboardKit";
import { PencilIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { Button, EmptyState, ErrorNote, Field, Input, Select, Textarea } from "@/components/ui";

const CATEGORIES: ServiceCategory[] = [
  "AYURVEDA",
  "YOGA",
  "SPA",
  "MEDITATION",
  "FITNESS",
  "NUTRITION",
  "COACHING",
  "CONSULTATION",
];

const EMPLOYMENT_TYPES: { id: EmploymentType; label: string }[] = [
  { id: "FULL_TIME", label: "Full-Time" },
  { id: "PART_TIME", label: "Part-Time" },
  { id: "CONTRACT", label: "Contract" },
  { id: "LOCUM", label: "Locum / Casual" },
  { id: "CASUAL", label: "Casual" },
];

interface FormState {
  id?: string;
  title: string;
  category: ServiceCategory;
  employmentType: EmploymentType;
  locationType: string;
  city: string;
  country: string;
  salaryMin: string;
  salaryMax: string;
  currency: string;
  experienceYears: string;
  description: string;
  requirements: string;
}

const BLANK: FormState = {
  title: "",
  category: "AYURVEDA",
  employmentType: "FULL_TIME",
  locationType: "on_site",
  city: "Sydney",
  country: "Australia",
  salaryMin: "",
  salaryMax: "",
  currency: "AUD",
  experienceYears: "",
  description: "",
  requirements: "",
};

export default function JobsPage() {
  const { user } = useAuth();
  const { currency: userCurrency } = useLocation();
  const provider = user?.provider ?? user?.professional?.provider ?? null;
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form modal/drawer state
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(BLANK);

  // Applications Drawer state
  const [activeJobForApps, setActiveJobForApps] = useState<JobListing | null>(null);
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);

  const providerId = provider?.id;

  useEffect(() => {
    if (!providerId) return;
    let isMounted = true;
    setError(null);
    api.providerJobs(providerId)
      .then((res) => {
        if (isMounted) setJobs(res);
      })
      .catch((e: unknown) => {
        if (isMounted) setError((e as Error)?.message ?? "Failed to load job listings.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [providerId]);

  const refreshJobs = async () => {
    if (!providerId) return;
    try {
      const res = await api.providerJobs(providerId);
      setJobs(res);
    } catch (e: unknown) {
      setError((e as Error)?.message ?? "Failed to refresh job listings.");
    }
  };

  const openNew = () => {
    setForm(BLANK);
    setFormErr(null);
    setOpen(true);
  };

  const openEdit = (job: JobListing) => {
    setForm({
      id: job.id,
      title: job.title,
      category: job.category,
      employmentType: job.employmentType,
      locationType: job.locationType || "on_site",
      city: job.city || "",
      country: job.country || "",
      salaryMin: job.salaryMin !== undefined && job.salaryMin !== null ? String(job.salaryMin) : "",
      salaryMax: job.salaryMax !== undefined && job.salaryMax !== null ? String(job.salaryMax) : "",
      currency: job.currency || "AUD",
      experienceYears: job.experienceYears !== undefined && job.experienceYears !== null ? String(job.experienceYears) : "",
      description: job.description,
      requirements: job.requirements || "",
    });
    setFormErr(null);
    setOpen(true);
  };

  const openApplications = async (job: JobListing) => {
    setActiveJobForApps(job);
    setAppsLoading(true);
    try {
      const res = await api.jobApplications(job.id);
      setApplications(res);
    } catch {
      setApplications([]);
    } finally {
      setAppsLoading(false);
    }
  };

  const handleStatusChange = async (jobId: string, newStatus: "OPEN" | "CLOSED") => {
    try {
      await api.updateJob(jobId, { status: newStatus });
      await refreshJobs();
    } catch (err: unknown) {
      alert((err as Error).message || "Failed to update job status.");
    }
  };

  const handleDelete = async (jobId: string) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return;
    try {
      await api.deleteJob(jobId);
      await refreshJobs();
    } catch (err: unknown) {
      alert((err as Error).message || "Failed to delete job posting.");
    }
  };

  const handleAppStatusChange = async (appId: string, status: ApplicationStatus) => {
    if (!activeJobForApps) return;
    try {
      await api.updateApplicationStatus(appId, status);
      const updated = await api.jobApplications(activeJobForApps.id);
      setApplications(updated);
    } catch (err: unknown) {
      alert((err as Error).message || "Failed to update application status.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!providerId) return;
    if (!form.title.trim()) {
      setFormErr("Job title is required.");
      return;
    }
    if (!form.description.trim()) {
      setFormErr("Job description is required.");
      return;
    }

    try {
      setSaving(true);
      setFormErr(null);

      const payload = {
        providerId,
        title: form.title.trim(),
        category: form.category,
        employmentType: form.employmentType,
        locationType: form.locationType,
        city: form.city.trim() || undefined,
        country: form.country.trim() || undefined,
        salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
        currency: form.currency,
        experienceYears: form.experienceYears ? Number(form.experienceYears) : undefined,
        description: form.description.trim(),
        requirements: form.requirements.trim() || undefined,
      };

      if (form.id) {
        await api.updateJob(form.id, payload);
      } else {
        await api.createJob(payload);
      }

      setOpen(false);
      await refreshJobs();
    } catch (e: unknown) {
      setFormErr((e as Error)?.message ?? "Failed to save job posting.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <DashHeader
        title="Jobs & Hiring"
        description="Post career opportunities, manage open positions, and review candidate applications."
        action={
          <Button onClick={openNew} variant="primary">
            <PlusIcon className="mr-1.5 h-4 w-4" /> Post New Job
          </Button>
        }
      />

      {error ? <ErrorNote message={error} /> : null}

      {/* Main Job Listings Grid */}
      <DashCard>
        {loading ? (
          <div className="p-8 text-center text-sm text-ink-muted">Loading job postings...</div>
        ) : jobs.length === 0 ? (
          <EmptyState
            title="No job postings yet"
            body="Create your first position for Ayurvedic Doctors, Panchakarma Therapists, Yoga Instructors, or Spa Staff."
            action={
              <Button onClick={openNew} variant="primary">
                <PlusIcon className="mr-1.5 h-4 w-4" /> Post Position
              </Button>
            }
          />
        ) : (
          <div className="divide-y divide-hairline">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center rounded-full bg-forest-50 px-2.5 py-0.5 text-xs font-semibold text-forest-700">
                      {job.category}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-clay px-2.5 py-0.5 text-xs font-medium text-ink-muted">
                      {job.employmentType.replace("_", " ")}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        job.status === "OPEN"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {job.title}
                  </h3>
                  <p className="text-xs text-ink-muted">
                    {[job.city, job.country].filter(Boolean).join(", ") || job.locationType} ·{" "}
                    {job.salaryMin
                      ? `${formatLocalizedPrice(job.salaryMin, userCurrency, job.currency || "AUD")}${
                          job.salaryMax ? ` - ${formatLocalizedPrice(job.salaryMax, userCurrency, job.currency || "AUD")}` : "+"
                        }`
                      : "Competitive salary"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                  <Button
                    onClick={() => openApplications(job)}
                    variant="soft"
                    className="text-xs"
                  >
                    Applications ({job.applicationCount ?? 0})
                  </Button>
                  {job.status === "OPEN" ? (
                    <Button
                      onClick={() => handleStatusChange(job.id, "CLOSED")}
                      variant="ghost"
                      className="text-xs"
                    >
                      Close
                    </Button>
                  ) : (
                    <Button
                      onClick={() => handleStatusChange(job.id, "OPEN")}
                      variant="soft"
                      className="text-xs"
                    >
                      Re-open
                    </Button>
                  )}
                  <Button onClick={() => openEdit(job)} variant="ghost" className="text-xs">
                    <PencilIcon className="h-3.5 w-3.5" />
                  </Button>
                  <Button onClick={() => handleDelete(job.id)} variant="danger" className="text-xs">
                    <TrashIcon className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </DashCard>

      {/* Post / Edit Job Drawer / Modal */}
      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-surface p-6 shadow-2xl">
            <h2 className="font-display text-xl font-bold text-foreground">
              {form.id ? "Edit Position" : "Post New Position"}
            </h2>
            <p className="mt-1 text-xs text-ink-muted">
              Position will be immediately published to the AyurPass mobile job board and highlighted with a &quot;WE&apos;RE HIRING!&quot; sticker on your practice page.
            </p>

            {formErr ? <ErrorNote message={formErr} /> : null}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <Field label="Job Title *">
                <Input
                  required
                  placeholder="e.g. Lead Ayurvedic Doctor, Senior Yoga Master, Spa Therapist"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Category">
                  <Select
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as ServiceCategory }))}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </Select>
                </Field>

                <Field label="Employment Type">
                  <Select
                    value={form.employmentType}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, employmentType: e.target.value as EmploymentType }))
                    }
                  >
                    {EMPLOYMENT_TYPES.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="City">
                  <Input
                    placeholder="Sydney"
                    value={form.city}
                    onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  />
                </Field>
                <Field label="Min Salary ($)">
                  <Input
                    type="number"
                    placeholder="85000"
                    value={form.salaryMin}
                    onChange={(e) => setForm((f) => ({ ...f, salaryMin: e.target.value }))}
                  />
                </Field>
                <Field label="Max Salary ($)">
                  <Input
                    type="number"
                    placeholder="110000"
                    value={form.salaryMax}
                    onChange={(e) => setForm((f) => ({ ...f, salaryMax: e.target.value }))}
                  />
                </Field>
              </div>

              <Field label="Job Description *">
                <Textarea
                  required
                  rows={4}
                  placeholder="Responsibilities, clinical environment, consultation flow, team structure..."
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </Field>

              <Field label="Requirements & Qualifications">
                <Textarea
                  rows={3}
                  placeholder="BAMS / MD degree, registration with health board, years of clinical practice..."
                  value={form.requirements}
                  onChange={(e) => setForm((f) => ({ ...f, requirements: e.target.value }))}
                />
              </Field>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-hairline">
                <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? "Saving..." : form.id ? "Update Job" : "Publish Job"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {/* Applications Drawer */}
      {activeJobForApps ? (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm">
          <div className="h-full w-full max-w-xl overflow-y-auto bg-surface p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-hairline pb-4">
              <div>
                <h2 className="font-display text-lg font-bold text-foreground">
                  Applicants: {activeJobForApps.title}
                </h2>
                <p className="text-xs text-ink-muted">
                  Review submitted CVs and cover notes from professionals.
                </p>
              </div>
              <Button onClick={() => setActiveJobForApps(null)} variant="ghost" className="text-xs">
                Close
              </Button>
            </div>

            <div className="mt-4 space-y-4">
              {appsLoading ? (
                <div className="py-8 text-center text-sm text-ink-muted">Loading applications...</div>
              ) : applications.length === 0 ? (
                <EmptyState
                  title="No applications received yet"
                  body="When professionals apply via the mobile app, their details will appear here."
                />
              ) : (
                applications.map((app) => (
                  <div key={app.id} className="rounded-xl border border-hairline bg-clay p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-display font-semibold text-foreground">{app.fullName}</h4>
                        <p className="text-xs text-ink-muted">{app.email} {app.phone ? `· ${app.phone}` : ""}</p>
                      </div>
                      <span className="rounded-full bg-forest-50 px-2.5 py-0.5 text-xs font-semibold text-forest-700">
                        {app.status}
                      </span>
                    </div>

                    {app.experienceYears ? (
                      <p className="text-xs font-medium text-ink-secondary">
                        Experience: {app.experienceYears} years
                      </p>
                    ) : null}

                    {app.coverNote ? (
                      <div className="rounded-lg bg-surface p-3 text-xs text-ink-secondary">
                        <p className="font-semibold text-ink-muted mb-1">Cover Note:</p>
                        {app.coverNote}
                      </div>
                    ) : null}

                    {app.resumeUrl ? (
                      <a
                        href={app.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-xs font-semibold text-forest hover:underline"
                      >
                        📄 View Attached CV / Resume
                      </a>
                    ) : null}

                    <div className="flex items-center gap-1.5 pt-2 border-t border-hairline">
                      <span className="text-xs font-medium text-ink-muted">Move Status:</span>
                      {(["SHORTLISTED", "HIRED", "REJECTED"] as ApplicationStatus[]).map((st) => (
                        <button
                          key={st}
                          onClick={() => handleAppStatusChange(app.id, st)}
                          className={`rounded px-2 py-0.5 text-xs font-medium border ${
                            app.status === st
                              ? "bg-forest text-white border-forest"
                              : "bg-surface text-ink-muted hover:bg-gray-100"
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
