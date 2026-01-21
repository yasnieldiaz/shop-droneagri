import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/prisma';

// GET - List all products
export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrisma();
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const stockFilter = searchParams.get('stock') || 'all';

    let where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { sku: { contains: search } },
      ];
    }

    if (category) {
      where.category = category;
    }

    if (stockFilter === 'out') {
      where.stock = 0;
    } else if (stockFilter === 'low') {
      where.AND = [
        { stock: { gt: 0 } },
        { stock: { lte: { raw: 'lowStockThreshold' } } },
      ];
    }

    const products = await prisma.product.findMany({
      orderBy: { updatedAt: 'desc' },
    });

    // Apply stock filter manually for SQLite compatibility
    let filteredProducts = products;
    if (stockFilter === 'low') {
      filteredProducts = products.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold);
    } else if (stockFilter === 'out') {
      filteredProducts = products.filter(p => p.stock === 0);
    } else if (stockFilter === 'ok') {
      filteredProducts = products.filter(p => p.stock > p.lowStockThreshold);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.sku.toLowerCase().includes(searchLower)
      );
    }

    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    return NextResponse.json({ products: filteredProducts });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST - Create new product
export async function POST(request: NextRequest) {
  try {
    const prisma = await getPrisma();
    const body = await request.json();

    const {
      sku,
      slug,
      name,
      tagline,
      description,
      mainImage,
      images,
      price,
      priceEUR,
      compareAtPrice,
      compareAtPriceEUR,
      stock,
      lowStockThreshold,
      category,
      type,
      isActive,
      isFeatured,
    } = body;

    if (!sku || !slug || !name || !category) {
      return NextResponse.json(
        { error: 'SKU, slug, name, and category are required' },
        { status: 400 }
      );
    }

    // Check if SKU or slug already exists
    const existing = await prisma.product.findFirst({
      where: {
        OR: [{ sku }, { slug }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'Product with this SKU or slug already exists' },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        sku,
        slug,
        name,
        tagline: tagline || null,
        description: description || null,
        mainImage: mainImage || null,
        images: images ? JSON.stringify(images) : null,
        price: price || 0,
        priceEUR: priceEUR || 0,
        compareAtPrice: compareAtPrice || null,
        compareAtPriceEUR: compareAtPriceEUR || null,
        stock: stock || 0,
        lowStockThreshold: lowStockThreshold || 5,
        category,
        type: type || 'PRODUCT',
        isActive: isActive ?? true,
        isFeatured: isFeatured ?? false,
      },
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Failed to create product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

// PATCH - Update product
export async function PATCH(request: NextRequest) {
  try {
    const prisma = await getPrisma();
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Handle images as JSON
    if (data.images && Array.isArray(data.images)) {
      data.images = JSON.stringify(data.images);
    }

    const product = await prisma.product.update({
      where: { id },
      data,
    });

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(request: NextRequest) {
  try {
    const prisma = await getPrisma();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
