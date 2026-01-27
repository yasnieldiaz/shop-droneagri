import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/prisma';

// GET - List all B2B prices
export async function GET() {
  try {
    const prisma = await getPrisma();
    const prices = await prisma.b2BPrice.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        b2bCustomer: {
          select: {
            id: true,
            companyName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ prices });
  } catch (error) {
    console.error('Failed to fetch B2B prices:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prices' },
      { status: 500 }
    );
  }
}

// POST - Create or update B2B price
export async function POST(request: NextRequest) {
  try {
    const prisma = await getPrisma();
    const body = await request.json();
    const { productId, productSku, pricePL, priceEU, discountPL, discountEU, b2bCustomerId } = body;

    if (!productId || !productSku) {
      return NextResponse.json(
        { error: 'Product ID and SKU are required' },
        { status: 400 }
      );
    }

    // Handle null b2bCustomerId separately (for all customers)
    const customerId = b2bCustomerId || null;

    // First, try to find existing price
    const existingPrice = await prisma.b2BPrice.findFirst({
      where: {
        productId,
        b2bCustomerId: customerId,
      },
    });

    let price;

    if (existingPrice) {
      // Update existing price
      price = await prisma.b2BPrice.update({
        where: { id: existingPrice.id },
        data: {
          productSku,
          pricePL: pricePL || 0,
          priceEU: priceEU || 0,
          discountPL: discountPL || null,
          discountEU: discountEU || null,
        },
        include: {
          b2bCustomer: {
            select: {
              id: true,
              companyName: true,
              email: true,
            },
          },
        },
      });
    } else {
      // Create new price
      price = await prisma.b2BPrice.create({
        data: {
          productId,
          productSku,
          pricePL: pricePL || 0,
          priceEU: priceEU || 0,
          discountPL: discountPL || null,
          discountEU: discountEU || null,
          b2bCustomerId: customerId,
        },
        include: {
          b2bCustomer: {
            select: {
              id: true,
              companyName: true,
              email: true,
            },
          },
        },
      });
    }

    return NextResponse.json({ success: true, price });
  } catch (error) {
    console.error('Failed to update B2B price:', error);
    return NextResponse.json(
      { error: 'Failed to update price' },
      { status: 500 }
    );
  }
}

// DELETE - Delete B2B price
export async function DELETE(request: NextRequest) {
  try {
    const prisma = await getPrisma();
    const { searchParams } = new URL(request.url);
    const priceId = searchParams.get('id');

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price ID is required' },
        { status: 400 }
      );
    }

    await prisma.b2BPrice.delete({
      where: { id: priceId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete B2B price:', error);
    return NextResponse.json(
      { error: 'Failed to delete price' },
      { status: 500 }
    );
  }
}
