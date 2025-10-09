import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/protectedRoute';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    // Authenticate request
    const authResult = await authenticateRequest(req);
    if (!authResult.success) {
      return authResult.response;
    }

    const { newEmail, password } = await req.json();

    if (!newEmail || !password) {
      return NextResponse.json(
        { error: 'New email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // First verify the password by attempting to sign in
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: authResult.userEmail,
      password: password
    });

    if (verifyError) {
      return NextResponse.json(
        { error: 'Password is incorrect' },
        { status: 400 }
      );
    }

    // Check if the new email is already in use by trying to get users with that email
    // Note: This is a simplified check, in production you might want a more robust solution
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (!listError && users?.users) {
      const existingUser = users.users.find(u => u.email === newEmail);
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email address is already in use' },
          { status: 400 }
        );
      }
    }

    // Update the email (this will send a confirmation email)
    const { error: updateError } = await supabase.auth.updateUser({
      email: newEmail
    });

    if (updateError) {
      console.error('Email update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update email. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Email change confirmation sent. Please check your new email address to confirm the change.'
    });

  } catch (error) {
    console.error('Change email error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}