/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useLocation, SUPPORTED_COUNTRIES } from "@/context/LocationContext";
import { SUPPORTED_LOCALES } from "@ayurpass/shared";
import { GlobeIcon, XIcon } from "@/components/icons";

const CURRENCIES = [

  { code: "AUD", label: "AUD ($) - Australian Dollar" },
  { code: "INR", label: "INR (₹) - Indian Rupee" },
  { code: "USD", label: "USD ($) - US Dollar" },
  { code: "GBP", label: "GBP (£) - British Pound" },
  { code: "EUR", label: "EUR (€) - Euro" },
  { code: "AED", label: "AED - UAE Dirham" },
  { code: "CAD", label: "CAD ($) - Canadian Dollar" },
  { code: "NZD", label: "NZD ($) - New Zealand Dollar" },
  { code: "SGD", label: "SGD ($) - Singapore Dollar" },
  { code: "LKR", label: "LKR (Rs) - Sri Lankan Rupee" },
  { code: "NPR", label: "NPR (NRs) - Nepalese Rupee" },
  { code: "THB", label: "THB (฿) - Thai Baht" },
  { code: "IDR", label: "IDR (Rp) - Indonesian Rupiah" },
  { code: "MYR", label: "MYR (RM) - Malaysian Ringgit" },
  { code: "JPY", label: "JPY (¥) - Japanese Yen" },
  { code: "KRW", label: "KRW (₩) - South Korean Won" },
  { code: "CHF", label: "CHF - Swiss Franc" },
  { code: "SEK", label: "SEK (kr) - Swedish Krona" },
  { code: "NOK", label: "NOK (kr) - Norwegian Krone" },
  { code: "DKK", label: "DKK (kr) - Danish Krone" },
  { code: "ZAR", label: "ZAR (R) - South African Rand" },
  { code: "MXN", label: "MXN ($) - Mexican Peso" },
  { code: "BRL", label: "BRL (R$) - Brazilian Real" },
  { code: "ARS", label: "ARS ($) - Argentine Peso" },
  { code: "QAR", label: "QAR - Qatari Riyal" },
  { code: "SAR", label: "SAR - Saudi Riyal" },
  { code: "OMR", label: "OMR - Omani Rial" },
  { code: "KWD", label: "KWD - Kuwaiti Dinar" },
  { code: "BHD", label: "BHD - Bahraini Dinar" },
  { code: "ILS", label: "ILS (₪) - Israeli Shekel" },
  { code: "PHP", label: "PHP (₱) - Philippine Peso" },
  { code: "VND", label: "VND (₫) - Vietnamese Dong" },
  { code: "TRY", label: "TRY (₺) - Turkish Lira" },
  { code: "HKD", label: "HKD ($) - Hong Kong Dollar" },
  { code: "TWD", label: "TWD (NT$) - New Taiwan Dollar" },
  { code: "MUR", label: "MUR (Rs) - Mauritian Rupee" },
  { code: "MVR", label: "MVR (Rf) - Maldivian Rufiyaa" },
  { code: "BDT", label: "BDT (৳) - Bangladeshi Taka" },
  { code: "PKR", label: "PKR (Rs) - Pakistani Rupee" },
];

const TIMEZONES = [
  { code: "Australia/Sydney", label: "Sydney / Melbourne (AEST/AEDT, UTC+10/+11)" },
  { code: "Australia/Perth", label: "Perth (AWST, UTC+8)" },
  { code: "Asia/Kolkata", label: "India (IST, UTC+5:30)" },
  { code: "America/New_York", label: "Eastern Time US (EST/EDT, UTC-5/-4)" },
  { code: "America/Los_Angeles", label: "Pacific Time US (PST/PDT, UTC-8/-7)" },
  { code: "Europe/London", label: "London / UK (GMT/BST, UTC+0/+1)" },
  { code: "Europe/Berlin", label: "Central Europe (CET/CEST, UTC+1/+2)" },
  { code: "Europe/Paris", label: "Paris / Western Europe (CET, UTC+1/+2)" },
  { code: "Asia/Dubai", label: "Dubai / UAE (GST, UTC+4)" },
  { code: "Asia/Singapore", label: "Singapore (SGT, UTC+8)" },
  { code: "Pacific/Auckland", label: "Auckland / NZ (NZST/NZDT, UTC+12/+13)" },
  { code: "Asia/Bangkok", label: "Bangkok / Thailand (ICT, UTC+7)" },
  { code: "Asia/Makassar", label: "Bali / Indonesia (WITA, UTC+8)" },
  { code: "Asia/Tokyo", label: "Tokyo / Japan (JST, UTC+9)" },
  { code: "Asia/Seoul", label: "Seoul / South Korea (KST, UTC+9)" },
  { code: "Europe/Zurich", label: "Zurich / Switzerland (CET, UTC+1/+2)" },
  { code: "Africa/Johannesburg", label: "South Africa (SAST, UTC+2)" },
  { code: "America/Mexico_City", label: "Mexico City (CST, UTC-6)" },
  { code: "America/Sao_Paulo", label: "Sao Paulo / Brazil (BRT, UTC-3)" },
  { code: "Asia/Riyadh", label: "Riyadh / Saudi Arabia (AST, UTC+3)" },
  { code: "Asia/Hong_Kong", label: "Hong Kong (HKT, UTC+8)" },
  { code: "Indian/Maldives", label: "Maldives (MVT, UTC+5)" },
  { code: "Asia/Colombo", label: "Sri Lanka (SLST, UTC+5:30)" },
  { code: "Asia/Kathmandu", label: "Nepal (NPT, UTC+5:45)" },
];

export function LocationModal() {
  const {
    isModalOpen,
    closeModal,
    countryCode,
    currency,
    timezone,
    locale,
    updateLocation,
    autoDetect,
  } = useLocation();

  const [selectedCountry, setSelectedCountry] = useState(countryCode);
  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const [selectedTimezone, setSelectedTimezone] = useState(timezone);
  const [selectedLocale, setSelectedLocale] = useState(locale || "en");
  const [currentTimeStr, setCurrentTimeStr] = useState("");
  const [countryFilter, setCountryFilter] = useState("");

  useEffect(() => {
    setSelectedCountry(countryCode);
    setSelectedCurrency(currency);
    setSelectedTimezone(timezone);
    setSelectedLocale(locale || "en");
  }, [countryCode, currency, timezone, locale, isModalOpen]);

  useEffect(() => {
    try {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat("en-US", {
        timeZone: selectedTimezone,
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        timeZoneName: "short",
      }).format(now);
      setCurrentTimeStr(formatted);
    } catch {
      setCurrentTimeStr("");
    }
  }, [selectedTimezone]);

  if (!isModalOpen) return null;

  const filteredCountries = SUPPORTED_COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(countryFilter.toLowerCase()) ||
      c.code.toLowerCase().includes(countryFilter.toLowerCase()) ||
      c.currency.toLowerCase().includes(countryFilter.toLowerCase()),
  );

  const handleCountryChange = (code: string) => {
    setSelectedCountry(code);
    const matched = SUPPORTED_COUNTRIES.find((c) => c.code === code);
    if (matched) {
      setSelectedCurrency(matched.currency);
      setSelectedTimezone(matched.timezone);
    }
  };

  const handleSave = () => {
    updateLocation(selectedCountry, selectedCurrency, selectedTimezone, selectedLocale);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="location-modal-title"
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-surface p-6 shadow-2xl border border-hairline sm:p-8">
        <div className="flex items-center justify-between pb-4 border-b border-hairline">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-forest text-white shadow-xs">
              <GlobeIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 id="location-modal-title" className="font-display text-xl font-semibold text-forest">
                Region & Language Preferences
              </h2>
              <p className="text-xs text-ink-muted">Set your country, currency, timezone and preferred language</p>
            </div>
          </div>
          <button
            type="button"
            onClick={closeModal}
            className="rounded-full p-2 text-ink-muted hover:bg-clay hover:text-forest"
            aria-label="Close dialog"
          >
            <XIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-5">
          {/* Language Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
              Interface Language
            </label>
            <select
              value={selectedLocale}
              onChange={(e) => setSelectedLocale(e.target.value)}
              className="w-full rounded-2xl border border-hairline bg-surface px-4 py-3 text-sm text-ink focus:border-forest focus:outline-none"
            >
              {SUPPORTED_LOCALES.map((loc) => (
                <option key={loc.code} value={loc.code}>
                  {loc.nativeName} ({loc.name})
                </option>
              ))}
            </select>
          </div>

          {/* Country Selection */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-forest/70">
                Country / Location ({SUPPORTED_COUNTRIES.length})
              </label>
            </div>
            <input
              type="text"
              placeholder="Search country or currency..."
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value)}
              className="mb-2.5 w-full rounded-2xl border border-hairline bg-surface px-4 py-2.5 text-xs text-ink placeholder:text-ink-muted focus:border-forest focus:outline-none"
            />
            <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              {filteredCountries.map((c) => {
                const active = selectedCountry === c.code;
                return (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleCountryChange(c.code)}
                    className={`flex items-center gap-2.5 rounded-2xl border p-2.5 text-left text-xs font-medium transition-all ${
                      active
                        ? "border-forest bg-forest text-white font-semibold shadow-xs"
                        : "border-hairline bg-surface hover:border-forest/40 text-ink"
                    }`}
                  >
                    <span className="text-lg">{c.flag}</span>
                    <span className="truncate">{c.name}</span>
                  </button>
                );
              })}
              {filteredCountries.length === 0 && (
                <p className="col-span-2 text-center py-4 text-xs text-ink-muted">No matching country found</p>
              )}
            </div>
          </div>

          {/* Currency */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
              Preferred Currency
            </label>
            <select
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="w-full rounded-2xl border border-hairline bg-surface px-4 py-3 text-sm text-ink focus:border-forest focus:outline-none"
            >
              {CURRENCIES.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.label}
                </option>
              ))}
            </select>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-forest/70 mb-1.5">
              Timezone & Local Time
            </label>
            <select
              value={selectedTimezone}
              onChange={(e) => setSelectedTimezone(e.target.value)}
              className="w-full rounded-2xl border border-hairline bg-surface px-4 py-3 text-sm text-ink focus:border-forest focus:outline-none"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.code} value={tz.code}>
                  {tz.label}
                </option>
              ))}
            </select>
            {currentTimeStr && (
              <p className="mt-2 text-xs text-forest font-medium flex items-center gap-1.5">
                <span>🕒 Current Local Time:</span>
                <span className="font-semibold">{currentTimeStr}</span>
              </p>
            )}
          </div>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-hairline pt-5">
          <button
            type="button"
            onClick={autoDetect}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-forest hover:underline"
          >
            ⚡ Auto-detect location
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 sm:flex-none rounded-full border border-hairline bg-surface px-5 py-2.5 text-sm font-semibold text-ink hover:bg-clay"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-none rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-forest-deep"
            >
              Save Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
