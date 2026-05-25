# Database Bootstrap

This workspace expects a blank Supabase database to be initialized before the API can write registrations.

Run the schema push from the repository root:

```bash
pnpm db:push
```

Or run the package script directly:

```bash
pnpm --filter @workspace/db push
```

The schema is defined in `lib/db/migrations/0001_init.sql` and includes:

- `public.registrations`
- `public.participants`

If you prefer the Supabase SQL editor, paste the contents of `lib/db/migrations/0001_init.sql` into a new query and run it once.
