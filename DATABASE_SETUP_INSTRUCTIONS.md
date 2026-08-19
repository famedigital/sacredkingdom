# 🗄️ DATABASE SETUP INSTRUCTIONS

## Step 1: Open Supabase SQL Editor
1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `iqbwlmoadphkuewubszd`
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query** to create a new SQL window

## Step 2: Execute the Database Script
1. Open the file: `DEPLOY_DATABASE.sql`
2. **Copy the ENTIRE content** of the file (Ctrl+A, Ctrl+C)
3. **Paste** it into the SQL Editor (Ctrl+V)
4. Click **Run** or press `Ctrl+Enter`

## Step 3: Verify Success
You should see success messages like:
- ✅ "CREATE TABLE" for admin_users
- ✅ "CREATE TABLE" for site_settings
- ✅ "INSERT 1" for admin user creation
- ✅ "CREATE FUNCTION" for various functions

## Step 4: Test the Connection
Once executed, come back here and run:
```bash
node populate-images.js
```

## 🎯 What Gets Created:

### Tables (20+ total):
- ✅ admin_users (with first admin user)
- ✅ site_settings (with default configuration)
- ✅ hero_slides
- ✅ tours
- ✅ tour_gallery_images
- ✅ blog_posts
- ✅ bookings
- ✅ media_library
- ✅ And many more...

### Admin User Credentials:
- **Email:** `admin@sacredkingdom.travel`
- **Password:** `Admin@123`
- **Role:** Super Admin

### Default Settings:
- Site name, description, contact info
- SEO metadata
- Social media links
- And more...

## 🔧 Troubleshooting:

**If you see "relation does not exist" errors:**
- Make sure you copied the ENTIRE file
- Check that all tables were created successfully
- Try running the script again

**If connection fails:**
- Verify your Supabase project URL
- Check that your service role key is correct
- Make sure your project is active

## 📋 Next Steps After Setup:

1. **Run the image population script:**
   ```bash
   node populate-images.js
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Visit your website:**
   - Homepage: http://localhost:3000
   - Admin: http://localhost:3000/admin

4. **Login to admin panel:**
   - Use the credentials above
   - Start managing your content!

---

**Need Help?**
The script includes detailed comments explaining each section.
You can also execute it section by section if needed.