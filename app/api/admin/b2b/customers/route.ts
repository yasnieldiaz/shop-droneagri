import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';

// GET - List all B2B customers
export async function GET() {
  try {
    const prisma = await getPrisma();
    const customers = await prisma.b2BCustomer.findMany({
      orderBy: { createdAt: 'desc' },
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
        viesValidatedAt: true,
        status: true,
        approvedAt: true,
        createdAt: true,
        lastLoginAt: true,
      },
    });

    return NextResponse.json({ customers });
  } catch (error) {
    console.error('Failed to fetch B2B customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

// POST - Create new B2B customer
export async function POST(request: NextRequest) {
  try {
    const prisma = await getPrisma();
    const body = await request.json();
    const {
      email,
      password,
      companyName,
      vatNumber,
      country,
      region,
      contactName,
      contactPhone,
      street,
      city,
      postalCode,
      status = 'approved',
    } = body;

    // Validate required fields
    if (!email || !password || !companyName || !contactName || !country || !street || !city || !postalCode) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existing = await prisma.b2BCustomer.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A customer with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await prisma.b2BCustomer.create({
      data: {
        email,
        password: hashedPassword,
        companyName,
        vatNumber: vatNumber || null,
        country,
        region: region || (country === 'PL' ? 'POLAND' : 'EU'),
        contactName,
        contactPhone: contactPhone || null,
        street,
        city,
        postalCode,
        status,
        approvedAt: status === 'approved' ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, customer });
  } catch (error) {
    console.error('Failed to create B2B customer:', error);
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}

// PUT - Update full customer data
export async function PUT(request: NextRequest) {
  try {
    const prisma = await getPrisma();
    const body = await request.json();
    const {
      customerId,
      email,
      password,
      companyName,
      vatNumber,
      country,
      region,
      contactName,
      contactPhone,
      street,
      city,
      postalCode,
      status,
    } = body;

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {
      email,
      companyName,
      vatNumber: vatNumber || null,
      country,
      region: region || (country === 'PL' ? 'POLAND' : 'EU'),
      contactName,
      contactPhone: contactPhone || null,
      street,
      city,
      postalCode,
      status,
    };

    // Only update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update approvedAt if status changed to approved
    if (status === 'approved') {
      updateData.approvedAt = new Date();
    }

    const customer = await prisma.b2BCustomer.update({
      where: { id: customerId },
      data: updateData,
    });

    return NextResponse.json({ success: true, customer });
  } catch (error) {
    console.error('Failed to update B2B customer:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// PATCH - Update customer status or VIES validation
export async function PATCH(request: NextRequest) {
  try {
    const prisma = await getPrisma();
    const body = await request.json();
    const { customerId, status, viesValidated } = body;

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};

    // Handle status update
    if (status !== undefined) {
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return NextResponse.json(
          { error: 'Invalid status' },
          { status: 400 }
        );
      }
      updateData.status = status;
      if (status === 'approved') {
        updateData.approvedAt = new Date();
      }
    }

    // Handle VIES validation update
    if (viesValidated !== undefined) {
      updateData.viesValidated = viesValidated;
      if (viesValidated) {
        updateData.viesValidatedAt = new Date();
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const customer = await prisma.b2BCustomer.update({
      where: { id: customerId },
      data: updateData,
    });

    return NextResponse.json({ success: true, customer });
  } catch (error) {
    console.error('Failed to update B2B customer:', error);
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

// DELETE - Delete customer
export async function DELETE(request: NextRequest) {
  try {
    const prisma = await getPrisma();
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('id');

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      );
    }

    await prisma.b2BCustomer.delete({
      where: { id: customerId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete B2B customer:', error);
    return NextResponse.json(
      { error: 'Failed to delete customer' },
      { status: 500 }
    );
  }
}
