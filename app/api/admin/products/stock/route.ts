import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/prisma';

// POST - Adjust product stock
export async function POST(request: NextRequest) {
  try {
    const prisma = await getPrisma();
    const body = await request.json();
    const { productId, adjustment, type, reason } = body;

    // type: 'add' | 'remove' | 'set'
    // adjustment: number (quantity to add/remove, or new stock level for 'set')

    if (!productId || adjustment === undefined || !type) {
      return NextResponse.json(
        { error: 'Product ID, adjustment, and type are required' },
        { status: 400 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    let newStock: number;

    switch (type) {
      case 'add':
        newStock = product.stock + adjustment;
        break;
      case 'remove':
        newStock = Math.max(0, product.stock - adjustment);
        break;
      case 'set':
        newStock = Math.max(0, adjustment);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid adjustment type' },
          { status: 400 }
        );
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        stock: newStock,
        updatedAt: new Date(),
      },
    });

    // Log the adjustment (could be stored in a separate StockLog table)
    console.log('Stock adjustment:', {
      productId,
      productSku: product.sku,
      previousStock: product.stock,
      adjustment,
      type,
      newStock,
      reason,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      previousStock: product.stock,
      newStock,
    });
  } catch (error) {
    console.error('Failed to adjust stock:', error);
    return NextResponse.json(
      { error: 'Failed to adjust stock' },
      { status: 500 }
    );
  }
}
