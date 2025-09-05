# EmailJS Setup Guide for Portfolio Contact Form

## Overview
Your contact form now supports email notifications in two ways:
1. **EmailJS Integration** (recommended) - Automatic email sending with templates
2. **Mailto Fallback** (works immediately) - Opens user's email client

## Quick Test (Works Immediately)
The contact form will work right away using the mailto fallback. When someone submits:
1. Message is saved to your database
2. User's email client opens with a pre-filled email to notify you
3. Message appears in your admin panel

## Full EmailJS Setup (Optional but Recommended)

### Step 1: Create EmailJS Account
1. Go to [https://dashboard.emailjs.com/](https://dashboard.emailjs.com/)
2. Sign up for a free account
3. Verify your email address

### Step 2: Add Email Service
1. Click "Add New Service"
2. Choose your email provider (Gmail, Outlook, etc.)
3. Follow the authentication steps
4. Copy the **Service ID** (e.g., `service_xyz123`)

### Step 3: Create Email Templates

#### Template 1: Admin Notification
1. Click "Create New Template"
2. Template Name: "Contact Form Notification"
3. Template Content:
```
Subject: New Contact Form Submission from {{from_name}}

Hello,

You have received a new message from your portfolio contact form:

From: {{from_name}} ({{from_email}})
Subject: {{subject}}

Message:
{{message}}

---
Reply directly to this email to respond.
```
4. Save and copy the **Template ID** (e.g., `template_abc456`)

#### Template 2: Auto-Reply (Optional)
1. Create another template
2. Template Name: "Contact Form Auto-Reply"
3. Template Content:
```
Subject: Thank you for contacting me!

Hi {{to_name}},

Thank you for reaching out! I've received your message and will get back to you within 24 hours.

Your message:
"{{message}}"

Best regards,
Sajal Basnet
```
4. Save and copy the **Template ID**

### Step 4: Get Public Key
1. Go to "Account" → "General"
2. Copy your **Public Key** (e.g., `user_1234567890abcdef`)

### Step 5: Update Environment Variables
Add these to your `.env.local` file:

```bash
# EmailJS Configuration
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
VITE_EMAILJS_SERVICE_ID=your_service_id_here
VITE_EMAILJS_TEMPLATE_ID=your_admin_template_id_here
VITE_EMAILJS_AUTO_REPLY_TEMPLATE_ID=your_auto_reply_template_id_here
```

### Step 6: Test
1. Restart your development server
2. Submit a test message through your contact form
3. Check that you receive the email notification
4. Verify the auto-reply is sent

## Features

### What happens when someone submits the contact form:

1. **Database Storage**: Message is saved to your Supabase database
2. **Email Notification**: You receive an email notification
3. **Auto-Reply**: User receives a confirmation email (if EmailJS is set up)
4. **Admin Panel**: Message appears in `/admin/messages` with management options

### Admin Panel Features:
- View all messages with read/unread status
- Search and filter messages
- Mark messages as read
- Reply to messages via email client
- Delete messages
- Dashboard shows message counts

## Troubleshooting

### If emails aren't sending:
1. Check browser console for errors
2. Verify environment variables are correct
3. Ensure EmailJS service is active
4. Check EmailJS dashboard for quota limits (free tier has limits)

### Fallback Mode:
If EmailJS isn't configured, the form will:
- Still save messages to database
- Open user's email client with pre-filled message
- Show success notification

## Security Notes
- EmailJS public key is safe to expose in frontend code
- Messages are stored securely in Supabase with RLS policies
- Email templates prevent injection attacks
- Admin email is only sent to verified service

## Free Tier Limits
- EmailJS free tier: 200 emails/month
- Perfect for portfolio contact forms
- Upgrade available if needed

Your contact form is now ready to use! 🚀