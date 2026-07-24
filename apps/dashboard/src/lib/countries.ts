/**
 * Country list + dial codes for signup and booking contact phone.
 * Aligned with LocationContext SUPPORTED_COUNTRIES where possible.
 */

export type CountryDial = {
  code: string;
  name: string;
  flag: string;
  dial: string;
};

export const COUNTRIES_WITH_DIAL: CountryDial[] = [
  { code: "AU", name: "Australia", flag: "🇦🇺", dial: "+61" },
  { code: "IN", name: "India", flag: "🇮🇳", dial: "+91" },
  { code: "US", name: "United States", flag: "🇺🇸", dial: "+1" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", dial: "+44" },
  { code: "AE", name: "United Arab Emirates", flag: "🇦🇪", dial: "+971" },
  { code: "CA", name: "Canada", flag: "🇨🇦", dial: "+1" },
  { code: "NZ", name: "New Zealand", flag: "🇳🇿", dial: "+64" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", dial: "+65" },
  { code: "DE", name: "Germany", flag: "🇩🇪", dial: "+49" },
  { code: "LK", name: "Sri Lanka", flag: "🇱🇰", dial: "+94" },
  { code: "NP", name: "Nepal", flag: "🇳🇵", dial: "+977" },
  { code: "TH", name: "Thailand", flag: "🇹🇭", dial: "+66" },
  { code: "ID", name: "Indonesia", flag: "🇮🇩", dial: "+62" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", dial: "+60" },
  { code: "JP", name: "Japan", flag: "🇯🇵", dial: "+81" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", dial: "+82" },
  { code: "CH", name: "Switzerland", flag: "🇨🇭", dial: "+41" },
  { code: "FR", name: "France", flag: "🇫🇷", dial: "+33" },
  { code: "IT", name: "Italy", flag: "🇮🇹", dial: "+39" },
  { code: "ES", name: "Spain", flag: "🇪🇸", dial: "+34" },
  { code: "NL", name: "Netherlands", flag: "🇳🇱", dial: "+31" },
  { code: "SE", name: "Sweden", flag: "🇸🇪", dial: "+46" },
  { code: "NO", name: "Norway", flag: "🇳🇴", dial: "+47" },
  { code: "DK", name: "Denmark", flag: "🇩🇰", dial: "+45" },
  { code: "IE", name: "Ireland", flag: "🇮🇪", dial: "+353" },
  { code: "AT", name: "Austria", flag: "🇦🇹", dial: "+43" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", dial: "+27" },
  { code: "MX", name: "Mexico", flag: "🇲🇽", dial: "+52" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", dial: "+55" },
  { code: "AR", name: "Argentina", flag: "🇦🇷", dial: "+54" },
  { code: "QA", name: "Qatar", flag: "🇶🇦", dial: "+974" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", dial: "+966" },
  { code: "OM", name: "Oman", flag: "🇴🇲", dial: "+968" },
  { code: "KW", name: "Kuwait", flag: "🇰🇼", dial: "+965" },
  { code: "BH", name: "Bahrain", flag: "🇧🇭", dial: "+973" },
  { code: "IL", name: "Israel", flag: "🇮🇱", dial: "+972" },
  { code: "PH", name: "Philippines", flag: "🇵🇭", dial: "+63" },
  { code: "VN", name: "Vietnam", flag: "🇻🇳", dial: "+84" },
  { code: "FI", name: "Finland", flag: "🇫🇮", dial: "+358" },
  { code: "PT", name: "Portugal", flag: "🇵🇹", dial: "+351" },
  { code: "GR", name: "Greece", flag: "🇬🇷", dial: "+30" },
  { code: "TR", name: "Turkey", flag: "🇹🇷", dial: "+90" },
  { code: "HK", name: "Hong Kong", flag: "🇭🇰", dial: "+852" },
  { code: "TW", name: "Taiwan", flag: "🇹🇼", dial: "+886" },
  { code: "MU", name: "Mauritius", flag: "🇲🇺", dial: "+230" },
  { code: "MV", name: "Maldives", flag: "🇲🇻", dial: "+960" },
  { code: "BD", name: "Bangladesh", flag: "🇧🇩", dial: "+880" },
  { code: "PK", name: "Pakistan", flag: "🇵🇰", dial: "+92" },
];

export function countryByCode(code: string): CountryDial | undefined {
  return COUNTRIES_WITH_DIAL.find((c) => c.code === code.toUpperCase());
}

export function dialForCountryCode(code: string): string {
  return countryByCode(code)?.dial ?? "+61";
}

/** Format E.164-ish phone: dial + national digits. */
export function formatInternationalPhone(dial: string, national: string): string {
  const digits = national.replace(/\D/g, "").replace(/^0+/, "");
  const d = dial.startsWith("+") ? dial : `+${dial}`;
  return `${d}${digits}`;
}

/** Basic validation: dial + at least 6 national digits. */
export function isValidPhone(dial: string, national: string): boolean {
  const digits = national.replace(/\D/g, "").replace(/^0+/, "");
  return digits.length >= 6 && digits.length <= 15 && /^\+\d{1,4}$/.test(dial.startsWith("+") ? dial : `+${dial}`);
}
