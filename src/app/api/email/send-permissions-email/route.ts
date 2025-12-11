import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

// Initialize Resend with API key from environment variable
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, staffName, salonOwnerName, salonOwnerEmail, permissions, salonId, crmLink } = await request.json();

    if (!email || !staffName || !salonOwnerName || !salonId || !crmLink) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not configured in environment variables");
      return NextResponse.json(
        {
          error: "Email service not configured. Please add RESEND_API_KEY to your environment variables.",
          details: "Email was not sent. Check server logs for email content."
        },
        { status: 503 }
      );
    }

    // Format permissions for email with better formatting
    const permissionsList = Object.entries(permissions || {})
      .map(([module, perms]: [string, any]) => {
        const activePerms = Object.entries(perms)
          .filter(([_, enabled]) => enabled)
          .map(([perm]) => perm.charAt(0).toUpperCase() + perm.slice(1))
          .join(", ");
        // Capitalize module name
        const moduleName = module.charAt(0).toUpperCase() + module.slice(1).replace(/_/g, " ");
        return activePerms ? `• ${moduleName}: ${activePerms}` : null;
      })
      .filter(Boolean)
      .join("\n");

    // Email template with HTML formatting
    const emailSubject = `Your CRM Access - ${salonOwnerName}`;

    // HTML email body
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CRM Access</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background-color: #f4f4f4; padding: 20px; border-radius: 5px;">
    <h2 style="color: #2c3e50; margin-top: 0;">Welcome to GlamBee Software Management System</h2>
    
    <p>Hello <strong>${staffName}</strong>,</p>
    
    <p>You have been granted access to the CRM system by <strong>${salonOwnerName}</strong>.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${crmLink}" 
         style="background-color: #22c55e; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
        Access Your CRM
      </a>
    </div>
    
    <div style="background-color: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h3 style="color: #2c3e50; margin-top: 0;">Login Instructions:</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li>Use your email address: <strong>${email}</strong></li>
        <li>Use your password (you'll be prompted to change it on first login)</li>
        <li>The salon has been pre-selected for you and cannot be changed</li>
      </ul>
    </div>
    
    <p style="margin-top: 30px;">Best regards,<br><strong>${salonOwnerName}</strong></p>
  </div>
</body>
</html>
    `.trim();

    // Plain text version for email clients that don't support HTML
    const textBody = `
Hello ${staffName},

You have been granted access to the CRM system by ${salonOwnerName}.

Your Permissions:
${permissionsList || "• No specific permissions assigned"}

Access Your CRM:
${crmLink}

Login Instructions:
- Use your email address: ${email}
- Use your password (you'll be prompted to change it on first login)
- The salon has been pre-selected for you and cannot be changed

Best regards,
${salonOwnerName}
    `.trim();

    // Get sender email - Resend requires verified domain emails
    // We'll use the salon owner's name as display name and set reply-to to their email
    let fromEmail: string;
    let replyTo: string | undefined;

    // Sanitize salon owner name for email display
    const displayName = salonOwnerName.replace(/[<>"]/g, '').trim();

    if (process.env.RESEND_FROM_EMAIL) {
      // Use verified domain with salon owner's name as display name
      const verifiedEmail = process.env.RESEND_FROM_EMAIL;
      fromEmail = `${displayName} <${verifiedEmail}>`;
    } else {
      // Fallback to Resend's default (for testing only)
      fromEmail = `${displayName} <onboarding@resend.dev>`;
    }

    // Set reply-to to salon owner's email if available
    if (salonOwnerEmail) {
      replyTo = salonOwnerEmail;
    }

    // Send email using Resend
    let emailPayload: any = {
      from: fromEmail,
      to: [email],
      subject: emailSubject,
      html: htmlBody,
      text: textBody,
    };

    // Dev mode handling or Test Sender handling
    // Redirect if:
    // 1. We are in development mode (to avoid spamming real users)
    // 2. OR we are using the default Resend test email (which RESTRICTS sending to only the verified owner)
    if (process.env.NODE_ENV === 'development' || fromEmail.includes('onboarding@resend.dev')) {
      const devRecipient = 'bilal.shahid@invozone.dev';
      console.log(`[DEV/TEST MODE] Redirecting email from ${email} to ${devRecipient}`);

      emailPayload.to = [devRecipient];
      emailPayload.subject = `[DEV - Redirected from ${email}] ${emailSubject}`;
      emailPayload.html = `<div style="background: #ffe4e6; color: #881337; padding: 10px; margin-bottom: 20px; border: 1px solid #f43f5e; border-radius: 4px;">
        <strong>DEV/TEST MODE:</strong> This email was originally sent to: ${email}
      </div>` + htmlBody;
    }

    // Add reply-to if salon owner email is available
    if (replyTo) {
      emailPayload.reply_to = replyTo;
    }

    const { data, error } = await resend.emails.send(emailPayload);

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        {
          error: "Failed to send email",
          details: error.message || "Unknown error from email service",
        },
        { status: 500 }
      );
    }

    console.log("Email sent successfully:", data);

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      emailId: data?.id,
      emailDetails: {
        to: email,
        subject: emailSubject,
      },
    });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to send email",
      },
      { status: 500 }
    );
  }
}

