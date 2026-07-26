/**
 * Global locale & market foundation for AyurPass.
 * UI copy is English-first; structure is ready for additional languages.
 */

export type AppLocale = {
  /** BCP 47 language tag */
  code: string;
  /** English name */
  name: string;
  /** Native name */
  nativeName: string;
  /** Primary markets that default to this locale */
  markets?: string[];
  dir?: "ltr" | "rtl";
};

/** Languages we plan to support (English ships fully; others ready for content). */
export const SUPPORTED_LOCALES: AppLocale[] = [
  { code: "en", name: "English", nativeName: "English", markets: ["AU", "US", "GB", "IN", "SG", "AE"] },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी", markets: ["IN"] },
  { code: "es", name: "Spanish", nativeName: "Español", markets: ["ES", "MX", "AR"] },
  { code: "pt", name: "Portuguese", nativeName: "Português", markets: ["PT", "BR"] },
  { code: "fr", name: "French", nativeName: "Français", markets: ["FR", "CA", "CH"] },
  { code: "de", name: "German", nativeName: "Deutsch", markets: ["DE", "AT", "CH"] },
  { code: "ar", name: "Arabic", nativeName: "العربية", markets: ["AE", "SA", "QA"], dir: "rtl" },
  { code: "ja", name: "Japanese", nativeName: "日本語", markets: ["JP"] },
  { code: "ko", name: "Korean", nativeName: "한국어", markets: ["KR"] },
  { code: "zh-Hans", name: "Chinese (Simplified)", nativeName: "简体中文", markets: ["SG", "MY"] },
  { code: "id", name: "Indonesian", nativeName: "Bahasa Indonesia", markets: ["ID"] },
  { code: "th", name: "Thai", nativeName: "ไทย", markets: ["TH"] },
];

export const DEFAULT_LOCALE = "en";

/** ISO markets with launch priority (store listings, marketing, support hours). */
export const GLOBAL_MARKETS = [
  { code: "AU", name: "Australia", tier: 1 },
  { code: "IN", name: "India", tier: 1 },
  { code: "US", name: "United States", tier: 1 },
  { code: "GB", name: "United Kingdom", tier: 1 },
  { code: "AE", name: "United Arab Emirates", tier: 1 },
  { code: "SG", name: "Singapore", tier: 1 },
  { code: "NZ", name: "New Zealand", tier: 1 },
  { code: "CA", name: "Canada", tier: 2 },
  { code: "DE", name: "Germany", tier: 2 },
  { code: "FR", name: "France", tier: 2 },
  { code: "NL", name: "Netherlands", tier: 2 },
  { code: "IE", name: "Ireland", tier: 2 },
  { code: "LK", name: "Sri Lanka", tier: 2 },
  { code: "NP", name: "Nepal", tier: 2 },
  { code: "TH", name: "Thailand", tier: 2 },
  { code: "ID", name: "Indonesia", tier: 2 },
  { code: "MY", name: "Malaysia", tier: 2 },
  { code: "JP", name: "Japan", tier: 2 },
  { code: "KR", name: "South Korea", tier: 3 },
  { code: "ZA", name: "South Africa", tier: 3 },
  { code: "BR", name: "Brazil", tier: 3 },
  { code: "MX", name: "Mexico", tier: 3 },
  { code: "PH", name: "Philippines", tier: 3 },
  { code: "VN", name: "Vietnam", tier: 3 },
] as const;

export function localeFromBrowser(navLang?: string | null): string {
  if (!navLang) return DEFAULT_LOCALE;
  const base = navLang.toLowerCase().split("-")[0];
  if (SUPPORTED_LOCALES.some((l) => l.code === navLang || l.code === base)) {
    return SUPPORTED_LOCALES.find((l) => l.code === navLang)?.code
      ?? SUPPORTED_LOCALES.find((l) => l.code === base)?.code
      ?? DEFAULT_LOCALE;
  }
  // zh-CN → zh-Hans
  if (navLang.toLowerCase().startsWith("zh")) return "zh-Hans";
  return DEFAULT_LOCALE;
}

export function localeDir(code: string): "ltr" | "rtl" {
  return SUPPORTED_LOCALES.find((l) => l.code === code)?.dir ?? "ltr";
}

/** Format money using the user's preferred locale + currency. */
export function formatMoneyGlobal(
  amount: number,
  currency = "AUD",
  locale = DEFAULT_LOCALE,
): string {
  try {
    return new Intl.NumberFormat(locale === "zh-Hans" ? "zh-CN" : locale, {
      style: "currency",
      currency: currency.toUpperCase(),
      maximumFractionDigits: ["JPY", "KRW", "VND", "IDR"].includes(currency.toUpperCase())
        ? 0
        : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/** Format a date/time in a practice timezone for any locale. */
export function formatDateTimeGlobal(
  iso: string | Date,
  opts?: {
    locale?: string;
    timeZone?: string;
    dateStyle?: Intl.DateTimeFormatOptions["dateStyle"];
    timeStyle?: Intl.DateTimeFormatOptions["timeStyle"];
  },
): string {
  const d = typeof iso === "string" ? new Date(iso) : iso;
  const locale = opts?.locale ?? DEFAULT_LOCALE;
  try {
    return new Intl.DateTimeFormat(locale === "zh-Hans" ? "zh-CN" : locale, {
      dateStyle: opts?.dateStyle ?? "medium",
      timeStyle: opts?.timeStyle ?? "short",
      timeZone: opts?.timeZone,
    }).format(d);
  } catch {
    return d.toLocaleString();
  }
}

/** Lightweight translation dictionary for core UI elements across key global languages. */
export const I18N_TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    nav_discover: "Discover",
    nav_offers: "Offers",
    nav_calendar: "Calendar",
    nav_sessions: "Sessions",
    nav_shop: "Shop",
    nav_packages: "Packages",
    nav_retreats: "Retreats",
    nav_about: "About Us",
    nav_list_business: "List Your Business",
    btn_book_now: "Book Now",
    btn_enquire: "Enquire",
    btn_sign_in: "Sign In",
    btn_register: "Register",
    btn_location: "Region & Language",
    lbl_select_language: "Select Language",
    lbl_select_country: "Select Country",
    lbl_select_currency: "Select Currency",
    lbl_select_timezone: "Select Timezone",
  },
  hi: {
    nav_discover: "खोजें",
    nav_offers: "ऑफ़र",
    nav_calendar: "कैलेंडर",
    nav_sessions: "सत्र",
    nav_shop: "दुकान",
    nav_packages: "पैकेज",
    nav_retreats: "रिट्रीट",
    nav_about: "हमारे बारे में",
    nav_list_business: "अपना व्यवसाय सूचीबद्ध करें",
    btn_book_now: "अभी बुक करें",
    btn_enquire: "पूछताछ करें",
    btn_sign_in: "साइन इन",
    btn_register: "रजिस्टर करें",
    btn_location: "क्षेत्र और भाषा",
    lbl_select_language: "भाषा चुनें",
    lbl_select_country: "देश चुनें",
    lbl_select_currency: "मुद्रा चुनें",
    lbl_select_timezone: "समय क्षेत्र चुनें",
  },
  es: {
    nav_discover: "Descubrir",
    nav_offers: "Ofertas",
    nav_calendar: "Calendario",
    nav_sessions: "Sesiones",
    nav_shop: "Tienda",
    nav_packages: "Paquetes",
    nav_retreats: "Retiros",
    nav_about: "Nosotros",
    nav_list_business: "Anuncia tu Negocio",
    btn_book_now: "Reservar Ahora",
    btn_enquire: "Consultar",
    btn_sign_in: "Iniciar Sesión",
    btn_register: "Registrarse",
    btn_location: "Región e Idioma",
    lbl_select_language: "Seleccionar Idioma",
    lbl_select_country: "Seleccionar País",
    lbl_select_currency: "Seleccionar Moneda",
    lbl_select_timezone: "Seleccionar Zona Horaria",
  },
  fr: {
    nav_discover: "Découvrir",
    nav_offers: "Offres",
    nav_calendar: "Calendrier",
    nav_sessions: "Séances",
    nav_shop: "Boutique",
    nav_packages: "Forfaits",
    nav_retreats: "Retraites",
    nav_about: "À propos",
    nav_list_business: "Référencer votre établissement",
    btn_book_now: "Réserver",
    btn_enquire: "Se renseigner",
    btn_sign_in: "Se connecter",
    btn_register: "S'inscrire",
    btn_location: "Région et Langue",
    lbl_select_language: "Choisir la langue",
    lbl_select_country: "Choisir le pays",
    lbl_select_currency: "Choisir la devise",
    lbl_select_timezone: "Choisir le fuseau horaire",
  },
  de: {
    nav_discover: "Entdecken",
    nav_offers: "Angebote",
    nav_calendar: "Kalender",
    nav_sessions: "Sitzungen",
    nav_shop: "Shop",
    nav_packages: "Pakete",
    nav_retreats: "Retreats",
    nav_about: "Über uns",
    nav_list_business: "Praxis eintragen",
    btn_book_now: "Jetzt buchen",
    btn_enquire: "Anfragen",
    btn_sign_in: "Anmelden",
    btn_register: "Registrieren",
    btn_location: "Region & Sprache",
    lbl_select_language: "Sprache wählen",
    lbl_select_country: "Land wählen",
    lbl_select_currency: "Währung wählen",
    lbl_select_timezone: "Zeitzone wählen",
  },
  ar: {
    nav_discover: "اكتشف",
    nav_offers: "العروض",
    nav_calendar: "التقويم",
    nav_sessions: "الجلسات",
    nav_shop: "المتجر",
    nav_packages: "الباقات",
    nav_retreats: "المنتجعات",
    nav_about: "من نحن",
    nav_list_business: "أدرج عملك",
    btn_book_now: "احجز الآن",
    btn_enquire: "استفسر",
    btn_sign_in: "تسجيل الدخول",
    btn_register: "التسجيل",
    btn_location: "المنطقة واللغة",
    lbl_select_language: "اختر اللغة",
    lbl_select_country: "اختر الدولة",
    lbl_select_currency: "اختر العملة",
    lbl_select_timezone: "اختر المنطقة الزمنية",
  },
  ja: {
    nav_discover: "発見する",
    nav_offers: "特別オファー",
    nav_calendar: "カレンダー",
    nav_sessions: "セッション",
    nav_shop: "ショップ",
    nav_packages: "パッケージ",
    nav_retreats: "リトリート",
    nav_about: "AyurPassについて",
    nav_list_business: "施設を登録する",
    btn_book_now: "今すぐ予約",
    btn_enquire: "お問い合わせ",
    btn_sign_in: "ログイン",
    btn_register: "新規登録",
    btn_location: "地域・言語設定",
    lbl_select_language: "言語を選択",
    lbl_select_country: "国を選択",
    lbl_select_currency: "通貨を選択",
    lbl_select_timezone: "タイムゾーンを選択",
  },
  "zh-Hans": {
    nav_discover: "探索",
    nav_offers: "特惠",
    nav_calendar: "日历",
    nav_sessions: "课程",
    nav_shop: "商城",
    nav_packages: "套餐",
    nav_retreats: "静修营",
    nav_about: "关于我们",
    nav_list_business: "入驻您的机构",
    btn_book_now: "立即预订",
    btn_enquire: "咨询",
    btn_sign_in: "登录",
    btn_register: "注册",
    btn_location: "地区与语言",
    lbl_select_language: "选择语言",
    lbl_select_country: "选择国家/地区",
    lbl_select_currency: "选择货币",
    lbl_select_timezone: "选择时区",
  },
};

/** Translate a UI string key for a given locale code, falling back to English. */
export function t(key: string, locale = DEFAULT_LOCALE): string {
  const dict = I18N_TRANSLATIONS[locale] || I18N_TRANSLATIONS[DEFAULT_LOCALE];
  return dict?.[key] || I18N_TRANSLATIONS[DEFAULT_LOCALE]?.[key] || key;
}

