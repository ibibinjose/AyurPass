"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { HealthAuthorityBadge } from "@/lib/types";
import { HEALTH_AUTHORITY_PRESETS, normalizeAuthorities } from "@/lib/credentials";
import {
  HANDLE_NAMESPACES,
  PROFESSIONAL_TITLE_KINDS,
  defaultNamespaceForTitleKind,
  normalizeHandle,
  isValidHandle,
  isReservedRootHandle,
} from "@ayurpass/shared";
import { practitionerPath } from "@/lib/paths";
import {
  DashCard,
  DashFormActions,
  DashHeader,
  DashStickySave,
} from "@/components/dashboard/DashboardKit";
import { SettingsLivePreview } from "@/components/dashboard/DashboardPreview";
import { MediaField } from "@/components/MediaField";
import { Button, ErrorNote, Field, Input, Select, SuccessNote } from "@/components/ui";
import { CheckCircleIcon, ShieldIcon, SparkleIcon } from "@/components/icons";

const ROLE_LABEL: Record<string, string> = {
  CONSUMER: "Seeker (Member)",
  PROFESSIONAL: "Ayurvedic Practitioner",
  PROVIDER_ADMIN: "Practice & Sanctuary Admin",
  PLATFORM_ADMIN: "Platform Administrator",
};

const COVER_PRESETS = [
  {
    name: "Kerala Herbarium",
    url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80",
  },
  {
    name: "Himalayan Sanctuary",
    url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1600&q=80",
  },
  {
    name: "Botanical Copper",
    url: "https://images.unsplash.com/photo-1512290900672-1f4864119ec8?auto=format&fit=crop&w=1600&q=80",
  },
  {
    name: "Zen Bamboo Grove",
    url: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1600&q=80",
  },
];

export default function SettingsPage() {
  const { user, refreshProfile } = useAuth();
  const professional = user?.professional ?? null;
  const hasPractice = Boolean(user?.provider ?? professional?.provider);

  // Profile details
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");

  // Practitioner details
  const [title, setTitle] = useState("");
  const [titleKind, setTitleKind] = useState("");
  const [handle, setHandle] = useState("");
  const [handleNamespace, setHandleNamespace] = useState("pro");
  const [vanityHandle, setVanityHandle] = useState("");
  const [vanityStatus, setVanityStatus] = useState("none");
  const [requestVanity, setRequestVanity] = useState(false);
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [licenceNumber, setLicenceNumber] = useState("");
  const [authorityCodes, setAuthorityCodes] = useState<string[]>([]);
  const [customAuthority, setCustomAuthority] = useState("");

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Form states
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [baseline, setBaseline] = useState<string>("");

  function snapshot(data: {
    fullName: string;
    phone: string;
    avatarUrl: string;
    coverImageUrl: string;
    title: string;
    titleKind: string;
    handle: string;
    handleNamespace: string;
    vanityHandle: string;
    requestVanity: boolean;
    registrationNumber: string;
    licenceNumber: string;
    authorityCodes: string[];
    customAuthority: string;
  }) {
    return JSON.stringify({
      fullName: data.fullName.trim(),
      phone: data.phone.trim(),
      avatarUrl: data.avatarUrl.trim(),
      coverImageUrl: data.coverImageUrl.trim(),
      title: data.title.trim(),
      titleKind: data.titleKind,
      handle: data.handle.trim().toLowerCase(),
      handleNamespace: data.handleNamespace,
      vanityHandle: data.vanityHandle.trim().toLowerCase(),
      requestVanity: data.requestVanity,
      registrationNumber: data.registrationNumber.trim(),
      licenceNumber: data.licenceNumber.trim(),
      authorityCodes: [...data.authorityCodes].sort(),
      customAuthority: data.customAuthority.trim(),
    });
  }

  function markDirty() {
    setDirty(true);
    setSaved(false);
  }

  // Load user profile & persistent cover image
  useEffect(() => {
    if (!user) return;
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (!active) return;

      // Check user.coverImageUrl first, then fallback to provider brandProfile
      const initialCover =
        (user.coverImageUrl && user.coverImageUrl.trim()) ||
        (user.provider?.brandProfile?.coverImageUrl && user.provider.brandProfile.coverImageUrl.trim()) ||
        (professional?.provider?.brandProfile?.coverImageUrl &&
          professional.provider.brandProfile.coverImageUrl.trim()) ||
        "";

      const next = {
        fullName: user.fullName ?? "",
        phone: user.phone ?? "",
        avatarUrl: user.avatarUrl ?? "",
        coverImageUrl: initialCover,
        title: "",
        titleKind: "",
        handle: "",
        handleNamespace: "pro",
        vanityHandle: "",
        requestVanity: false,
        registrationNumber: "",
        licenceNumber: "",
        authorityCodes: [] as string[],
        customAuthority: "",
      };
      setFullName(next.fullName);
      setPhone(next.phone);
      setAvatarUrl(next.avatarUrl);
      setCoverImageUrl((prev) => (initialCover ? initialCover : prev));

      if (!professional?.id) {
        setBaseline(snapshot(next));
        setDirty(false);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [
    user,
    user?.coverImageUrl,
    professional?.id,
    professional?.provider?.brandProfile?.coverImageUrl,
  ]);

  // Load professional profile if exists
  useEffect(() => {
    if (!professional?.id || !user) return;
    api
      .publicProfessionalsByProvider(professional.providerId)
      .then((list) => {
        const me = list.find((p) => p.id === professional.id) ?? professional;
        const initialCover =
          (user.coverImageUrl && user.coverImageUrl.trim()) ||
          (user.provider?.brandProfile?.coverImageUrl && user.provider.brandProfile.coverImageUrl.trim()) ||
          (me.provider?.brandProfile?.coverImageUrl && me.provider.brandProfile.coverImageUrl.trim()) ||
          "";

        const next = {
          fullName: user.fullName ?? "",
          phone: user.phone ?? "",
          avatarUrl: user.avatarUrl ?? "",
          coverImageUrl: initialCover,
          title: me.title ?? "",
          titleKind: me.titleKind ?? "",
          handle: me.handle ?? me.slug ?? "",
          handleNamespace: me.handleNamespace ?? "pro",
          vanityHandle: me.vanityHandle ?? "",
          requestVanity: false,
          registrationNumber: me.registrationNumber ?? "",
          licenceNumber: me.licenceNumber ?? "",
          authorityCodes: normalizeAuthorities(me.healthAuthorities).map((a) => a.code),
          customAuthority: "",
        };
        setAvatarUrl(next.avatarUrl);
        setCoverImageUrl((prev) => (initialCover ? initialCover : prev));
        setTitle(next.title);
        setTitleKind(next.titleKind);
        setHandle(next.handle);
        setHandleNamespace(next.handleNamespace);
        setVanityHandle(next.vanityHandle);
        setVanityStatus(me.vanityStatus ?? "none");
        setRequestVanity(false);
        setRegistrationNumber(next.registrationNumber);
        setLicenceNumber(next.licenceNumber);
        setAuthorityCodes(next.authorityCodes);
        setBaseline(snapshot(next));
        setDirty(false);
      })
      .catch(() => {
        const initialCover =
          (user.coverImageUrl && user.coverImageUrl.trim()) ||
          (user.provider?.brandProfile?.coverImageUrl && user.provider.brandProfile.coverImageUrl.trim()) ||
          (professional.provider?.brandProfile?.coverImageUrl &&
            professional.provider.brandProfile.coverImageUrl.trim()) ||
          "";

        const next = {
          fullName: user.fullName ?? "",
          phone: user.phone ?? "",
          avatarUrl: user.avatarUrl ?? "",
          coverImageUrl: initialCover,
          title: professional.title ?? "",
          titleKind: professional.titleKind ?? "",
          handle: professional.handle ?? professional.slug ?? "",
          handleNamespace: professional.handleNamespace ?? "pro",
          vanityHandle: professional.vanityHandle ?? "",
          requestVanity: false,
          registrationNumber: professional.registrationNumber ?? "",
          licenceNumber: professional.licenceNumber ?? "",
          authorityCodes: normalizeAuthorities(professional.healthAuthorities).map((a) => a.code),
          customAuthority: "",
        };
        setCoverImageUrl((prev) => (initialCover ? initialCover : prev));
        setTitle(next.title);
        setTitleKind(next.titleKind);
        setHandle(next.handle);
        setHandleNamespace(next.handleNamespace);
        setVanityHandle(next.vanityHandle);
        setVanityStatus(professional.vanityStatus ?? "none");
        setRegistrationNumber(next.registrationNumber);
        setLicenceNumber(next.licenceNumber);
        setAuthorityCodes(next.authorityCodes);
        setBaseline(snapshot(next));
        setDirty(false);
      });
  }, [professional, user]);

  const currentSnap = useMemo(
    () =>
      snapshot({
        fullName,
        phone,
        avatarUrl,
        coverImageUrl,
        title,
        titleKind,
        handle,
        handleNamespace,
        vanityHandle,
        requestVanity,
        registrationNumber,
        licenceNumber,
        authorityCodes,
        customAuthority,
      }),
    [
      fullName,
      phone,
      avatarUrl,
      coverImageUrl,
      title,
      titleKind,
      handle,
      handleNamespace,
      vanityHandle,
      requestVanity,
      registrationNumber,
      licenceNumber,
      authorityCodes,
      customAuthority,
    ],
  );

  useEffect(() => {
    if (!baseline) return;
    let active = true;
    const run = async () => {
      await Promise.resolve();
      if (active) {
        setDirty(currentSnap !== baseline);
      }
    };
    run();
    return () => {
      active = false;
    };
  }, [currentSnap, baseline]);

  function discard() {
    if (!baseline) return;
    try {
      const data = JSON.parse(baseline) as {
        fullName: string;
        phone: string;
        avatarUrl: string;
        coverImageUrl: string;
        title: string;
        titleKind: string;
        handle: string;
        handleNamespace: string;
        vanityHandle: string;
        requestVanity: boolean;
        registrationNumber: string;
        licenceNumber: string;
        authorityCodes: string[];
        customAuthority: string;
      };
      setFullName(data.fullName);
      setPhone(data.phone);
      setAvatarUrl(data.avatarUrl);
      setCoverImageUrl(data.coverImageUrl);
      setTitle(data.title);
      setTitleKind(data.titleKind);
      setHandle(data.handle);
      setHandleNamespace(data.handleNamespace);
      setVanityHandle(data.vanityHandle);
      setRequestVanity(data.requestVanity);
      setRegistrationNumber(data.registrationNumber);
      setLicenceNumber(data.licenceNumber);
      setAuthorityCodes(data.authorityCodes);
      setCustomAuthority(data.customAuthority);
      setDirty(false);
      setSaved(false);
      setError(null);
    } catch {
      /* ignore */
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    setSaved(false);
    setError(null);

    try {
      const nextAvatar = avatarUrl.trim() || null;
      const nextCover = coverImageUrl.trim() || null;

      // 1. Permanently update user record in database
      await api.updateUser(user.id, {
        fullName: fullName.trim(),
        phone: phone.trim() || undefined,
        avatarUrl: nextAvatar ?? undefined,
        coverImageUrl: nextCover,
      });

      // 2. If user is linked to a practice provider, sync brandProfile cover as well
      const providerId = user.provider?.id ?? professional?.providerId;
      if (providerId) {
        try {
          await api.updateProvider(providerId, {
            brandProfile: {
              coverImageUrl: nextCover,
            },
          });
        } catch {
          // If the user does not have owner rights on the clinic provider, ignore and continue saving personal profile
        }
      }

      // 3. If professional record exists, update practitioner fields
      if (professional?.id) {
        const h = normalizeHandle(handle);
        if (h && !isValidHandle(h)) {
          setError("Handle must be 3–32 characters (letters, numbers, . _ -).");
          setBusy(false);
          return;
        }
        const vh = normalizeHandle(vanityHandle);
        if (vh && (!isValidHandle(vh) || isReservedRootHandle(vh))) {
          setError(
            vh && isReservedRootHandle(vh)
              ? "That root username is reserved. Choose another."
              : "Root vanity handle is invalid.",
          );
          setBusy(false);
          return;
        }
        const presetByCode = new Map(HEALTH_AUTHORITY_PRESETS.map((p) => [p.code, p]));
        const healthAuthorities: HealthAuthorityBadge[] = authorityCodes.map((code) => {
          const preset = presetByCode.get(code);
          return {
            code,
            name: preset?.name ?? code,
            region: preset?.region,
            verified: true,
          };
        });
        if (customAuthority.trim()) {
          healthAuthorities.push({
            code: customAuthority.trim().slice(0, 24),
            name: customAuthority.trim(),
            verified: false,
          });
        }
        const updated = await api.updateProfessional(professional.id, {
          title: title.trim() || undefined,
          titleKind: titleKind || null,
          handle: h || null,
          handleNamespace: h ? handleNamespace : null,
          vanityHandle: vh || null,
          requestVanity: requestVanity && Boolean(vh),
          registrationNumber: registrationNumber.trim() || null,
          licenceNumber: licenceNumber.trim() || null,
          healthAuthorities,
        });
        setVanityStatus(updated.vanityStatus ?? "none");
        setRequestVanity(false);
      }

      // 4. Refresh global AuthContext and update baseline
      await refreshProfile();
      if (nextCover) setCoverImageUrl(nextCover);
      setBaseline(
        snapshot({
          fullName,
          phone,
          avatarUrl,
          coverImageUrl,
          title,
          titleKind,
          handle,
          handleNamespace,
          vanityHandle,
          requestVanity: false,
          registrationNumber,
          licenceNumber,
          authorityCodes,
          customAuthority: "",
        }),
      );
      setCustomAuthority("");
      setDirty(false);
      setSaved(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Your details couldn't be saved right now.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setPasswordBusy(true);
    try {
      const res = await api.changePassword(currentPassword, newPassword);
      setPasswordSuccess(res.message || "Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setPasswordError(
        err instanceof Error ? err.message : "Failed to change password. Check your current password.",
      );
    } finally {
      setPasswordBusy(false);
    }
  }

  const publicPathPreview =
    professional &&
    practitionerPath({
      id: professional.id,
      slug: professional.slug,
      handle: handle.trim() || undefined,
      handleNamespace: handle.trim() ? (handleNamespace as unknown as undefined) : undefined,
    });

  return (
    <div className="space-y-8">
      <DashHeader
        eyebrow="Account Sanctuary"
        title="Settings & Profile"
        description="Manage your sanctuary identity, visual branding, practitioner credentials, and account security in one place."
        action={
          <div className="flex items-center gap-2">
            {user?.role ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-forest/10 px-3.5 py-1.5 text-xs font-bold text-forest">
                <ShieldIcon className="h-3.5 w-3.5 text-forest" />
                <span>{ROLE_LABEL[user.role] ?? user.role}</span>
              </span>
            ) : null}
            <Link
              href="/dashboard/pass"
              className="inline-flex items-center gap-1.5 rounded-full border border-hairline bg-surface px-3.5 py-1.5 text-xs font-semibold text-forest hover:border-leaf"
            >
              <SparkleIcon className="h-3.5 w-3.5 text-gold" />
              <span>Digital Pass</span>
            </Link>
          </div>
        }
      />

      <form id="settings-form" onSubmit={onSubmit} className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* ========================================================================= */}
          {/* SECTION 1: PROFILE VISUALS (AVATAR + 1600x900 COVER BANNER) */}
          {/* ========================================================================= */}
          <DashCard
            title="Profile Visuals"
            description="How your avatar photo and hero cover banner appear across public practitioner pages, directory listings, and booking headers."
          >
            <div className="space-y-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <MediaField
                  label="Profile photo"
                  shape="avatar"
                  value={avatarUrl}
                  onChange={(url) => {
                    setAvatarUrl(url);
                    markDirty();
                  }}
                  recommended="square · 512×512"
                  hint="Upload a clear headshot or paste an image link. Shown on practitioner cards and team roster."
                />
                <div>
                  <MediaField
                    label="Profile cover banner"
                    shape="cover"
                    value={coverImageUrl}
                    onChange={(url) => {
                      setCoverImageUrl(url);
                      markDirty();
                    }}
                    recommended="wide · 1600×900"
                    hint="Hero cover banner image displayed at the top of your public profile page."
                  />
                  {/* Preset cover options for 1-click styling */}
                  <div className="mt-3">
                    <p className="text-[11px] font-semibold text-ink-muted mb-1.5">
                      Or choose a curated Ayurvedic sanctuary preset:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {COVER_PRESETS.map((preset) => (
                        <button
                          key={preset.name}
                          type="button"
                          onClick={() => {
                            setCoverImageUrl(preset.url);
                            markDirty();
                          }}
                          className={`rounded-full px-2.5 py-1 text-[10px] font-medium border transition-colors ${
                            coverImageUrl === preset.url
                              ? "bg-forest text-white border-forest"
                              : "bg-surface border-hairline text-ink-secondary hover:border-leaf hover:text-forest"
                          }`}
                        >
                          {preset.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Full name"
                  required
                  hint="Used on bookings, treatment notes, and public listings."
                >
                  <Input
                    required
                    autoComplete="name"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      markDirty();
                    }}
                    placeholder="Your legal or practice name"
                  />
                </Field>
                <Field
                  label="Phone number"
                  optional
                  hint="For automated booking reminders and sanctuary notifications."
                >
                  <Input
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      markDirty();
                    }}
                    placeholder="+61 400 000 000"
                  />
                </Field>
              </div>

              <Field
                label="Sign-in Email"
                hint="Your authenticated account email. Verified for secure access."
              >
                <div className="relative flex items-center">
                  <Input value={user?.email ?? ""} disabled readOnly className="pr-24" />
                  <span className="absolute right-3 inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                    <CheckCircleIcon className="h-3 w-3" />
                    Verified
                  </span>
                </div>
              </Field>
            </div>
          </DashCard>

          {/* ========================================================================= */}
          {/* SECTION 2: PRACTITIONER CREDENTIALS & HANDLES (FOR PROFESSIONALS) */}
          {/* ========================================================================= */}
          {professional ? (
            <>
              <DashCard
                title="Professional title & public URL"
                description="Choose your profession title and a public handle. Root usernames (ayurpass.com/you) require admin approval to protect trademarks and reserved paths."
              >
                <div className="space-y-5">
                  <Field
                    label="Profession"
                    hint="Structured title shown on your public profile."
                  >
                    <Select
                      value={titleKind}
                      onChange={(e) => {
                        const kind = e.target.value;
                        setTitleKind(kind);
                        const ns = defaultNamespaceForTitleKind(kind || null);
                        setHandleNamespace(ns);
                        const label =
                          PROFESSIONAL_TITLE_KINDS.find((t) => t.id === kind)?.label ?? "";
                        if (!title.trim() && label && kind !== "OTHER") setTitle(label);
                        markDirty();
                      }}
                    >
                      <option value="">Select title…</option>
                      {Object.entries(
                        PROFESSIONAL_TITLE_KINDS.reduce<Record<string, typeof PROFESSIONAL_TITLE_KINDS>>(
                          (acc, t) => {
                            (acc[t.group] ||= []).push(t);
                            return acc;
                          },
                          {},
                        ),
                      ).map(([group, titles]) => (
                        <optgroup key={group} label={group}>
                          {titles.map((t) => (
                            <option key={t.id} value={t.id}>
                              {t.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </Select>
                  </Field>

                  <Field
                    label="Display title"
                    optional
                    hint="Custom honorific e.g. “Senior BAMS Ayurvedic Physician” or “Hatha Yoga Master”."
                  >
                    <Input
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        markDirty();
                      }}
                      placeholder="e.g. Ayurvedic Vaidya"
                    />
                  </Field>

                  <div className="rounded-2xl border border-hairline bg-surface/80 p-4">
                    <p className="text-sm font-bold text-foreground">Public profile handle</p>
                    <p className="mt-1 text-xs text-ink-muted">
                      Your instant public link across search and directory pages:
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Select
                        className="w-auto font-mono text-xs"
                        value={handleNamespace}
                        onChange={(e) => {
                          setHandleNamespace(e.target.value);
                          markDirty();
                        }}
                      >
                        {HANDLE_NAMESPACES.map((ns) => (
                          <option key={ns.id} value={ns.id}>
                            /{ns.id}/ ({ns.label})
                          </option>
                        ))}
                      </Select>
                      <Input
                        className="max-w-xs font-mono text-xs"
                        value={handle}
                        onChange={(e) => {
                          setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""));
                          markDirty();
                        }}
                        placeholder="yourname"
                      />
                    </div>
                    {publicPathPreview ? (
                      <p className="mt-2 font-mono text-xs text-forest">
                        Preview URL:{" "}
                        <span className="font-semibold underline underline-offset-2">
                          {publicPathPreview}
                        </span>
                      </p>
                    ) : null}
                  </div>

                  <div className="rounded-2xl border border-hairline bg-surface/80 p-4">
                    <p className="text-sm font-bold text-foreground">Root vanity URL</p>
                    <p className="mt-1 text-xs text-ink-muted">
                      Direct short link: <code>ayurpass.com/:handle</code>. Subject to admin approval.
                    </p>
                    <Field className="mt-3" label="Requested username" optional>
                      <Input
                        value={vanityHandle}
                        onChange={(e) => {
                          setVanityHandle(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ""));
                          markDirty();
                        }}
                        placeholder="yourbrand"
                      />
                    </Field>
                    <label className="mt-3 flex items-center gap-2 text-sm font-medium text-ink-secondary">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-[var(--forest)]"
                        checked={requestVanity}
                        onChange={(e) => {
                          setRequestVanity(e.target.checked);
                          markDirty();
                        }}
                        disabled={!vanityHandle.trim()}
                      />
                      Submit for platform admin approval
                    </label>
                    {vanityStatus && vanityStatus !== "none" ? (
                      <p className="mt-2 text-xs font-bold uppercase tracking-wide text-ink-muted">
                        Status: {vanityStatus}
                        {vanityStatus === "approved" && vanityHandle
                          ? ` · live at /${vanityHandle}`
                          : ""}
                      </p>
                    ) : null}
                  </div>
                </div>
              </DashCard>

              <DashCard
                title="Practitioner credentials"
                description="Registration, licence and health-authority marks (e.g. AAA) appear next to your name on public profiles."
              >
                <div className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Registration number" optional>
                      <Input
                        value={registrationNumber}
                        onChange={(e) => {
                          setRegistrationNumber(e.target.value);
                          markDirty();
                        }}
                        placeholder="Association / board ID"
                      />
                    </Field>
                    <Field label="Licence number" optional>
                      <Input
                        value={licenceNumber}
                        onChange={(e) => {
                          setLicenceNumber(e.target.value);
                          markDirty();
                        }}
                        placeholder="Clinical / practice licence"
                      />
                    </Field>
                  </div>

                  <div>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-foreground">
                        Health authority approvals
                      </p>
                      <span className="text-xs font-medium text-ink-muted">
                        {authorityCodes.length} selected
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {HEALTH_AUTHORITY_PRESETS.map((preset) => {
                        const active = authorityCodes.includes(preset.code);
                        return (
                          <button
                            key={preset.code}
                            type="button"
                            title={preset.name}
                            onClick={() => {
                              setAuthorityCodes((prev) =>
                                active
                                  ? prev.filter((c) => c !== preset.code)
                                  : [...prev, preset.code],
                              );
                              markDirty();
                            }}
                            aria-pressed={active}
                            className={`inline-flex min-h-10 max-w-full items-center gap-1.5 rounded-full px-3.5 py-2 text-left text-sm font-semibold transition-colors ${
                              active
                                ? "bg-[var(--system-blue)] text-white shadow-sm"
                                : "border border-hairline bg-surface text-ink-secondary hover:border-leaf hover:text-forest"
                            }`}
                          >
                            <span>{preset.code}</span>
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wide ${
                                active ? "text-white/80" : "text-ink-muted"
                              }`}
                            >
                              {preset.region}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <Field
                      className="mt-4"
                      label="Custom authority"
                      optional
                      hint="Any board or association not listed above."
                    >
                      <Input
                        value={customAuthority}
                        onChange={(e) => {
                          setCustomAuthority(e.target.value);
                          markDirty();
                        }}
                        placeholder="Other board or association"
                      />
                    </Field>
                  </div>
                </div>
              </DashCard>
            </>
          ) : null}

          {/* ========================================================================= */}
          {/* SECTION 3: SECURITY & PASSWORD */}
          {/* ========================================================================= */}
          <DashCard
            title="Password & Security"
            description="Manage your password credentials and account protection."
          >
            <div className="space-y-4">
              {passwordError && <ErrorNote message={passwordError} />}
              {passwordSuccess && <SuccessNote message={passwordSuccess} />}

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Current password">
                  <Input
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </Field>
                <Field label="New password" hint="Min. 8 characters">
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </Field>
                <Field label="Confirm new password">
                  <Input
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </Field>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  variant="soft"
                  disabled={passwordBusy || !newPassword}
                  onClick={handlePasswordChange}
                >
                  <ShieldIcon className="h-4 w-4 mr-1.5" />
                  {passwordBusy ? "Updating…" : "Update Password"}
                </Button>
              </div>
            </div>
          </DashCard>

          <ErrorNote message={error} />
          <SuccessNote message={saved && !dirty ? "Your profile details and cover image were saved successfully." : null} />

          <DashFormActions>
            <Button type="submit" disabled={busy || !dirty} className="min-h-11 px-6">
              {busy ? "Saving…" : dirty ? "Save changes" : "All changes saved"}
            </Button>
            {dirty ? (
              <Button type="button" variant="ghost" onClick={discard} disabled={busy}>
                Discard
              </Button>
            ) : null}
          </DashFormActions>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-hairline text-xs text-ink-muted">
            <Link
              href="/dashboard/permissions"
              className="font-semibold text-forest hover:underline"
            >
              Privacy &amp; Permissions Settings &rarr;
            </Link>
            {hasPractice && (
              <Link
                href="/dashboard/business"
                className="font-semibold text-forest hover:underline"
              >
                Clinic Business Profile &rarr;
              </Link>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* RIGHT ASIDE: LIVE INTERACTIVE PREVIEW WITH REAL COVER BANNER */}
        {/* ========================================================================= */}
        <aside className="hidden lg:sticky lg:top-20 lg:block lg:self-start">
          <SettingsLivePreview
            fullName={fullName}
            title={title}
            phone={phone}
            email={user?.email}
            avatarUrl={avatarUrl}
            coverImageUrl={coverImageUrl}
            authorityCodes={
              customAuthority.trim()
                ? [...authorityCodes, customAuthority.trim().slice(0, 24)]
                : authorityCodes
            }
            registrationNumber={registrationNumber}
            licenceNumber={licenceNumber}
            isProfessional={Boolean(professional)}
          />
        </aside>
      </form>

      {/* Mobile Live preview */}
      <div className="lg:hidden">
        <SettingsLivePreview
          fullName={fullName}
          title={title}
          phone={phone}
          email={user?.email}
          avatarUrl={avatarUrl}
          coverImageUrl={coverImageUrl}
          authorityCodes={
            customAuthority.trim()
              ? [...authorityCodes, customAuthority.trim().slice(0, 24)]
              : authorityCodes
          }
          registrationNumber={registrationNumber}
          licenceNumber={licenceNumber}
          isProfessional={Boolean(professional)}
        />
      </div>

      <DashStickySave
        dirty={dirty}
        busy={busy}
        formId="settings-form"
        onDiscard={discard}
        label="Save settings"
        message="Unsaved profile changes"
      />
    </div>
  );
}
