"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { api, formatMoney } from "@/lib/api";
import { formatDuration, CATEGORY_LABEL } from "@/lib/catalog";
import { nextDays, slotsForDay, type SlotOption } from "@/lib/slots";
import type { Booking, ProviderProfileBundle, Service } from "@/lib/types";
import { downloadBookingIcs } from "@/lib/ics";
import { CalendarIcon, CheckIcon, SparkleIcon } from "@/components/icons";
import { Button, ErrorNote, Field, Input, Select, Textarea } from "@/components/ui";

interface Props {
  profile: ProviderProfileBundle;
  brandColor?: string;
  initialServiceId?: string;
}

export default function EmbedBookingClient({ profile, brandColor, initialServiceId }: Props) {
  const { provider, services } = profile;
  const primaryColor = brandColor || "#1e3228"; // Default AyurPass Forest Green

  const [selectedService, setSelectedService] = useState<Service | null>(() => {
    if (initialServiceId) {
      return services.find((s) => s.id === initialServiceId) ?? services[0] ?? null;
    }
    return services[0] ?? null;
  });

  const days = useMemo(() => nextDays(14), []);
  const [dayIso, setDayIso] = useState(days[0].iso);
  const [selectedSlot, setSelectedSlot] = useState<SlotOption | null>(null);

  // Client Details
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);

  const [selectedAddOnIds, setSelectedAddOnIds] = useState<string[]>([]);
  const addOnsList = useMemo(() => {
    const fromClinic = services
      .filter(
        (s) =>
          Boolean((s.doshaCompatibility as any)?.isAddOn) ||
          s.name.toLowerCase().includes("add-on"),
      )
      .map((s) => ({
        id: s.id,
        name: s.name,
        durationMinutes: s.durationMinutes,
        price: Number(s.price ?? 0),
      }));

    if (fromClinic.length > 0) return fromClinic;

    return [
      { id: "emb-addon-1", name: "Shiro-Abhyanga Head Massage", durationMinutes: 15, price: 35 },
      { id: "emb-addon-2", name: "Mukha Abhyanga Face Massage", durationMinutes: 15, price: 40 },
      { id: "emb-addon-3", name: "Pada Abhyanga Foot Massage", durationMinutes: 15, price: 40 },
      { id: "emb-addon-4", name: "Swedana Herbal Steam Chamber", durationMinutes: 20, price: 30 },
    ];
  }, [services]);

  const selectedAddOns = useMemo(
    () => addOnsList.filter((a) => selectedAddOnIds.includes(a.id)),
    [addOnsList, selectedAddOnIds],
  );
  const addOnsDuration = useMemo(
    () => selectedAddOns.reduce((acc, a) => acc + a.durationMinutes, 0),
    [selectedAddOns],
  );
  const addOnsPrice = useMemo(
    () => selectedAddOns.reduce((acc, a) => acc + a.price, 0),
    [selectedAddOns],
  );

  const totalDuration = (selectedService?.durationMinutes ?? 60) + addOnsDuration;
  const totalPrice = Number(selectedService?.price ?? 0) + addOnsPrice;

  const toggleAddOn = (id: string) => {
    setSelectedAddOnIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
    setSelectedSlot(null);
  };

  const selectedDay = days.find((d) => d.iso === dayIso) ?? days[0];
  const bufferMinutes = Number((selectedService?.doshaCompatibility as any)?.bufferMinutes) || 0;
  const slots = useMemo(
    () =>
      selectedService
        ? slotsForDay(selectedDay.date, totalDuration, bufferMinutes)
        : [],
    [selectedService, selectedDay, totalDuration, bufferMinutes],
  );

  async function handleBook(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedService || !selectedSlot) {
      setError("Please select an appointment time slot.");
      return;
    }
    if (!fullName.trim() || !email.trim()) {
      setError("Please provide your full name and email address.");
      return;
    }

    setBusy(true);
    setError(null);

    const end = new Date(selectedSlot.start.getTime() + totalDuration * 60_000);
    const addOnNote =
      selectedAddOns.length > 0
        ? ` [Add-Ons Selected: ${selectedAddOns.map((a) => `${a.name} (+${a.durationMinutes}m, $${a.price})`).join("; ")}]`
        : "";
    const finalNotes = (notes.trim() + addOnNote).trim();

    try {
      // Find or register client on backend, or proceed with guest booking
      let consumerUser = await api.userByEmail(email.trim()).catch(() => null);
      if (!consumerUser) {
        // Register client transparently
        const registered = await api
          .register({
            email: email.trim(),
            password: `Guest_${Math.random().toString(36).slice(2, 10)}!`,
            fullName: fullName.trim(),
            role: "CONSUMER",
          })
          .catch(() => null);
        if (registered) {
          consumerUser = registered.user;
        }
      }

      if (!consumerUser) {
        throw new Error("Unable to create client account. Please verify your email.");
      }

      const booking = await api.createBooking({
        consumerId: consumerUser.id,
        serviceId: selectedService.id,
        providerId: provider.id,
        professionalId: selectedService.professionalId ?? undefined,
        startTime: selectedSlot.start.toISOString(),
        endTime: end.toISOString(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        notes: [finalNotes, phone.trim() ? `Phone: ${phone.trim()}` : ""].filter(Boolean).join("\n"),
        contactPhone: phone.trim() || undefined,
        status: "CONFIRMED",
      });

      setConfirmed(booking);

      // Broadcast message to parent window (e.g. for WordPress / Squarespace iframe listeners)
      if (typeof window !== "undefined" && window.parent) {
        window.parent.postMessage(
          {
            type: "ayurpass:booking_completed",
            bookingId: booking.id,
            serviceName: selectedService.name,
            providerName: provider.businessName,
          },
          "*",
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "The appointment couldn't be booked. Please select another slot.",
      );
    } finally {
      setBusy(false);
    }
  }

  // --- Confirmation Screen ---
  if (confirmed && selectedService && selectedSlot) {
    const s = new Date(confirmed.startTime);
    return (
      <div className="mx-auto max-w-xl rounded-2xl border border-hairline bg-surface p-6 sm:p-8 shadow-md text-center">
        <div
          className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-white shadow-sm"
          style={{ backgroundColor: primaryColor }}
        >
          <CheckIcon className="h-7 w-7" strokeWidth={2.6} />
        </div>
        <h2 className="mt-4 font-display text-2xl font-bold text-forest">Appointment Confirmed!</h2>
        <p className="mt-1 text-sm text-ink-secondary">
          We&apos;ve sent an email confirmation with your calendar invite to <strong>{email}</strong>.
        </p>

        <div className="mt-6 rounded-xl border border-hairline bg-surface-raised/40 p-4 text-left space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-ink-muted">Practice:</span>
            <span className="font-semibold text-foreground">{provider.businessName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Service:</span>
            <span className="font-semibold text-foreground">{selectedService.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Date &amp; Time:</span>
            <span className="font-semibold text-foreground">
              {s.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })} at{" "}
              {s.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Duration:</span>
            <span className="font-semibold text-foreground">{formatDuration(selectedService.durationMinutes)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-ink-muted">Total:</span>
            <span className="font-semibold text-foreground">
              {formatMoney(Number(selectedService.price), selectedService.currency)}
            </span>
          </div>
        </div>

        {selectedService.isVirtual ? (
          <div className="mt-4 rounded-xl border border-leaf/30 bg-leaf/10 p-3 text-center space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-forest">
              📹 Telehealth Video Room Ready
            </span>
            <p className="text-xs text-ink-secondary">
              Your consultation link is saved to your calendar export.
            </p>
            <a
              href={`https://meet.ayurpass.com/room/${confirmed.id.slice(0, 12)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-forest px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-forest-deep"
            >
              Join Video Room →
            </a>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() =>
              downloadBookingIcs({
                ...confirmed,
                service: selectedService,
                provider: provider as any,
              })
            }
            className="inline-flex items-center gap-2 rounded-full border border-hairline bg-surface px-4 py-2 text-xs font-semibold text-forest hover:bg-forest/5 shadow-2xs"
          >
            <CalendarIcon className="h-4 w-4 text-forest" />
            Add to Calendar (.ics)
          </button>
          <button
            type="button"
            onClick={() => {
              setConfirmed(null);
              setSelectedSlot(null);
            }}
            className="rounded-full px-4 py-2 text-xs font-semibold text-ink-muted hover:text-forest"
          >
            Book another session
          </button>
        </div>

        <div className="mt-8 border-t border-hairline pt-4 text-center">
          <a
            href="https://ayurpass.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted hover:text-forest"
          >
            <SparkleIcon className="h-3 w-3 text-gold-dark" />
            Powered by AyurPass
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-hairline bg-surface shadow-md">
      {/* Header */}
      <div
        className="px-6 py-5 text-white flex items-center justify-between gap-4"
        style={{ backgroundColor: primaryColor }}
      >
        <div className="flex items-center gap-3">
          {provider.brandProfile?.logoUrl ? (
            <Image
              src={provider.brandProfile.logoUrl}
              alt={provider.businessName}
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover border-2 border-white/20"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-lg font-bold">
              {provider.businessName.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="font-display text-lg sm:text-xl font-bold leading-tight">
              {provider.businessName}
            </h1>
            <p className="text-xs text-white/80 mt-0.5">
              {provider.address?.city
                ? `${provider.address.city}, ${provider.address.country ?? ""}`
                : "Online Appointments"}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold text-white">
          Book Online
        </span>
      </div>

      <form onSubmit={handleBook} className="p-5 sm:p-6 space-y-6">
        {/* Step 1: Select Service */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
            1. Select Treatment or Session
          </label>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {services.map((s) => {
              const isSelected = selectedService?.id === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => {
                    setSelectedService(s);
                    setSelectedSlot(null);
                  }}
                  className={`flex flex-col justify-between rounded-xl border p-3.5 text-left transition-all ${
                    isSelected
                      ? "border-forest bg-forest/5 ring-1 ring-forest shadow-xs"
                      : "border-hairline bg-surface hover:border-leaf/50"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-sm text-foreground line-clamp-1">
                        {s.name}
                      </span>
                      <span className="text-xs font-bold text-forest shrink-0">
                        {formatMoney(Number(s.price), s.currency)}
                      </span>
                    </div>
                    {s.description && (
                      <p className="mt-1 text-xs text-ink-muted line-clamp-2 leading-relaxed">
                        {s.description}
                      </p>
                    )}
                  </div>
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-ink-secondary">
                    <span>{formatDuration(s.durationMinutes)}</span>
                    <div className="flex items-center gap-1.5">
                      {s.maxParticipants && s.maxParticipants > 1 ? (
                        <span className="text-[10px] font-bold text-forest-deep bg-gold/15 px-1.5 py-0.5 rounded">
                          Class ({s.maxParticipants})
                        </span>
                      ) : null}
                      <span className="text-[10px] uppercase font-bold text-ink-muted">
                        {CATEGORY_LABEL[s.category] ?? s.category}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Choose Date & Time */}
        {selectedService && (
          <div className="space-y-4">
            {/* Treatment Add-Ons Selector */}
            <div className="rounded-2xl border border-gold/30 bg-gold/5 p-3.5 sm:p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-forest flex items-center gap-1.5">
                  <span>🌿</span> Enhance Your Session (Add-On Therapies)
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-forest bg-gold/20 px-2 py-0.5 rounded">
                  Add-on
                </span>
              </div>
              <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
                {addOnsList.map((addon) => {
                  const selected = selectedAddOnIds.includes(addon.id);
                  return (
                    <button
                      key={addon.id}
                      type="button"
                      onClick={() => toggleAddOn(addon.id)}
                      className={`flex items-center justify-between rounded-xl border p-2.5 text-left transition-colors ${
                        selected
                          ? "border-forest bg-forest/10 ring-1 ring-forest"
                          : "border-hairline bg-surface hover:border-gold"
                      }`}
                    >
                      <div className="flex items-center gap-2 pr-1">
                        <span
                          className={`h-4 w-4 rounded border flex items-center justify-center text-[9px] ${
                            selected
                              ? "bg-forest border-forest text-white font-bold"
                              : "border-hairline bg-surface"
                          }`}
                        >
                          {selected ? "✓" : ""}
                        </span>
                        <div>
                          <p className="text-xs font-semibold text-foreground line-clamp-1">{addon.name}</p>
                          <p className="text-[10px] text-ink-muted">+{addon.durationMinutes}m</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-forest shrink-0">
                        +{formatMoney(addon.price, selectedService.currency)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted mb-2">
                2. Choose Date &amp; Time
              </label>

            {/* Date Carousel */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {days.map((d) => {
                const isSelected = d.iso === dayIso;
                return (
                  <button
                    key={d.iso}
                    type="button"
                    onClick={() => {
                      setDayIso(d.iso);
                      setSelectedSlot(null);
                    }}
                    className={`flex min-w-[62px] flex-col items-center rounded-xl border py-2.5 px-1.5 transition-all text-xs ${
                      isSelected
                        ? "border-forest bg-forest text-white shadow-xs"
                        : "border-hairline bg-surface text-ink-secondary hover:border-forest/50"
                    }`}
                  >
                    <span className="font-medium">{d.weekday}</span>
                    <span className="text-base font-bold my-0.5">{d.dayOfMonth}</span>
                    <span className="text-[10px] opacity-85">{d.month}</span>
                  </button>
                );
              })}
            </div>

            {/* Slots Grid */}
            <div className="mt-3">
              {slots.length === 0 ? (
                <div className="rounded-xl border border-dashed border-hairline p-4 text-center text-xs text-ink-muted">
                  No availability on this date. Please pick another day.
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {slots.map((s) => {
                    const isSelected = selectedSlot?.start.getTime() === s.start.getTime();
                    return (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => setSelectedSlot(s)}
                        className={`rounded-lg border py-2 text-xs font-medium transition-all ${
                          isSelected
                            ? "border-forest bg-forest text-white font-semibold shadow-xs"
                            : "border-hairline bg-surface text-foreground hover:border-forest/40"
                        }`}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Step 3: Your Information */}
        {selectedSlot && (
          <div className="space-y-3 pt-2 border-t border-hairline">
            <label className="block text-xs font-bold uppercase tracking-wider text-ink-muted">
              3. Your Details
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Full Name">
                <Input
                  required
                  placeholder="e.g. Maya Patel"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </Field>
              <Field label="Email Address">
                <Input
                  type="email"
                  required
                  placeholder="e.g. maya@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Mobile Phone">
                <Input
                  type="tel"
                  placeholder="+1 555 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </Field>
              <Field label="Notes or Health Concerns (Optional)">
                <Input
                  placeholder="e.g. lower back pain, allergies"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Field>
            </div>
          </div>
        )}

        <ErrorNote message={error} />

        {selectedService && selectedSlot && (
          <div className="rounded-xl bg-clay/50 p-3 text-xs flex justify-between items-center text-foreground border border-hairline">
            <div>
              <span className="font-bold">{selectedService.name}</span>
              {selectedAddOns.length > 0 && (
                <span className="text-ink-muted font-medium"> (+{selectedAddOns.length} add-on{selectedAddOns.length > 1 ? "s" : ""})</span>
              )}
              <div className="text-[11px] text-ink-muted mt-0.5">
                {totalDuration} min · {selectedSlot.label}
              </div>
            </div>
            <span className="text-sm font-bold text-forest">
              {formatMoney(totalPrice, selectedService.currency)}
            </span>
          </div>
        )}

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={busy || !selectedSlot}
            className="w-full rounded-xl py-3 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: primaryColor }}
          >
            {busy ? "Booking Appointment…" : "Confirm Appointment"}
          </button>
        </div>

        {/* Footer badge */}
        <div className="border-t border-hairline pt-3 text-center">
          <a
            href="https://ayurpass.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-muted hover:text-forest"
          >
            <SparkleIcon className="h-3 w-3 text-gold-dark" />
            Powered by AyurPass Booking Engine
          </a>
        </div>
      </form>
    </div>
  );
}
