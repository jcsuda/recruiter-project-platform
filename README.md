# HIRELab

A modern, lightweight web application that generates precise Boolean search strings for sourcing talent across major public networks (LinkedIn, GitHub, Stack Overflow, Dribbble, Xing, and X/Twitter).

## Features

- **Multi-Network Support**: Generate Boolean queries for LinkedIn, GitHub, Stack Overflow, Dribbble, Xing, and Twitter/X
- **Real-time Query Preview**: See your Boolean search string update as you type
- **Multiple Search Engines**: Open queries directly in Google, Bing, or Twitter
- **One-Click Actions**: Copy queries or URLs with a single click
- **Saved Searches**: Sign in to save and manage your favorite search configurations (requires Supabase)
- **Modern UI**: Clean, responsive design built with Next.js 15 and Tailwind CSS

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication & Database**: Supabase (optional for saved searches)
- **State Management**: React hooks

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- (Optional) Supabase account for saved searches feature

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd recruiter-project-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```
   
   If you want to use saved searches, update `.env.local` with your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Supabase Setup (Optional)

If you want to enable the saved searches feature:

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the database schema**
   
   In your Supabase SQL Editor, run the contents of `supabase/schema.sql`

3. **Configure environment variables**
   
   Add your Supabase URL and anon key to `.env.local`

4. **Enable email authentication** (or other auth providers)
   
   In Supabase Dashboard > Authentication > Providers, enable Email authentication

## Usage Example

### Finding Software Engineers in Austin

1. Select the **LinkedIn** tab
2. Fill in the form:
   - **Role**: Software Engineer
   - **Include**: React, TypeScript
   - **Exclude**: recruiter
   - **Location**: Austin
3. Click **Open in Google** to see results

The generated query will be:
```
site:linkedin.com/in "Software Engineer" ("React" AND "TypeScript") "Austin" -"recruiter"
```

## Project Structure

```
recruiter-project-platform/
├── app/
│   ├── page.tsx              # Main page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── SearchBuilder.tsx     # Main search form
│   ├── QueryPreview.tsx      # Query display and actions
│   ├── Header.tsx            # Header with auth
│   └── SavedSearches.tsx     # Saved searches management
├── lib/
│   ├── builder.ts            # Boolean query generation logic
│   ├── types.ts              # TypeScript type definitions
│   ├── sources.ts            # Network source configurations
│   └── supabase.ts           # Supabase client
├── supabase/
│   └── schema.sql            # Database schema
└── README.md
```

## Supported Networks

| Network | Site Pattern | Special Fields |
|---------|--------------|----------------|
| LinkedIn | `linkedin.com/in` | Education, Current Employer |
| GitHub | `github.com` | - |
| Stack Overflow | `stackoverflow.com/users` | - |
| Dribbble | `dribbble.com` | - |
| Xing | `xing.com/profile` | - |
| X (Twitter) | `twitter.com` | - |

## Compliance & Disclaimer

This tool:
- ✅ Only generates search queries for public, indexed data
- ✅ Uses search engines (Google, Bing, Twitter) to access data
- ✅ Does NOT scrape or automate behind-login content
- ✅ Is fully compliant with platform Terms of Service

**Disclaimer**: This tool is not affiliated with LinkedIn, Microsoft, GitHub, Stack Overflow, Dribbble, Xing, or Twitter/X. Use of this tool must comply with all applicable platform Terms of Service and data protection regulations.

## Future Enhancements

- [ ] Chrome extension for 1-click searches
- [ ] Search analytics dashboard
- [ ] Custom user-defined sources
- [ ] Diversity/Partner job board support (PowerToFly, OutInTech, etc.)
- [ ] Integration with hireEZ, Gem, or LinkedIn Recruiter Lite APIs

## Development

### Build for production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## License

MIT License

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

Built for recruiters and sourcers to streamline talent discovery. 🚀
# Force deployment
