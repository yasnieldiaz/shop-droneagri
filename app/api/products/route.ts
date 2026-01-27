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
          tagline: true,
          description: true,
          specifications: true,
          price: true,
          priceEUR: true,
          compareAtPrice: true,
          compareAtPriceEUR: true,
          stock: true,
          isActive: true,
          mainImage: true,
          images: true,
          category: true,
          type: true,
          preorderEnabled: true,
          preorderLeadTime: true,
        },
      });

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      return NextResponse.json({ product });
    }

    // Get optional category filter
    const category = searchParams.get('category');
    const limit = searchParams.get('limit');

    // Build where clause
    const whereClause: { isActive?: boolean; category?: string } = {};

    // Only filter by isActive if not fetching spare parts
    if (!category) {
      whereClause.isActive = true;
    }

    if (category) {
      whereClause.category = category;
    }

    // Fetch products
    const products = await prisma.product.findMany({
      where: whereClause,
      select: {
        id: true,
        sku: true,
        slug: true,
        name: true,
        tagline: true,
        description: true,
        specifications: true,
        price: true,
        priceEUR: true,
        compareAtPrice: true,
        compareAtPriceEUR: true,
        stock: true,
        mainImage: true,
        images: true,
        isActive: true,
        category: true,
        type: true,
        preorderEnabled: true,
        preorderLeadTime: true,
      },
      orderBy: { name: 'asc' },
      ...(limit ? { take: parseInt(limit) } : {}),
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
