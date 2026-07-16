"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const bcrypt = require("bcrypt");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../prisma/prisma.service");
const sanitize_user_1 = require("../../common/sanitize-user");
let AuthService = class AuthService {
    constructor(usersService, jwtService, prisma) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.prisma = prisma;
    }
    async register(registerDto) {
        const existingUser = await this.usersService.findByEmail(registerDto.email);
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        const hashedPassword = await bcrypt.hash(registerDto.password, 10);
        const user = await this.usersService.createUser({
            email: registerDto.email,
            fullName: registerDto.fullName,
            role: registerDto.role || 'CONSUMER',
            passwordHash: hashedPassword,
            phone: registerDto.phone,
        });
        if (registerDto.role === 'CONSUMER') {
            await this.prisma.consumer.create({
                data: {
                    userId: user.id,
                    prakritiScores: registerDto.prakritiScores || {},
                    preferences: registerDto.preferences || {},
                },
            });
        }
        else if (registerDto.role === 'PROFESSIONAL' || registerDto.role === 'PROVIDER_ADMIN') {
            const provider = await this.prisma.provider.create({
                data: {
                    userId: user.id,
                    businessName: registerDto.businessName || `${registerDto.fullName}'s Practice`,
                    type: registerDto.providerType || 'AYURVEDA_CLINIC',
                    listingTier: registerDto.listingTier === 'FREE_LISTING' ? 'FREE_LISTING' : 'BOOKING',
                },
            });
            await this.prisma.professional.create({
                data: {
                    userId: user.id,
                    providerId: provider.id,
                    title: registerDto.title,
                    specializations: registerDto.specializations || [],
                    bio: registerDto.bio,
                },
            });
        }
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        return { user: (0, sanitize_user_1.sanitizeUser)(user), ...tokens };
    }
    async login(email, password) {
        const user = await this.usersService.findByEmail(email);
        if (!user || !user.passwordHash) {
            throw new Error('Invalid credentials');
        }
        const isValidPassword = await bcrypt.compare(password, user.passwordHash);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }
        const tokens = await this.generateTokens(user.id, user.email, user.role);
        return { user: (0, sanitize_user_1.sanitizeUser)(user), ...tokens };
    }
    async refreshTokens(refreshToken) {
        try {
            const payload = await this.jwtService.verifyAsync(refreshToken, {
                secret: process.env.JWT_REFRESH_SECRET,
            });
            const user = await this.usersService.findById(payload.sub);
            if (!user) {
                throw new Error('User not found');
            }
            return this.generateTokens(user.id, user.email, user.role);
        }
        catch (error) {
            throw new Error('Invalid refresh token');
        }
    }
    async getProfile(token) {
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: process.env.JWT_ACCESS_SECRET,
            });
            return (0, sanitize_user_1.sanitizeUser)(await this.usersService.findById(payload.sub));
        }
        catch (error) {
            throw new Error('Invalid token');
        }
    }
    async generateTokens(userId, email, role) {
        const payload = { sub: userId, email, role };
        const accessToken = this.jwtService.sign(payload, {
            expiresIn: (process.env.JWT_ACCESS_EXPIRES ||
                '15m'),
            secret: process.env.JWT_ACCESS_SECRET,
        });
        const refreshToken = this.jwtService.sign(payload, {
            expiresIn: (process.env.JWT_REFRESH_EXPIRES ||
                '7d'),
            secret: process.env.JWT_REFRESH_SECRET,
        });
        return {
            accessToken,
            refreshToken,
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        prisma_service_1.PrismaService])
], AuthService);
//# sourceMappingURL=auth.service.js.map