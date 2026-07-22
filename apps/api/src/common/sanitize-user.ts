/** Strips the bcrypt hash before a user object leaves the API boundary. */
export function sanitizeUser<T extends { passwordHash?: string | null }>(
  user: T | null,
): Omit<T, 'passwordHash'> | null {
  if (!user) return user;
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}
