# Supabase Setup

## Apply the Schema

1. Open your Supabase project dashboard.
2. Go to SQL Editor.
3. Create a new query.
4. Paste the contents of `supabase/schema.sql`.
5. Run the query.

This creates the MVP tables, enums, row-level security policies, and timestamp triggers.

## Environment Variables

The app expects these variables in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
```

Use the publishable key for the web app. Do not put `service_role` or `sb_secret_...` keys in `.env.local`.
