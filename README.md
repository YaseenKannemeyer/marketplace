# StudentMarket SA - South African Student Marketplace

A full-featured Facebook Marketplace clone built specifically for South African university students. Buy and sell textbooks, electronics, accommodation, and more with verified student accounts across 20+ SA universities.

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Database Setup](#database-setup)
5. [Running the Application](#running-the-application)
6. [Production Deployment](#production-deployment)
7. [Project Structure](#project-structure)
8. [Technology Stack](#technology-stack)
9. [API Reference](#api-reference)
10. [Features](#features)
11. [Demo Accounts](#demo-accounts)
12. [Environment Variables](#environment-variables)

---

## Quick Start

```bash
# 1. Clone the repository
git clone <repo-url> studentmarket-sa
cd studentmarket-sa

# 2. Install dependencies
npm install

# 3. Set up environment
cp .env.example .env

# 4. Initialize database
npx prisma db push
npx prisma generate
npm run db:seed

# 5. Start development server
npm run dev

# 6. Open in browser
open http://localhost:3000
```

---

## Prerequisites

| Requirement | Minimum Version | Installation |
|------------|-----------------|-------------|
| **Node.js** | v18.0+ | [nodejs.org](https://nodejs.org/) or `nvm install 18` |
| **npm** | v9.0+ (bundled with Node) | Included with Node.js |
| **SQLite** | Not required (managed by Prisma) | — |
| **Git** | v2.0+ | [git-scm.com](https://git-scm.com/) |

No database server is needed. The project uses SQLite via Prisma ORM, which stores data in a local file (`db/custom.db`).

---

## Installation

### Step 1: Clone and Install

```bash
git clone <repo-url> studentmarket-sa
cd studentmarket-sa
npm install
```

### Step 2: Environment Configuration

```bash
cp .env.example .env
```

Edit `.env` to set your database path:

```env
DATABASE_URL=file:./db/custom.db
```

### Step 3: Database Initialization

```bash
# Push schema to database (creates tables)
npx prisma db push

# Generate Prisma client (TypeScript types for DB)
npx prisma generate

# Seed with demo data (10 users, 27 listings, categories, universities, conversations)
npm run db:seed
```

### Step 4: Create Upload Directories

The upload directories are created automatically on first file upload, but you can pre-create them:

```bash
mkdir -p uploads/{listings,profiles,avatars,stories,chat}
```

### Step 5: Start the Server

```bash
# Development mode (hot-reload, port 3000)
npm run dev

# Or using Bun (if installed)
bun run dev
```

Open **http://localhost:3000** in your browser.

---

## Database Setup

### Schema Overview

The database contains 9 models:

| Model | Purpose | Key Fields |
|-------|---------|-----------|
| **User** | Student accounts | id, name, email, password, university, avatar, verified |
| **Listing** | Items for sale | id, title, price, condition, categoryId, sellerId, images, status |
| **Category** | Product categories | id, name, icon, color (10 categories) |
| **University** | SA universities | id, name, shortName, province, campuses (13 universities) |
| **Conversation** | Chat threads | id, buyerId, sellerId, listingId, lastMessage |
| **ConversationMessage** | Chat messages | id, conversationId, senderId, content, messageType, mediaUrl |
| **Message** | Legacy listing messages | id, listingId, senderId, receiverId, content |
| **Story** | Instagram-style stories | id, userId, mediaUrl, caption, expiresAt |
| **WishlistItem** | Saved/favourited items | userId, listingId (unique constraint) |

### Common Database Commands

```bash
# Sync schema changes to database
npx prisma db push

# Generate/refresh Prisma client types
npx prisma generate

# Seed database with demo data
npm run db:seed

# Open Prisma Studio (visual database browser)
npx prisma studio

# Reset database (WARNING: deletes all data)
npm run db:reset
```

### Data Persistence

All data is stored in **`db/custom.db`** (SQLite file). This file persists across server restarts. Back it up regularly for production use.

---

## Running the Application

### Development Mode

```bash
npm run dev
```

- Runs on **http://localhost:3000**
- Hot module replacement (HMR) enabled
- TypeScript error overlay in browser
- Prisma query logging enabled (visible in console)

### Production Build

```bash
# Build optimized production bundle
npm run build

# Start production server (uses standalone output)
npm run start
```

The `build` script produces a standalone server in `.next/standalone/` that includes all necessary dependencies. The `start` script runs it with Bun for optimal performance.

### Important Build Notes

- The project uses `output: "standalone"` in `next.config.ts`
- Static assets and public files are copied into the standalone build
- Uploaded files in `uploads/` are served at runtime (not bundled in build)
- The SQLite database file must be present at the configured path

---

## Production Deployment

### Local Production Server

```bash
# 1. Install dependencies
npm install

# 2. Set environment to production
cp .env.example .env
# Edit DATABASE_URL for your production path

# 3. Initialize database
npx prisma db push
npx prisma generate
npm run db:seed

# 4. Build
npm run build

# 5. Start production server
NODE_ENV=production node .next/standalone/server.js
```

### Recommended Deployment Platforms

| Platform | Difficulty | Notes |
|----------|-----------|-------|
| **VPS (DigitalOcean, Hetzner)** | Medium | Use PM2 for process management, Caddy/Nginx as reverse proxy |
| **Railway** | Easy | Auto-detects Next.js, add SQLite volume plugin |
| **Fly.io** | Medium | Use `fly.toml` with persistent volumes for SQLite |
| **Docker** | Medium | See Dockerfile example below |

### Docker Deployment (Optional)

```dockerfile
FROM node:18-alpine AS base
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Generate Prisma client
COPY prisma ./prisma/
RUN npx prisma generate

# Build Next.js
COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=base /app/.next/standalone ./
COPY --from=base /app/.next/static ./.next/static
COPY --from=base /app/public ./public
COPY --from=base /app/prisma ./prisma

# Create upload and database directories
RUN mkdir -p uploads/{listings,profiles,avatars,stories,chat} db

EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# Build and run with Docker
docker build -t studentmarket-sa .
docker run -p 3000:3000 \
  -v ./db:/app/db \
  -v ./uploads:/app/uploads \
  -e DATABASE_URL=file:./db/custom.db \
  studentmarket-sa
```

---

## Project Structure

```
studentmarket-sa/
├── .env                          # Environment variables (DB path, app config)
├── .env.example                  # Template for .env (committed to repo)
├── .gitignore                    # Git ignore rules
├── next.config.ts                # Next.js config (standalone output, TS options)
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── tailwind.config.ts            # Tailwind CSS configuration
├── postcss.config.mjs            # PostCSS plugins config
├── eslint.config.mjs             # ESLint configuration
├── components.json               # shadcn/ui component configuration
│
├── prisma/
│   ├── schema.prisma             # Database schema (9 models, relations)
│   └── seed.ts                   # Database seed script (users, listings, conversations)
│
├── db/
│   └── custom.db                 # SQLite database file (generated, git-ignored)
│
├── public/
│   ├── logo.svg                  # App logo
│   └── robots.txt                # Search engine directives
│
├── uploads/                      # User-uploaded files (git-ignored)
│   ├── listings/                 # Listing images
│   ├── profiles/                 # Profile gallery images
│   ├── avatars/                  # Profile picture uploads
│   ├── stories/                  # Story media uploads
│   └── chat/                     # Chat media (images, videos, voice notes)
│
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout (fonts, Toaster, metadata)
│   │   ├── page.tsx              # Home page - marketplace browse + create listing + auth
│   │   ├── globals.css           # Global CSS styles and Tailwind imports
│   │   │
│   │   ├── auth/
│   │   │   └── page.tsx          # Login/Signup page (split layout)
│   │   │
│   │   ├── listing/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Listing detail page (images, seller info, chat, share)
│   │   │
│   │   ├── chat/
│   │   │   ├── page.tsx          # Conversations list (inbox)
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Individual chat (text, image, video, voice notes)
│   │   │
│   │   ├── my-listings/
│   │   │   └── page.tsx          # Seller's listings management (stats, delete)
│   │   │
│   │   ├── wishlist/
│   │   │   └── page.tsx          # User's saved/favourited items
│   │   │
│   │   ├── profile/
│   │   │   └── page.tsx          # Profile editor (info, avatar, photos, password)
│   │   │
│   │   └── api/                  # REST API routes (14 endpoints)
│   │       ├── route.ts          # API root (health check)
│   │       ├── auth/
│   │       │   ├── login/
│   │       │   │   └── route.ts      # POST: authenticate user
│   │       │   ├── signup/
│   │       │   │   └── route.ts      # POST: register new user
│   │       │   └── verify-email/
│   │       │       └── route.ts      # POST: send verification, PUT: verify
│   │       ├── listings/
│   │       │   ├── route.ts          # GET: search listings, POST: create listing
│   │       │   └── [id]/
│   │       │       ├── route.ts      # GET: listing detail, DELETE: remove listing
│   │       │       └── messages/
│   │       │           └── route.ts  # GET/POST: listing comments
│   │       ├── conversations/
│   │       │   ├── route.ts          # GET: user conversations, POST: create conversation
│   │       │   └── [id]/messages/
│   │       │       └── route.ts      # GET: messages, POST: send message (text/image/video/voice)
│   │       ├── categories/
│   │       │   └── route.ts          # GET: all categories with listing counts
│   │       ├── universities/
│   │       │   └── route.ts          # GET: all universities with listing counts
│   │       ├── stories/
│   │       │   └── route.ts          # GET: active stories, POST: create story
│   │       ├── wishlist/
│   │       │   ├── route.ts          # GET: user wishlist, POST: toggle, DELETE: remove
│   │       │   └── check/
│   │       │       └── route.ts      # GET: check if listing is wishlisted
│   │       ├── notifications/
│   │       │   └── route.ts          # GET: unread count, PUT: mark read
│   │       ├── profile/
│   │       │   ├── route.ts          # GET/PUT: user profile
│   │       │   └── password/
│   │       │       └── route.ts      # PUT: change password
│   │       ├── upload/
│   │       │   └── route.ts          # POST: file upload (images, videos, audio)
│   │       └── files/
│   │           └── [...path]/
│   │               └── route.ts      # GET: serve uploaded files (static file server)
│   │
│   ├── components/
│   │   └── ui/                  # shadcn/ui component library (40+ components)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── badge.tsx
│   │       ├── avatar.tsx
│   │       ├── file-upload.tsx     # Custom drag-and-drop file uploader
│   │       └── ...                 # (accordion, select, tabs, sheet, tooltip, etc.)
│   │
│   ├── hooks/
│   │   ├── use-mobile.ts        # Mobile viewport detection hook
│   │   └── use-toast.ts          # Toast notification hook
│   │
│   ├── lib/
│   │   ├── db.ts                # Prisma client singleton (global in dev, fresh in prod)
│   │   └── utils.ts             # Utility functions (cn, merge classes)
│   │
│   └── store/
│       └── marketplace.ts       # Zustand state store (auth, filters, story viewing)
│
└── scripts/                       # Utility scripts (generated during development)
```

---

## Technology Stack

### Core Framework

| Technology | Version | Purpose | How It's Used |
|-----------|---------|---------|---------------|
| **Next.js** | 16.1+ | Full-stack React framework | App Router for routing, API routes for backend, standalone output for deployment |
| **React** | 19.0+ | UI library | Client components with hooks (useState, useEffect, useRef, useCallback) |
| **TypeScript** | 5.x | Type safety | All source files (.ts/.tsx), strict mode for catch bugs at compile time |

### Styling & UI

| Technology | Version | Purpose | How It's Used |
|-----------|---------|---------|---------------|
| **Tailwind CSS** | 4.x | Utility-first CSS | All styling via utility classes, responsive design (sm/md/lg/xl breakpoints) |
| **shadcn/ui** | Latest | Component library | 40+ pre-built components (Button, Card, Dialog, Avatar, Badge, etc.) |
| **Radix UI** | Latest | Headless primitives | Foundation for shadcn/ui components (accessible, composable) |
| **Lucide React** | 0.525+ | Icon library | 50+ icons used throughout (Search, Heart, Share2, Camera, Send, etc.) |
| **Framer Motion** | 12.23+ | Animations | Page transitions, story viewer progress bars, modal animations |
| **class-variance-authority** | 0.7+ | Component variants | Variant system for shadcn/ui button/card styles |
| **tailwind-merge** | 3.3+ | Class merging | Merge Tailwind classes without conflicts (cn utility) |

### Database & ORM

| Technology | Version | Purpose | How It's Used |
|-----------|---------|---------|---------------|
| **Prisma** | 6.11+ | ORM & schema management | Defines 9 database models with relations, type-safe queries |
| **SQLite** | Built-in | Database engine | Zero-config file-based database, no server needed |
| **Prisma Client** | Auto-generated | Type-safe DB access | Every database query uses generated types (no raw SQL) |

### State Management

| Technology | Version | Purpose | How It's Used |
|-----------|---------|---------|---------------|
| **Zustand** | 5.0+ | Client state | Persistent auth state (localStorage), view modes, filter state, story state |

### File Handling

| Technology | Version | Purpose | How It's Used |
|-----------|---------|---------|---------------|
| **react-dropzone** | 15.0+ | Drag-and-drop uploads | File uploader component for listing images, profile photos, stories |
| **Sharp** | 0.34+ | Image processing | Available for server-side image optimization |

### Data Format & Validation

| Technology | Version | Purpose | How It's Used |
|-----------|---------|---------|---------------|
| **Zod** | 4.0+ | Schema validation | Form validation, API input validation |
| **date-fns** | 4.1+ | Date formatting | Relative time display (timeAgo helper functions) |

---

## API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with email + password |
| POST | `/api/auth/signup` | Register new user (validates SA email domains) |
| POST | `/api/auth/verify-email` | Send verification email |
| PUT | `/api/auth/verify-email` | Verify email address |

### Listings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/listings?search=&categoryId=&universityId=&condition=&sortBy=&page=&limit=` | Search/filter listings |
| POST | `/api/listings` | Create new listing |
| GET | `/api/listings/[id]` | Get listing detail (includes seller, category, messages) |
| DELETE | `/api/listings/[id]` | Delete a listing |

### Conversations & Chat

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/conversations?userId=` | Get all conversations for a user |
| POST | `/api/conversations` | Create/find conversation (buyer+seller+listing) |
| GET | `/api/conversations/[id]/messages?userId=` | Get all messages in conversation (marks as read) |
| POST | `/api/conversations/[id]/messages` | Send message (supports text, image, video, voice types) |

### Marketplace

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/categories` | All categories with active listing counts |
| GET | `/api/universities` | All SA universities with listing counts |
| GET | `/api/stories` | Active stories (grouped by user, non-expired) |
| POST | `/api/stories` | Create a new story (24h expiry) |

### Wishlist

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wishlist?userId=` | Get user's wishlist items |
| POST | `/api/wishlist` | Toggle wishlist item (add if missing, remove if exists) |
| DELETE | `/api/wishlist?userId=&listingId=` | Remove specific wishlist item |
| GET | `/api/wishlist/check?userId=&listingId=` | Check if item is wishlisted |

### User Profile

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profile?userId=` | Get user profile (includes stats) |
| PUT | `/api/profile` | Update profile (name, bio, phone, avatar, photos) |
| PUT | `/api/profile/password` | Change password (validates current + new) |
| GET | `/api/notifications?userId=` | Get unread message count + previews |
| PUT | `/api/notifications` | Mark conversation messages as read |

### File Upload

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/upload` | Upload files (images up to 5MB, videos up to 50MB, audio up to 10MB) |
| GET | `/api/files/[...path]` | Serve uploaded files (directory traversal protected) |

---

## Features

### For Buyers
- **Browse & Search**: Filter by category, university, condition, price sort
- **Listing Detail**: Full image gallery, seller info with verification badge, view count
- **Chat System**: Real-time (3s polling) messaging with sellers per listing
- **Wishlist**: Save items for later, grid view with quick remove
- **Stories**: Instagram-style stories from other users (24-hour expiry)
- **Share**: Native share API with clipboard fallback

### For Sellers
- **Create Listings**: Multi-image upload, category/university selection, pricing
- **My Listings Dashboard**: View all listings with stats (total, active, views)
- **Delete Listings**: One-click removal with confirmation
- **Profile Management**: Edit bio, avatar, phone, university info
- **Photo Gallery**: Multiple profile photos with drag-and-drop upload

### Chat Features
- **Text Messages**: Standard text with clickable URL detection
- **Image Sending**: Upload and send images in chat
- **Video Sending**: Upload and send videos in chat
- **Voice Notes**: Record and send voice memos (MediaRecorder API)
- **Camera Capture**: Take photos directly from device camera
- **Read Receipts**: Messages show read/unread status

### Platform Features
- **SA University Verification**: Auto-verify students with .ac.za emails
- **10 Product Categories**: Textbooks, Electronics, Accommodation, Clothing, Transport, Furniture, Sports, Services, Food, Free Stuff
- **13 SA Universities**: UCT, Wits, Stellenbosch, UP, UKZN, UJ, Rhodes, NWU, UFS, UL, CPUT, DUT, TUT
- **Responsive Design**: Mobile-first, works on all screen sizes
- **DiceBear Avatars**: Auto-generated avatars for new users

---

## Demo Accounts

All seeded accounts use password: **`password123`**

| Email | Name | University | Verified |
|-------|------|-----------|----------|
| sipho@uct.ac.za | Sipho Mkhize | University of Cape Town | Yes |
| thandi@wits.ac.za | Thandi Ndlovu | University of the Witwatersrand | Yes |
| kgosi@su.ac.za | Kgosi Molefe | Stellenbosch University | Yes |
| lerato@up.ac.za | Lerato Mahlangu | University of Pretoria | Yes |
| bongani@ukzn.ac.za | Bongani Dlamini | University of KwaZulu-Natal | Yes |
| nomsa@uj.ac.za | Nomsa Zulu | University of Johannesburg | No |
| andile@ru.ac.za | Andile Botha | Rhodes University | Yes |
| zanele@nwu.ac.za | Zanele Nkosi | North-West University | Yes |
| 219045678@mycput.ac.za | Ayanda Sithole | CPUT | Yes |
| palesa@dut.ac.za | Palesa Mokoena | Durban University of Technology | Yes |

The database is pre-seeded with:
- **10 users** across different SA universities
- **27 listings** spanning all 10 categories
- **6 conversations** with **21 chat messages**
- **14 stories** with various content types
- **10 categories** and **13 universities**

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `file:./db/custom.db` | SQLite database file path |
| `NEXT_PUBLIC_APP_NAME` | No | — | Application display name |
| `NEXT_PUBLIC_APP_URL` | No | `http://localhost:3000` | Public app URL (for sharing) |

---

## NPM Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `next dev -p 3000` | Start development server with hot-reload |
| `npm run build` | `next build && copy assets` | Build production bundle (standalone output) |
| `npm run start` | `node .next/standalone/server.js` | Start production server |
| `npm run lint` | `eslint .` | Run ESLint on all files |
| `npm run db:push` | `prisma db push` | Sync Prisma schema to database |
| `npm run db:generate` | `prisma generate` | Generate Prisma client types |
| `npm run db:seed` | `npx prisma db seed` | Seed database with demo data |
| `npm run db:migrate` | `prisma migrate dev` | Run database migrations (development) |
| `npm run db:reset` | `prisma migrate reset` | Reset database (WARNING: deletes all data) |

---

## Currency

All prices are displayed in **South African Rand (ZAR / R)**. The `formatPrice()` helper formats numbers as `R1,234` or `Free` for zero-price items.

---

## License

This project is for educational and demonstration purposes. Built with Next.js, Tailwind CSS, shadcn/ui, Prisma, and Zustand.
