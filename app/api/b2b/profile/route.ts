import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
);

async function getAuthenticatedCustomer(request: NextRequest) {
  const token = request.cookies.get('b2b_token')?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    if (payload.type !== 'b2b') {
      return null;
    }
    return payload.id as string;
  } catch {
    return null;
  }
}

// Update profile
export async function PUT(request: NextRequest) {
  try {
    const customerId = await getAuthenticatedCustomer(request);

    if (!customerId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const prisma = await getPrisma();
    const body = await request.json();

    const { companyName, contactName, contactPhone, street, city, postalCode } = body;

    // Validate required fields
    if (!companyName || !contactName || !street || !city || !postalCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update customer
    const updatedCustomer = await prisma.b2BCustomer.update({
      where: { id: customerId },
      data: {
        companyName,
        contactName,
        contactPhone: contactPhone || null,
        street,
        city,
        postalCode,
        updatedAt: new Date(),
      },
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

    return NextResponse.json({ 
      success: true,
      customer: updatedCustomer 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
