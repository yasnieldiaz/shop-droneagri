import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/prisma';

// GET - Fetch all products with prices from database
export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrisma();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      // Fetch single product by slug
      const product = await prisma.product.findUnique({
        where: { slug },
        select: {
          id: true,
          sku: true,
          slug: true,
          name: true,
          price: true,
          priceEUR: true,
          compareAtPrice: true,
          compareAtPriceEUR: true,
          stock: true,
          isActive: true,
          mainImage: true,
        },
      });

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      return NextResponse.json({ product });
    }

    // Fetch all products
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        id: true,
        sku: true,
        slug: true,
        name: true,
        price: true,
        priceEUR: true,
        compareAtPrice: true,
        compareAtPriceEUR: true,
        stock: true,
        mainImage: true,
      },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
