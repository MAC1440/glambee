# Email Setup Guide

This guide explains how to set up email sending for the permissions notification feature.

## Current Implementation

The application uses **Resend** for sending emails. Resend is a modern email API service that's easy to set up and reliable.

## Setup Steps

### 1. Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account (100 emails/day free tier)
3. Verify your email address

### 2. Get Your API Key

1. After logging in, go to **API Keys** in the dashboard
2. Click **Create API Key**
3. Give it a name (e.g., "GlamBee CRM")
4. Copy the API key (you'll only see it once!)

### 3. Add API Key to Environment Variables

Add the following to your `.env.local` file:

```env
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

**Important Notes:**
- Replace `re_your_api_key_here` with your actual Resend API key
- For `RESEND_FROM_EMAIL`, you have two options:
  - **Option 1 (Quick Start)**: Use Resend's default domain: `onboarding@resend.dev`
  - **Option 2 (Production)**: Add your own domain in Resend dashboard and use your domain email (e.g., `noreply@yourdomain.com`)

### 4. Verify Domain (Optional but Recommended for Production)

For production, you should verify your own domain:

1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Follow the DNS configuration instructions
4. Once verified, update `RESEND_FROM_EMAIL` to use your domain

### 5. Restart Your Development Server

After adding the environment variables:

```bash
npm run dev
```

## Testing

1. Go to Roles & Permissions page
2. Select a staff member
3. Set permissions
4. Enter a valid email address
5. Click "Save Changes"
6. Check the email inbox (and spam folder)

## Troubleshooting

### Email Not Sending

1. **Check Environment Variables:**
   - Make sure `RESEND_API_KEY` is in `.env.local`
   - Restart your dev server after adding it

2. **Check Resend Dashboard:**
   - Go to Resend dashboard → Logs
   - Check for any errors or delivery issues

3. **Check Server Logs:**
   - Look at your terminal/console for error messages
   - Check for "RESEND_API_KEY is not configured" message

4. **Verify Email Address:**
   - Make sure the recipient email is valid
   - Check spam/junk folder

### Common Errors

**Error: "Email service not configured"**
- Solution: Add `RESEND_API_KEY` to `.env.local` and restart server

**Error: "Invalid API key"**
- Solution: Verify your API key is correct in `.env.local`

**Error: "Domain not verified"**
- Solution: Either verify your domain in Resend or use `onboarding@resend.dev` for testing

## Alternative Email Services

If you prefer to use a different email service, you can modify `src/app/api/email/send-permissions-email/route.ts`:

### Option 1: SendGrid
```bash
npm install @sendgrid/mail
```

### Option 2: Nodemailer (SMTP)
```bash
npm install nodemailer
```

### Option 3: AWS SES
```bash
npm install @aws-sdk/client-ses
```

## Production Considerations

1. **Rate Limits**: Resend free tier allows 100 emails/day. Upgrade for production use.
2. **Domain Verification**: Always verify your domain for production
3. **Email Templates**: Consider using Resend's template feature for better email design
4. **Error Handling**: Monitor email delivery failures and implement retry logic
5. **Email Logging**: Store email send logs in your database for audit purposes

## Support

- Resend Documentation: https://resend.com/docs
- Resend Support: support@resend.com

