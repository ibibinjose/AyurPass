export declare function sanitizeUser<T extends {
    passwordHash?: string | null;
}>(user: T | null): Omit<T, 'passwordHash'> | null;
