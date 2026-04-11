# Day 1-2 Setup Checklist: Account Creation + Next.js Scaffold

## Phase 1: Create Accounts (Day 1, ~1.5 hours)

### 1. GitHub
- [ ] Go to https://github.com/signup
- [ ] Create account (use your email)
- [ ] Create new repo called `hustleclaude`
- [ ] Clone to your machine: `git clone https://github.com/YOUR_USERNAME/hustleclaude.git`

### 2. Vercel
- [ ] Go to https://vercel.com/signup
- [ ] Sign up with GitHub (authorize)
- [ ] Select the `hustleclaude` repo to import
- [ ] Vercel will auto-deploy on each git push
- [ ] Note your Vercel project URL: `https://hustleclaude-XXXX.vercel.app`

### 3. Supabase
- [ ] Go to https://supabase.com and sign up
- [ ] Create new project (name: `hustleclaude`, region: choose closest to you)
- [ ] Wait for DB to initialize (~2 min)
- [ ] Go to **Settings → API** and copy:
  - `NEXT_PUBLIC_SUPABASE_URL` 
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (save securely, never commit)
- [ ] Go to **SQL Editor** and run the schema SQL (see SCHEMA.sql file we'll create in Step 1)

### 4. Clerk
- [ ] Go to https://dashboard.clerk.com/sign-up
- [ ] Create account, choose "Next.js" as framework
- [ ] Create new app (name: `hustleclaude`)
- [ ] Go to **API Keys** and copy:
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `CLERK_SECRET_KEY`
- [ ] Go to **Webhooks** and note the URL (we'll set it up later)

### 5. Anthropic
- [ ] Go to https://console.anthropic.com
- [ ] Sign up with email
- [ ] Go to **Billing** → set spending limit to $10 (safe for dev)
- [ ] Go to **API Keys** and create new key
- [ ] Copy: `ANTHROPIC_API_KEY`

### 6. Twilio
- [ ] Go to https://www.twilio.com/console/account/setup
- [ ] Sign up (free trial account)
- [ ] Verify email
- [ ] You'll get $15 trial credit
- [ ] Go to **Account Settings** and copy:
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
- [ ] Don't buy a phone number yet (Week 2)

### 7. Stripe
- [ ] Go to https://dashboard.stripe.com/register
- [ ] Sign up
- [ ] Skip the onboarding questions for now
- [ ] Go to **Developers → API Keys** and copy:
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_SECRET_KEY`

---

## Phase 2: Create .env.local File (Day 1, ~5 min)

In your local `hustleclaude` folder, create `.env.local` with all your keys:

```bash
# App
NEXT_PUBLIC_APP_URL=https://hustleclaude-XXXX.vercel.app

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding
CLERK_WEBHOOK_SECRET=whsec_... (we'll generate this later)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... (NEVER commit this)

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# Twilio (leave blank for now, add in Week 2)
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...

# Stripe (leave blank for now)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_BASIC_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
```

**IMPORTANT:**
- Add `.env.local` to `.gitignore` (never commit keys)
- Vercel will need these env vars too (we'll set them in Vercel dashboard on Day 2)

---

## Phase 3: Next.js Setup (Day 2, ~1 hour)

### 1. Create Next.js Project
```bash
cd hustleclaude
npx create-next-app@latest . --typescript --tailwind --app --no-git
```

**Choose when prompted:**
- TypeScript: Yes
- ESLint: Yes
- Tailwind: Yes
- App Router: Yes
- `src/` directory: No
- Import alias: Yes (default @/*)

### 2. Install Dependencies
```bash
npm install \
  @clerk/nextjs \
  @supabase/supabase-js \
  @anthropic-ai/sdk \
  twilio \
  stripe \
  @stripe/react-stripe-js \
  react-hot-toast \
  framer-motion \
  shadcn-ui
```

### 3. Create Database Schema

Create `SCHEMA.sql` in repo root (we'll run this in Supabase dashboard):

See the SQL schema in the main plan file. Copy it fully.

### 4. Set Up Clerk Middleware

Create `middleware.ts` in repo root:

```typescript
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/api/businesses(.*)",
  "/api/conversations(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
```

### 5. Update Vercel Environment Variables

- Go to your Vercel project dashboard
- **Settings → Environment Variables**
- Add all variables from `.env.local` (except `SUPABASE_SERVICE_ROLE_KEY` for now — only add to local)
- Click "Deploy" to trigger a redeployment

### 6. Test Deployment
```bash
git add .
git commit -m "Initial Next.js setup"
git push
```

Vercel auto-deploys. Check https://hustleclaude-XXXX.vercel.app — should see default Next.js page.

---

## Phase 4: Deploy Database Schema (Day 2, ~15 min)

1. Go to Supabase dashboard
2. Click **SQL Editor** on left sidebar
3. Click **+ New Query**
4. Paste the entire schema SQL (from plan file)
5. Click **Run**
6. Verify all 3 tables created: `businesses`, `conversations`, `messages`

---

## What's Next (Day 3)

Once all this is done, we'll:
1. Create auth routes (sign-in, sign-up) using Clerk
2. Build the chat endpoint (`POST /api/chat`) with **mock responses** (no API cost)
3. Verify everything works together

---

## Troubleshooting

**"Vercel deployment failed"**
- Check build logs in Vercel dashboard
- Usually missing env var — add it to Vercel dashboard

**"Supabase connection fails"**
- Verify URL and ANON_KEY are correct
- Check network connection

**"Clerk sign-up redirect loops"**
- Make sure `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding` exists
- We'll create `/onboarding` route on Day 3

---

**Estimated time to complete: 2-3 hours total**

Once done, message me and we'll start Day 3 (building the chat endpoint).
