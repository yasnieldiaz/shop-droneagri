import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
);

export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrisma();
    const token = request.cookies.get('b2b_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify JWT
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (payload.type !== 'b2b') {
      return NextResponse.json(
        { error: 'Invalid token type' },
        { status: 401 }
      );
    }

    // Get customer from DB
    const customer = await prisma.b2BCustomer.findUnique({
      where: { id: payload.id as string },
      select: {
        id: true,
        email: true,
        companyName: true,
        vatNumber: true,
        country: true,
        region: true,
        contactName: true,
        contactPhone: true,
        street: true,
        city: true,
        postalCode: true,
        viesValidated: true,
        status: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    if (customer.status !== 'approved') {
      return NextResponse.json(
        { error: 'Account not approved' },
        { status: 403 }
      );
    }

    return NextResponse.json({ customer });
  } catch (error) {
    console.error('B2B me error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}

// Logout
export async function DELETE(request: NextRequest) {
  const response = NextResponse.json({ success: true });

  response.cookies.set('b2b_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });

  return response;
}
