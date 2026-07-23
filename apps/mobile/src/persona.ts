import type { UserProfile } from "./types";

/**
 * Mobile post-login home. Business tools stay on web dashboard for now;
 * seekers land in Discover tabs; practitioners still get the consumer app
 * with a link to open the practice hub on the web.
 */
export function mobileHomeForUser(user: UserProfile | null | undefined): string {
  if (!user) return "/(auth)/welcome";
  // Everyone uses the same native tabs for wellness; role is reflected in Profile.
  return "/(tabs)";
}

export function isPracticeRole(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  return (
    user.role === "PROVIDER_ADMIN" ||
    user.role === "PLATFORM_ADMIN" ||
    Boolean(user.provider)
  );
}

export function isStaffRole(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  return user.role === "PROFESSIONAL" || Boolean(user.professional);
}

export function roleLabel(role: string | undefined): string {
  switch (role) {
    case "CONSUMER":
      return "Seeker";
    case "PROFESSIONAL":
      return "Therapist";
    case "PROVIDER_ADMIN":
      return "Practice";
    case "PLATFORM_ADMIN":
      return "Admin";
    default:
      return "Member";
  }
}
