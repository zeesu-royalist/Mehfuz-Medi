# Souled Clone — E-Commerce Platform

Production-style clone of the reference UI (Next.js 15 App Router, TypeScript,
Tailwind, Shadcn UI, Prisma, PostgreSQL, Auth.js, Cloudinary, Zustand).

## Getting started locally

```bash
npm install
cp .env.example .env   # fill in your DB, Auth, Cloudinary, Resend keys
npm run db:push        # or db:migrate once schema is finalized
npm run dev
npm run db:seed         # creates an admin user + base categories
```

Seeded admin login: `admin@souledclone.dev` / `Admin@12345` (change immediately in a real deployment).

## Auth flows implemented

- Register (`/register`) — creates User + empty Cart + empty Wishlist in one transaction-safe call
- Login (`/login`) — Auth.js Credentials provider, bcrypt-verified, blocked users rejected
- Forgot password (`/forgot-password`) → emails a time-limited reset token (logs to console if `RESEND_API_KEY` isn't set)
- Reset password (`/reset-password?token=...`)
- Change password — `changePassword` server action (used from the account settings page in Module 9)
- Role-based route protection via `middleware.ts` — `/admin/*` requires `ADMIN`, `/account/*` and `/checkout/*` require any logged-in user

## Module roadmap

- [x] 1. Project setup — config, tokens, folder structure
- [x] 2. Authentication (Auth.js v5, credentials + roles)
- [x] 3. Database (Prisma schema, all models)
- [ ] 4. Cloudinary (signed uploads, delete-on-replace)
- [ ] 5. UI Components (design system: buttons, inputs, cards, nav)
- [ ] 6. Products (listing, filters, sort, PDP)
- [ ] 7. Categories
- [ ] 8. Wishlist
- [ ] 9. Cart (guest + persisted, merge on login)
- [ ] 10. Orders & checkout
- [ ] 11. Admin dashboard
- [ ] 12. Performance optimization
- [ ] 13. Final testing

Each module ships complete and working before the next begins.

## Design tokens (from reference screenshots)

| Token | Value | Use |
|---|---|---|
| `brand.red` | `#E1261C` | Primary CTA, logo, active nav underline |
| `brand.navy` | `#0C1C4E` | Top utility bar |
| `brand.ink` | `#1A1A1A` | Headings, nav text |
| `brand.cream` | `#F7F6F3` | Section backgrounds |
| `brand.mint` | `#E8F4F3` | Perks strip (cashback / returns / shipping) |
| Display font | Bebas Neue | Hero + section headings ("POLOS", "CATEGORIES") |
| Body font | Inter | Nav, body copy, prices |
