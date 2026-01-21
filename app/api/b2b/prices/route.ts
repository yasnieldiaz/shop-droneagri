import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/prisma';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
);

// GET - Get B2B prices (for authenticated B2B customers)
export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrisma();
    const token = request.cookies.get('b2b_token')?.value;

    if (!token) {
      return NextResponse.json(
        { error: 'B2B authentication required' },
        { status: 401 }
      );
    }

    // Verify JWT
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (payload.type !== 'b2b') {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const customerId = payload.customerId as string;

    // Get all B2B prices - both customer-specific and regional
    const allPrices = await prisma.b2BPrice.findMany({
      where: {
        OR: [
          { b2bCustomerId: customerId }, // Customer-specific prices
          { b2bCustomerId: null },        // Regional prices (for all customers)
        ],
      },
    });

    // Build price map with priority: customer-specific > regional
    const priceMap: Record<string, {
      pricePL: number;
      priceEU: number;
      discountPL: number | null;
      discountEU: number | null;
      isCustomPrice: boolean;
    }> = {};

    // First, add all regional prices (b2bCustomerId = null)
    for (const price of allPrices) {
      if (price.b2bCustomerId === null) {
        priceMap[price.productId] = {
          pricePL: price.pricePL,
          priceEU: price.priceEU,
          discountPL: price.discountPL,
          discountEU: price.discountEU,
          isCustomPrice: false,
        };
      }
    }

    // Then, override with customer-specific prices (higher priority)
    for (const price of allPrices) {
      if (price.b2bCustomerId === customerId) {
        priceMap[price.productId] = {
          pricePL: price.pricePL,
          priceEU: price.priceEU,
          discountPL: price.discountPL,
          discountEU: price.discountEU,
          isCustomPrice: true,
        };
      }
    }

    return NextResponse.json({
      prices: priceMap,
      region: payload.region,
      customerId,
    });
  } catch (error) {
    console.error('B2B prices error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch B2B prices' },
      { status: 500 }
    );
  }
}

// POST - Create/Update B2B price (admin only)
export async function POST(request: NextRequest) {
  try {
    const prisma = await getPrisma();
    // TODO: Add admin authentication check

    const body = await request.json();
    const { productId, productSku, pricePL, priceEU, discountPL, discountEU, b2bCustomerId } = body;

    if (!productId || !productSku) {
      return NextResponse.json(
        { error: 'Product ID and SKU are required' },
        { status: 400 }
      );
    }

    // Upsert the price using composite key
    const price = await prisma.b2BPrice.upsert({
      where: {
        productId_b2bCustomerId: {
          productId,
          b2bCustomerId: b2bCustomerId || null,
        },
      },
      update: {
        productSku,
        pricePL: pricePL || 0,
        priceEU: priceEU || 0,
        discountPL,
        discountEU,
      },
      create: {
        productId,
        productSku,
        pricePL: pricePL || 0,
        priceEU: priceEU || 0,
        discountPL,
        discountEU,
        b2bCustomerId: b2bCustomerId || null,
      },
    });

    return NextResponse.json({
      success: true,
      price,
    });
  } catch (error) {
    console.error('B2B price update error:', error);
    return NextResponse.json(
      { error: 'Failed to update B2B price' },
      { status: 500 }
    );
  }
}
