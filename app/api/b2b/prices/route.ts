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
      return NextResponse.json({ error: 'B2B authentication required' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (payload.type !== 'b2b') {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const customerId = payload.id as string;

    // Get all B2B prices - customer-specific and regional
    const allPrices = await prisma.b2BPrice.findMany({
      where: {
        OR: [
          { b2bCustomerId: customerId },
          { b2bCustomerId: null },
        ],
      },
      include: {
        product: true
      }
    });

    // Build price map with priority: customer-specific > regional
    const priceMap: Record<string, {
      pricePL: number;
      priceEU: number;
      discountPL: number | null;
      discountEU: number | null;
      isCustomPrice: boolean;
    }> = {};

    // First, add regional prices (b2bCustomerId = null)
    for (const price of allPrices) {
      if (price.b2bCustomerId === null) {
        const slug = price.product?.slug || price.productId;
        priceMap[slug] = {
          pricePL: price.pricePL || 0,
          priceEU: price.priceEU || 0,
          discountPL: price.discountPL,
          discountEU: price.discountEU,
          isCustomPrice: false,
        };
      }
    }

    // Override with customer-specific prices
    for (const price of allPrices) {
      if (price.b2bCustomerId === customerId) {
        const slug = price.product?.slug || price.productId;
        priceMap[slug] = {
          pricePL: price.pricePL || 0,
          priceEU: price.priceEU || 0,
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
    return NextResponse.json({ error: 'Failed to fetch B2B prices' }, { status: 500 });
  }
}
