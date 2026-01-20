import { NextRequest, NextResponse } from 'next/server';
import { subscribeToNewsletter } from '@/lib/db/newsletter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, locale } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, message: 'invalid_email' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'invalid_email' },
        { status: 400 }
      );
    }

    // Subscribe
    const result = await subscribeToNewsletter(email, locale || 'pl');

    return NextResponse.json(result);
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { success: false, message: 'server_error' },
      { status: 500 }
    );
  }
}
