# BIG-TEX-TRAILER---TRUCKFITTERS (Starter)

## What this includes (v0)
- Supabase Auth login (password or magic link)
- Dashboard stats
- Work orders (create + status)
- Parts browser (after you import parts)

## 1) Supabase setup
1. Create a Supabase project
2. Open **SQL Editor**
3. Paste and run: `supabase/schema.sql`

## 2) Create your 8 users
Supabase → Authentication → Users → Add user
Create your users, then assign roles:
Supabase → Table Editor → app_users → Insert row
- id = the Auth user id
- role = GENERAL_MANAGER / ADMIN / TRAILER_SALES / PARTS_SERVICE_SUPERVISOR / TECH

## 3) Import parts
Supabase → Table Editor → parts → Import data
Use the CSV file in `parts/parts_master_import_ready.csv`

## 4) Deploy to Vercel
1. Upload this folder to your GitHub repo (your repo is currently empty)
2. Vercel → New Project → Import GitHub repo → Deploy
3. Vercel → Settings → Environment Variables:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
   - APP_PUBLIC_BASE_URL (your Vercel URL)

## 5) Run locally (optional)
Install Node.js 18+
npm install
npm run dev
