# Setup Guide for Boolean Search Builder

## 🚀 Quick Start

Follow these steps to get your Boolean Search Builder up and running.

---

## Step 1: Install Dependencies

In your terminal, navigate to the project directory and run:

```bash
cd recruiter-project-platform
npm install
```

This will install all required packages including:
- Next.js 15
- React 19
- Supabase JS client
- Tailwind CSS

---

## Step 2: Configure Supabase Database

### 2.1 Access Supabase SQL Editor

1. Go to [supabase.com](https://supabase.com) and sign in
2. Select your **recruiter-project-platform** database
3. Click on **SQL Editor** in the left sidebar

### 2.2 Run the Database Schema

1. Open the file `supabase/schema.sql` in your code editor
2. Copy the entire contents of the file
3. Paste it into the Supabase SQL Editor
4. Click **Run** (or press `Cmd/Ctrl + Enter`)

This will create:
- ✅ `sources` table (for network metadata)
- ✅ `saved_searches` table (for user saved searches)
- ✅ `synonyms` table (for future keyword expansion)
- ✅ Row Level Security (RLS) policies
- ✅ Default data (LinkedIn, GitHub, etc.)

### 2.3 Verify Tables Were Created

1. Click on **Table Editor** in the left sidebar
2. You should see three new tables:
   - `sources` (with 6 rows: LinkedIn, GitHub, Stack Overflow, Dribbble, Xing, Twitter)
   - `saved_searches` (empty for now)
   - `synonyms` (empty for now)

---

## Step 3: Get Your Supabase Credentials

1. In your Supabase project, click on **Project Settings** (gear icon) in the left sidebar
2. Click on **API** in the settings menu
3. Copy the following values:
   - **Project URL** (looks like: `https://xxxxxxxxxxxxx.supabase.co`)
   - **anon public** key (under "Project API keys")

---

## Step 4: Configure Environment Variables

1. In your project directory, create a file named `.env.local`
2. Add your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Replace the values with your actual Supabase URL and anon key from Step 3.

---

## Step 5: Enable Email Authentication (for Saved Searches)

1. In Supabase Dashboard, go to **Authentication** > **Providers**
2. Find **Email** in the list
3. Make sure it's **enabled** (toggle should be on)
4. Click **Save** if you made any changes

**Optional**: You can also enable other auth providers like Google, GitHub, etc.

---

## Step 6: Run the Development Server

Start your Next.js development server:

```bash
npm run dev
```

Open your browser and navigate to:
```
http://localhost:3000
```

---

## ✅ Verification Checklist

Make sure everything is working:

- [ ] App loads without errors at http://localhost:3000
- [ ] You see the Boolean Search Builder header
- [ ] You can switch between network tabs (LinkedIn, GitHub, etc.)
- [ ] When you fill in the form, a Boolean query appears in the preview
- [ ] "Open in Google" button opens a new tab with search results
- [ ] "Copy Query" button copies the query to clipboard
- [ ] "Sign In" button appears in the header
- [ ] Clicking "Sign In" prompts for email

---

## 🧪 Test the Application

### Test 1: Generate a Basic Query

1. Select **LinkedIn** tab
2. Enter:
   - **Role**: Product Manager
   - **Include**: Agile, Scrum
   - **Location**: Minneapolis
   - **Exclude**: recruiter
3. Verify the query shows:
   ```
   site:linkedin.com/in "Product Manager" ("Agile" AND "Scrum") "Minneapolis" -"recruiter"
   ```

### Test 2: Test Authentication

1. Click **Sign In**
2. Enter your email address
3. Check your email for the magic link
4. Click the link to sign in
5. You should be redirected back to the app
6. Your email should appear in the header

---

## 📁 Project Structure Overview

```
recruiter-project-platform/
├── app/
│   ├── page.tsx              # Main landing page
│   ├── layout.tsx            # Root layout with metadata
│   └── globals.css           # Global styles
├── components/
│   ├── SearchBuilder.tsx     # Main form with tabs and inputs
│   ├── QueryPreview.tsx      # Query display with action buttons
│   ├── Header.tsx            # Header with auth
│   └── SavedSearches.tsx     # Saved searches (future)
├── lib/
│   ├── builder.ts            # Boolean query generation engine
│   ├── types.ts              # TypeScript interfaces
│   ├── sources.ts            # Network configurations
│   └── supabase.ts           # Supabase client
├── supabase/
│   └── schema.sql            # Database schema
├── .env.local                # Environment variables (create this)
└── package.json              # Dependencies
```

---

## 🐛 Troubleshooting

### Issue: "Module not found" errors

**Solution**: Make sure you ran `npm install`

### Issue: Supabase connection errors

**Solution**: 
1. Check that `.env.local` exists and has correct values
2. Verify your Supabase URL and key are correct
3. Restart the dev server after creating `.env.local`

### Issue: "Sign In" button doesn't work

**Solution**:
1. Check that email auth is enabled in Supabase
2. Check browser console for errors
3. Verify your Supabase credentials in `.env.local`

### Issue: No tables in Supabase

**Solution**:
1. Make sure you ran the entire `schema.sql` file
2. Check the SQL Editor for any error messages
3. Try running each section separately if needed

---

## 🎯 Next Steps

Once everything is running:

1. **Customize the app** - Modify styles, add your branding
2. **Add saved searches functionality** - The UI is ready, just needs implementation
3. **Deploy to Vercel** - Run `npm run build` then deploy
4. **Share with your team** - Start sourcing talent!

---

## 🆘 Need Help?

- Check the main `README.md` for usage examples
- Review the Supabase documentation: https://supabase.com/docs
- Check Next.js documentation: https://nextjs.org/docs

---

**Ready to start sourcing talent? 🚀**

