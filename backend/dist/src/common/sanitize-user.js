"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeUser = sanitizeUser;
function sanitizeUser(user) {
    if (!user)
        return user;
    const { passwordHash: _passwordHash, ...rest } = user;
    return rest;
}
//# sourceMappingURL=sanitize-user.js.map