import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/prisma';

export async function GET() {
  try {
    const prisma = await getPrisma();
    const prices = await prisma.b2BPrice.findMany({
      include: {
        product: {
          include: {
            translations: { where: { locale: 'en' }, take: 1 }
          }
        },
        b2b_customers: true
      },
      orderBy: { createdAt: 'desc' },
    });

    const mappedPrices = prices.map(price => ({
      id: price.id,
      productId: price.product?.slug || price.productId,
      productName: price.product?.translations?.[0]?.name || price.product?.sku || '',
      productSku: price.productSku || price.product?.sku || '',
      b2bCustomerId: price.b2bCustomerId,
      b2bCustomer: price.b2b_customers ? {
        id: price.b2b_customers.id,
        companyName: price.b2b_customers.companyName,
        email: price.b2b_customers.email,
      } : null,
      pricePL: price.pricePL || 0,
      priceEU: price.priceEU || 0,
      discountPL: price.discountPL,
      discountEU: price.discountEU,
      createdAt: price.createdAt,
      updatedAt: price.updatedAt,
    }));

    return NextResponse.json({ prices: mappedPrices });
  } catch (error) {
    console.error('Failed to fetch B2B prices:', error);
    return NextResponse.json({ error: 'Failed to fetch prices' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const prisma = await getPrisma();
    const body = await request.json();
    const { productId, pricePL, priceEU, discountPL, discountEU, b2bCustomerId } = body;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: { OR: [{ slug: productId }, { id: productId }] }
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Use upsert to create or update
    const price = await prisma.b2BPrice.upsert({
      where: {
        productId_region: {
          productId: product.id,
          region: 'EU'
        }
      },
      update: {
        pricePL: pricePL || 0,
        priceEU: priceEU || 0,
        discountPL: discountPL || null,
        discountEU: discountEU || null,
        productSku: product.sku,
      },
      create: {
        productId: product.id,
        productSku: product.sku,
        region: 'EU',
        pricePL: pricePL || 0,
        priceEU: priceEU || 0,
        discountPL: discountPL || null,
        discountEU: discountEU || null,
        b2bCustomerId: b2bCustomerId || null,
      },
    });

    return NextResponse.json({ success: true, price });
  } catch (error) {
    console.error('Failed to save B2B price:', error);
    return NextResponse.json({ error: 'Failed to save price' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const prisma = await getPrisma();
    const body = await request.json();
    const { id, pricePL, priceEU, discountPL, discountEU } = body;

    if (!id) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    const price = await prisma.b2BPrice.update({
      where: { id },
      data: {
        pricePL: pricePL !== undefined ? pricePL : undefined,
        priceEU: priceEU !== undefined ? priceEU : undefined,
        discountPL: discountPL !== undefined ? discountPL : undefined,
        discountEU: discountEU !== undefined ? discountEU : undefined,
      },
    });

    return NextResponse.json({ success: true, price });
  } catch (error) {
    console.error('Failed to update B2B price:', error);
    return NextResponse.json({ error: 'Failed to update price' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const prisma = await getPrisma();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 });
    }

    await prisma.b2BPrice.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete B2B price:', error);
    return NextResponse.json({ error: 'Failed to delete price' }, { status: 500 });
  }
}
