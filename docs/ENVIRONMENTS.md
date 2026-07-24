# Environments — industry standard for AyurPass

## Principle

**Never mix production identity data with local UI by default.**

| Environment | Web URL | API | Database | Who logs in |
|-------------|---------|-----|----------|-------------|
| **Local (dev)** | `http://localhost:3000` | `http://localhost:4000` | Local Postgres | Seeded demo users only |
| **Production** | `https://ayurpass.com` | `https://api.ayurpass.com` | AWS RDS | Real members |
| **Staging** (optional) | staging host | staging API | separate DB | Test accounts only |

This is the standard 12-factor / OWASP-friendly split used by mature product teams.

## Why we do **not** log into prod from localhost

Pointing `localhost:3000` at `https://api.ayurpass.com` and opening CORS for localhost:

- Risks **accidental writes** to live bookings, users, and payments  
- Widens production **CORS** (any malicious site on a developer machine is a different threat model)  
- Blurs audit trails (“was that a real member or a dev?”)  
- Makes bugs harder to reproduce  

**Production is only used via production domains.** Local uses a throwaway DB and demo logins.

## Local setup (secure default)

```bash
# 1. Env files — local API only
cp apps/api/.env.example apps/api/.env
cp apps/dashboard/.env.example apps/dashboard/.env.local
# Ensure:
#   NEXT_PUBLIC_API_URL=http://localhost:4000
#   DATABASE_URL=...localhost.../ayurpass_dev
#   CORS_ORIGIN=http://localhost:3000

# 2. Install, migrate, seed demo users
npm install
npm run prisma:generate
npm run prisma:migrate
npm run seed:local

# 3. Run
npm start
```

### Demo logins (local only)

| Role | Email | Password |
|------|-------|----------|
| Seeker | `seeker@local.ayurpass.dev` | `LocalDev!23456` |
| Practice owner | `provider@local.ayurpass.dev` | `LocalDev!23456` |

These accounts are created by `npm run seed:local`, which **refuses** to run if `DATABASE_URL` looks like RDS/production.

## Production rules (already enforced)

- `CORS_ORIGIN` = `https://ayurpass.com,https://www.ayurpass.com` only  
- No `localhost` in production CORS  
- Strict env blocks weak JWT secrets and mock payments  
- Real members use https://ayurpass.com only  

## Optional: staging

If you need “almost production” data without risk:

1. Separate RDS / Neon database  
2. Separate ECS service or task definition  
3. Separate Amplify branch  
4. `CORS_ORIGIN` limited to the staging web origin  
5. Synthetic users only — never clone production passwords without a formal process  

## Developer checklist

- [ ] `.env.local` points at `http://localhost:4000`  
- [ ] You can log in with seeded local users  
- [ ] You test real-member behaviour on **ayurpass.com** (or a proper staging host)  
- [ ] You never commit production secrets into the repo  
