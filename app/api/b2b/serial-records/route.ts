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
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const customerId = payload.customerId as string;

    const records = await prisma.serialRecord.findMany({
      where: { customerId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ records });
  } catch (error) {
    console.error('Error fetching serial records:', error);
    return NextResponse.json({ error: 'Failed to fetch records' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const prisma = await getPrisma();
    const token = request.cookies.get('b2b_token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const customerId = payload.customerId as string;

    const body = await request.json();
    const { items, saleDate } = body;

    if (!items || !Array.isArray(items) || items.length === 0 || !saleDate) {
      return NextResponse.json({ error: 'Items and sale date are required' }, { status: 400 });
    }

    // Validate all items
    for (const item of items) {
      if (!item.productCode || !item.serialNumber) {
        return NextResponse.json({ error: 'All fields are required for each item' }, { status: 400 });
      }

      // Check if serial number already exists
      const existing = await prisma.serialRecord.findFirst({
        where: { serialNumber: item.serialNumber },
      });

      if (existing) {
        return NextResponse.json({ 
          error: `El número de serie ${item.serialNumber} ya está registrado` 
        }, { status: 400 });
      }
    }

    // Create all records
    const records = await prisma.$transaction(
      items.map((item: { productCode: string; serialNumber: string; productType: string }) =>
        prisma.serialRecord.create({
          data: {
            productCode: item.productCode,
            serialNumber: item.serialNumber,
            productType: item.productType || 'drone',
            saleDate: new Date(saleDate),
            customerId,
          },
        })
      )
    );

    return NextResponse.json({ records, count: records.length });
  } catch (error) {
    console.error('Error creating serial records:', error);
    return NextResponse.json({ error: 'Failed to create records' }, { status: 500 });
  }
}
