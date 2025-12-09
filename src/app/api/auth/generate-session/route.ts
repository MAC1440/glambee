import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

/**
 * Generate a Supabase session token for a user by their ID
 * 
 * PURPOSE:
 * - Used for direct login (salon admins) to create a session without OTP
 * - Avoids OTP costs (no SMS/email sent)
 * - Enables RLS policies to work (auth.uid() needs a session)
 * 
 * HOW IT WORKS:
 * 1. Receives userId from client
 * 2. Verifies user exists in auth.users
 * 3. Generates a magic link token (but doesn't send it)
 * 4. Extracts token from magic link URL
 * 5. Returns token to client
 * 
 * SECURITY:
 * - Uses SERVICE_ROLE_KEY (secret, server-side only)
 * - Never exposed to client
 * - Token is short-lived and single-use
 * 
 * See docs/DIRECT_LOGIN_FLOW.md for full explanation
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Service role key not configured" },
        { status: 500 }
      );
    }

    // Create admin client with service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Get user from auth.users to verify they exist
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);

    if (userError || !userData?.user) {
      return NextResponse.json(
        { error: "User not found in auth.users" },
        { status: 404 }
      );
    }

    // Generate a magic link (but we'll extract the token, not send email)
    // The magic link contains a session token we can use
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: userData.user.email || userData.user.phone || '',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
      },
    });

    if (linkError) {
      console.error('Link generation error:', linkError);
      return NextResponse.json(
        { error: linkError.message || "Failed to generate session link" },
        { status: 500 }
      );
    }

    // Extract the token from the magic link
    // The magic link format: https://...?token=...&type=magiclink
    const magicLink = linkData?.properties?.action_link;
    if (!magicLink) {
      return NextResponse.json(
        { error: "Failed to generate session link" },
        { status: 500 }
      );
    }

    // Parse the token from the magic link URL
    const url = new URL(magicLink);
    const token = url.searchParams.get('token');
    const type = url.searchParams.get('type');

    if (!token) {
      return NextResponse.json(
        { error: "Failed to extract token from magic link" },
        { status: 500 }
      );
    }

    // Return the token that the client can use to set the session
    return NextResponse.json({
      success: true,
      data: {
        userId: userData.user.id,
        email: userData.user.email,
        phone: userData.user.phone,
        token: token,
        type: type || 'magiclink',
        // Also return the full link in case client wants to use it
        magicLink: magicLink,
      },
    });
  } catch (error) {
    console.error("Error in generate-session route:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

