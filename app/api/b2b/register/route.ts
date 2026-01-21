import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const prisma = await getPrisma();
    const body = await request.json();

    const {
      email,
      password,
      companyName,
      vatNumber,
      countryCode,
      contactName,
      contactPhone,
      street,
      city,
      postalCode,
    } = body;

    // Validate required fields (vatNumber is optional)
    if (!email || !password || !companyName || !countryCode || !contactName || !street || !city || !postalCode) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingCustomer = await prisma.b2BCustomer.findUnique({
      where: { email },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Check if VAT number already exists (only if provided)
    let vatResult = { valid: false, companyName: null };

    if (vatNumber && vatNumber.trim()) {
      const existingVat = await prisma.b2BCustomer.findUnique({
        where: { vatNumber },
      });

      if (existingVat) {
        return NextResponse.json(
          { error: 'VAT number already registered' },
          { status: 400 }
        );
      }

      // Validate VAT number with VIES
      const vatValidation = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/b2b/validate-vat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ countryCode, vatNumber }),
      });

      vatResult = await vatValidation.json();
    }

    // Determine region
    const region = countryCode.toUpperCase() === 'PL' ? 'POLAND' : 'EU';

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create B2B customer
    const customer = await prisma.b2BCustomer.create({
      data: {
        email,
        password: hashedPassword,
        companyName: vatResult.companyName || companyName,
        vatNumber: vatNumber && vatNumber.trim() ? vatNumber.trim() : null,
        country: countryCode.toUpperCase(),
        region,
        contactName,
        contactPhone,
        street,
        city,
        postalCode,
        viesValidated: vatResult.valid,
        viesValidatedAt: vatResult.valid ? new Date() : null,
        // Auto-approve if VIES validated, otherwise pending
        status: vatResult.valid ? 'approved' : 'pending',
        approvedAt: vatResult.valid ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        companyName: customer.companyName,
        vatNumber: customer.vatNumber,
        region: customer.region,
        status: customer.status,
        viesValidated: customer.viesValidated,
      },
      message: vatResult.valid
        ? 'Registration successful! Your account has been automatically approved.'
        : 'Registration submitted. Your account is pending approval.',
    });
  } catch (error) {
    console.error('B2B registration error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Registration failed';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
