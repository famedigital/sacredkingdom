# Vercel Environment Variables Setup

## Required Environment Variables for Vercel Deployment

Your application is failing to fetch data from Supabase on Vercel because the environment variables are not configured. You need to add these variables in your Vercel project settings.

### Steps to Configure:

1. **Go to Vercel Dashboard:**
   - Navigate to your Vercel project
   - Go to Settings → Environment Variables

2. **Add the following variables:**

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://iqbwlmoadphkuewubszd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxYndsbW9hZHBoa3Vld3Vic3pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI4Mzk1NzAsImV4cCI6MjA5ODQxNTU3MH0.z1mdVrJojnFmIhf_ummvwBcBbp5jvphuZS11DNrBbn4

SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxYndsbW9hZHBoa3Vld3Vic3pkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MjgzOTU3MCwiZXhwIjoyMDk4NDE1NTcwfQ.R4x9mZ2prKqyCNpRzb9hMLXJFG_NW5nbRL8KrHVi-Q4

# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=hckgrdeh
CLOUDINARY_API_KEY=899967834874613
CLOUDINARY_API_SECRET=IVrrbNOuALmDBp8w0Y3x-ouF3L8
CLOUDINARY_URL=cloudinary://899967834874613:IVrrbNOuALmDBp8w0Y3x-ouF3L8@hckgrdeh
```

3. **After adding variables:**
   - Click "Save"
   - Trigger a new deployment
   - The slider should work after redeployment

### Why This Is Happening:

Your local development has these variables in `.env.local`, but Vercel needs them configured in the project settings. Without these, your app cannot connect to Supabase to fetch hero slides, blog posts, or other database content.

### Quick Test:

After adding the variables, redeploy and check:
- Homepage slider should show rotating images
- Blog management should work
- All database features should function

---

**Note:** Never commit `.env.local` to git - it should stay local. Vercel reads from its own environment variable configuration.