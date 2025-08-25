# Portfolio CMS Setup Instructions

## 🚀 Complete Content Management System for Your Portfolio

This setup adds a full-featured CMS to your portfolio using Supabase, allowing you to edit all content through an admin interface.

## 📋 Prerequisites

1. A Supabase account (sign up at https://supabase.com)
2. Node.js and npm installed
3. Your existing portfolio project

## 🔧 Setup Steps

### 1. Create Supabase Project

1. Go to https://supabase.com and create a new project
2. Choose a name for your project (e.g., "portfolio-cms")
3. Set a secure database password
4. Wait for the project to be created

### 2. Set up Database Schema

1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor" in the sidebar
3. Copy the contents of `supabase-schema.sql` file
4. Paste it into the SQL Editor and run it
5. This will create all necessary tables and security policies

### 3. Configure Environment Variables

1. In your Supabase project, go to Settings > API
2. Copy your project URL and anon public key
3. Create a `.env` file in your project root:

```bash
cp .env.example .env
```

4. Edit the `.env` file with your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_project_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 4. Set up Supabase Storage

1. In your Supabase dashboard, go to "Storage"
2. Create a new bucket called "images"
3. Make it public by going to bucket settings and enabling "Public bucket"
4. Set up the following RLS policies for the images bucket:

```sql
-- Allow public read access to images
CREATE POLICY "Public read access" ON storage.objects
FOR SELECT USING (bucket_id = 'images');

-- Allow authenticated admin users to upload
CREATE POLICY "Admin upload access" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'images' AND 
  auth.role() = 'authenticated' AND
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Allow authenticated admin users to delete
CREATE POLICY "Admin delete access" ON storage.objects
FOR DELETE USING (
  bucket_id = 'images' AND 
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
```

### 5. Create Admin User

1. In Supabase dashboard, go to "Authentication" > "Users"
2. Click "Add user" and create an admin account with your email
3. After creating the user, go to "SQL Editor" and run:

```sql
-- Replace 'your-admin-email@example.com' with your actual email
UPDATE profiles 
SET is_admin = true 
WHERE email = 'your-admin-email@example.com';
```

### 6. Install Dependencies and Run

The dependencies have already been installed. Now you can run the project:

```bash
npm run dev
```

## 🎯 Using the CMS

### Accessing the Admin Panel

1. Navigate to `http://localhost:5173/admin/login`
2. Log in with your admin credentials
3. You'll be redirected to the admin dashboard

### Admin Features

- **Dashboard**: Overview of your portfolio statistics
- **Hero Section**: Edit main banner content and background image
- **About**: Manage about section content and profile image
- **Skills**: Add, edit, and organize your technical skills
- **Projects**: Manage portfolio projects with images
- **Contact Info**: Update contact details and social links
- **Messages**: View and manage contact form submissions
- **Media**: Upload and organize images
- **Settings**: Configure site-wide settings

### Content Management

1. **Hero Section** (`/admin/hero`):
   - Edit main title, subtitle, description
   - Upload background images
   - Customize call-to-action button

2. **About Section** (`/admin/about`):
   - Update biography and professional summary
   - Manage profile image
   - Edit statistics (years experience, projects completed, etc.)

3. **Skills Management** (`/admin/skills`):
   - Add new skills with categories (AI Tools, Development, Security, IT Support)
   - Set skill levels (0-100%)
   - Organize with drag-and-drop sorting

4. **Projects** (`/admin/projects`):
   - Add new projects with descriptions
   - Upload project images
   - Set technologies used
   - Configure GitHub and live demo links

## 🔒 Security Features

- Row Level Security (RLS) enabled on all tables
- Admin-only access to CMS functions
- Secure image uploads with proper permissions
- Protected API routes

## 🛠 Customization

### Adding New Content Types

1. Add new table to `supabase-schema.sql`
2. Create TypeScript interface in `src/lib/supabase.ts`
3. Add helper functions for CRUD operations
4. Create admin page component
5. Add route to admin layout

### Styling

The CMS uses your existing design system with:
- Glass-morphism effects
- Gradient accents
- Consistent spacing and typography
- Responsive design

## 📱 Frontend Integration

Your existing components will automatically fetch content from Supabase:

```typescript
// Example: Fetch hero content
import { getHeroContent } from '../lib/supabase';

const heroData = await getHeroContent();
```

## 🚀 Deployment

1. Deploy your Supabase project (it's already hosted)
2. Update environment variables in your hosting platform
3. Deploy your frontend application
4. Test admin access and content updates

## 📞 Support

If you encounter any issues:

1. Check the browser console for errors
2. Verify Supabase connection and credentials
3. Ensure RLS policies are correctly applied
4. Check that the admin user has `is_admin = true`

## 🎉 Features Included

✅ Complete admin authentication system
✅ Dashboard with analytics and quick actions
✅ Hero section content management
✅ About section editing
✅ Skills management with categories
✅ Project portfolio management
✅ Contact form message handling
✅ Image upload and management
✅ Site settings configuration
✅ Responsive admin interface
✅ Real-time content updates
✅ Secure file uploads
✅ Professional UI with animations

Your portfolio now has a complete CMS! You can manage all content through the admin interface at `/admin/login`.