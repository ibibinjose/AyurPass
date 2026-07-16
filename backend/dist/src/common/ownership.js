"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertSelfOrAdmin = assertSelfOrAdmin;
const common_1 = require("@nestjs/common");
function assertSelfOrAdmin(user, consumerId) {
    if (user.role === 'PLATFORM_ADMIN')
        return;
    if (user.sub === consumerId)
        return;
    throw new common_1.ForbiddenException('You can only access your own data');
}
//# sourceMappingURL=ownership.js.map