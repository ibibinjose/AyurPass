"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { localeDir, localeFromBrowser } from "@ayurpass/shared";

export interface CountryOption {
  code: string;
  name: string;
  flag: string;
  currency: string;
  symbol: string;
  timezone: string;
}

export const SUPPORTED_COUNTRIES: CountryOption[] = [
  { code: "AU", name: "Australia", flag: "🇦🇺", currency: "AUD", symbol: "$", timezone: "Australia/Sydney" },
  { code: "IN", name: "India", flag: "🇮🇳", currency: "INR", symbol: "₹", timezone: "Asia/Kolkata" },
  { code: "US", name: "United States", flag: "🇺🇸", currency: "USD", symbol: "$", timezone: "America/New_York" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", currency: "GBP", symbol: "£", timezone: "Europe/London" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", currency: "AED", symbol: "AED ", timezone: "Asia/Dubai" },
  { code: "CA", name: "Canada", flag: "🇨🇦", currency: "CAD", symbol: "$", timezone: "America/Toronto" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", currency: "NZD", symbol: "$", timezone: "Pacific/Auckland" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", currency: "SGD", symbol: "$", timezone: "Asia/Singapore" },
  { code: "DE", name: "Germany", flag: "🇩🇪", currency: "EUR", symbol: "€", timezone: "Europe/Berlin" },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰", currency: "LKR", symbol: "Rs ", timezone: "Asia/Colombo" },
  { code: "NP", name: "Nepal", flag: "🇳🇵", currency: "NPR", symbol: "NRs ", timezone: "Asia/Kathmandu" },
  { code: "TH", name: "Thailand", flag: "🇹🇭", currency: "THB", symbol: "฿", timezone: "Asia/Bangkok" },
  { code: "ID", name: "Indonesia (Bali)", flag: "🇮🇩", currency: "IDR", symbol: "Rp ", timezone: "Asia/Makassar" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", currency: "MYR", symbol: "RM ", timezone: "Asia/Kuala_Lumpur" },
  { code: "JP", name: "Japan", flag: "🇯🇵", currency: "JPY", symbol: "¥", timezone: "Asia/Tokyo" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", currency: "KRW", symbol: "₩", timezone: "Asia/Seoul" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", currency: "CHF", symbol: "CHF ", timezone: "Europe/Zurich" },
  { code: "FR", name: "France", flag: "🇫🇷", currency: "EUR", symbol: "€", timezone: "Europe/Paris" },
  { code: "IT", name: "Italy", flag: "🇮🇹", currency: "EUR", symbol: "€", timezone: "Europe/Rome" },
  { code: "ES", name: "Spain", flag: "🇪🇸", currency: "EUR", symbol: "€", timezone: "Europe/Madrid" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", currency: "EUR", symbol: "€", timezone: "Europe/Amsterdam" },
  { code: "SE", name: "Sweden", flag: "🇸🇪", currency: "SEK", symbol: "kr ", timezone: "Europe/Stockholm" },
  { code: "NO", name: "Norway", flag: "🇳🇴", currency: "NOK", symbol: "kr ", timezone: "Europe/Oslo" },
  { code: "DK", name: "Denmark", flag: "🇩🇰", currency: "DKK", symbol: "kr ", timezone: "Europe/Copenhagen" },
  { code: "IE", name: "Ireland", flag: "🇮🇪", currency: "EUR", symbol: "€", timezone: "Europe/Dublin" },
  { code: "AT", name: "Austria", flag: "🇦🇹", currency: "EUR", symbol: "€", timezone: "Europe/Vienna" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", currency: "ZAR", symbol: "R ", timezone: "Africa/Johannesburg" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", currency: "MXN", symbol: "$", timezone: "America/Mexico_City" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", currency: "BRL", symbol: "R$ ", timezone: "America/Sao_Paulo" },
  { code: "AR", name: "Argentina", flag: "🇦🇷", currency: "ARS", symbol: "$", timezone: "America/Argentina/Buenos_Aires" },
  { code: "QA", name: "Qatar", flag: "🇶🇦", currency: "QAR", symbol: "QR ", timezone: "Asia/Qatar" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", currency: "SAR", symbol: "SR ", timezone: "Asia/Riyadh" },
  { code: "OM", name: "Oman", flag: "🇴🇲", currency: "OMR", symbol: "OMR ", timezone: "Asia/Muscat" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼", currency: "KWD", symbol: "KD ", timezone: "Asia/Kuwait" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭", currency: "BHD", symbol: "BD ", timezone: "Asia/Bahrain" },
  { code: "IL", name: "Israel", flag: "🇮🇱", currency: "ILS", symbol: "₪", timezone: "Asia/Jerusalem" },
  { code: "PH", name: "Philippines", flag: "🇵🇭", currency: "PHP", symbol: "₱", timezone: "Asia/Manila" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳", currency: "VND", symbol: "₫", timezone: "Asia/Ho_Chi_Minh" },
  { code: "FI", name: "Finland", flag: "🇫🇮", currency: "EUR", symbol: "€", timezone: "Europe/Helsinki" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", currency: "EUR", symbol: "€", timezone: "Europe/Lisbon" },
  { code: "GR", name: "Greece", flag: "🇬🇷", currency: "EUR", symbol: "€", timezone: "Europe/Athens" },
  { code: "TR", name: "Turkey", flag: "🇹🇷", currency: "TRY", symbol: "₺", timezone: "Europe/Istanbul" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰", currency: "HKD", symbol: "$", timezone: "Asia/Hong_Kong" },
  { code: "TW", name: "Taiwan", flag: "🇹🇼", currency: "TWD", symbol: "NT$ ", timezone: "Asia/Taipei" },
  { code: "MU", name: "Mauritius", flag: "🇲🇺", currency: "MUR", symbol: "Rs ", timezone: "Indian/Mauritius" },
  { code: "MV", name: "Maldives", flag: "🇲🇻", currency: "MVR", symbol: "Rf ", timezone: "Indian/Maldives" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", currency: "BDT", symbol: "৳", timezone: "Asia/Dhaka" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", currency: "PKR", symbol: "Rs ", timezone: "Asia/Karachi" },
];

export interface LocationPreferences {
  countryCode: string;
  countryName: string;
  flag: string;
  currency: string;
  timezone: string;
  locale: string;
  dir: "ltr" | "rtl";
  isCustomized: boolean;
}

interface LocationContextValue extends LocationPreferences {
  updateLocation: (countryCode: string, currency?: string, timezone?: string, locale?: string) => void;
  autoDetect: () => void;
  openModal: () => void;
  closeModal: () => void;
  isModalOpen: boolean;
}

const STORAGE_KEY = "ayurpass_location_preferences_v2";

const DEFAULT_PREFS: LocationPreferences = {
  countryCode: "AU",
  countryName: "Australia",
  flag: "🇦🇺",
  currency: "AUD",
  timezone: "Australia/Sydney",
  locale: "en",
  dir: "ltr",
  isCustomized: false,
};

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [prefs, setPrefs] = useState<LocationPreferences>(DEFAULT_PREFS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto-detect based on browser timezone & language
  const detectFromBrowser = useCallback((): LocationPreferences => {
    try {
      const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const browserLang = localeFromBrowser(typeof navigator !== "undefined" ? navigator.language : "en");
      const matched = SUPPORTED_COUNTRIES.find(
        (c) => c.timezone === browserTz || browserTz.startsWith(c.timezone.split("/")[0]),
      );
      if (matched) {
        return {
          countryCode: matched.code,
          countryName: matched.name,
          flag: matched.flag,
          currency: matched.currency,
          timezone: browserTz || matched.timezone,
          locale: browserLang,
          dir: localeDir(browserLang),
          isCustomized: false,
        };
      }
    } catch {
      // Ignore
    }
    return DEFAULT_PREFS;
  }, []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as LocationPreferences;
        if (parsed && parsed.countryCode) {
          setPrefs(parsed);
          if (typeof document !== "undefined") {
            document.documentElement.lang = parsed.locale || "en";
            document.documentElement.dir = parsed.dir || "ltr";
          }
          return;
        }
      }
    } catch {
      // Ignore storage errors
    }

    const detected = detectFromBrowser();
    setPrefs(detected);
    if (typeof document !== "undefined") {
      document.documentElement.lang = detected.locale || "en";
      document.documentElement.dir = detected.dir || "ltr";
    }
  }, [detectFromBrowser]);

  const updateLocation = useCallback((countryCode: string, customCurrency?: string, customTimezone?: string, customLocale?: string) => {
    const matched = SUPPORTED_COUNTRIES.find((c) => c.code === countryCode) || SUPPORTED_COUNTRIES[0];
    const newLocale = customLocale || prefs.locale || "en";
    const dir = localeDir(newLocale);
    const updated: LocationPreferences = {
      countryCode: matched.code,
      countryName: matched.name,
      flag: matched.flag,
      currency: customCurrency || matched.currency,
      timezone: customTimezone || matched.timezone,
      locale: newLocale,
      dir,
      isCustomized: true,
    };
    setPrefs(updated);
    if (typeof document !== "undefined") {
      document.documentElement.lang = newLocale;
      document.documentElement.dir = dir;
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      document.cookie = `ayurpass_country=${matched.code}; path=/; max-age=31536000`;
      document.cookie = `ayurpass_currency=${updated.currency}; path=/; max-age=31536000`;
      document.cookie = `ayurpass_locale=${newLocale}; path=/; max-age=31536000`;
    } catch {
      // Ignore storage errors
    }
    setIsModalOpen(false);
  }, [prefs.locale]);

  const autoDetect = useCallback(() => {
    const detected = detectFromBrowser();
    updateLocation(detected.countryCode, detected.currency, detected.timezone, detected.locale);
  }, [detectFromBrowser, updateLocation]);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  return (
    <LocationContext.Provider
      value={{
        ...prefs,
        updateLocation,
        autoDetect,
        openModal,
        closeModal,
        isModalOpen,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation(): LocationContextValue {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    throw new Error("useLocation must be used inside <LocationProvider>");
  }
  return ctx;
}

