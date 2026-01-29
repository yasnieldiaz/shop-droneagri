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

    const products = await prisma.product.findMany({
      include: {
        translations: {
          where: { locale: 'en' },
          take: 1
        }
      },
      orderBy: { updatedAt: 'desc' },
    });

    // Map products to include name from translations and correct field names
    let mappedProducts = products.map(p => {
      const translation = p.translations[0];
      return {
        id: p.id,
        sku: p.sku,
        slug: p.slug,
        name: translation?.name || p.sku,
        tagline: translation?.tagline || '',
        description: translation?.description || '',
        specifications: translation?.specs || '',
        category: p.category,
        type: p.type,
        price: p.pricePLN,
        priceEUR: p.priceEUR,
        compareAtPrice: p.compareAtPLN,
        compareAtPriceEUR: p.compareAtEUR,
        stock: p.stock,
        lowStockThreshold: p.lowStockAlert || 5,
        isActive: p.status === 'ACTIVE',
        isFeatured: p.featured,
        status: p.status,
        mainImage: p.mainImage,
        featured: p.featured,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      };
    });

    // Apply filters
    if (stockFilter === 'low') {
      mappedProducts = mappedProducts.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold);
    } else if (stockFilter === 'out') {
      mappedProducts = mappedProducts.filter(p => p.stock === 0);
    } else if (stockFilter === 'ok') {
      mappedProducts = mappedProducts.filter(p => p.stock > p.lowStockThreshold);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      mappedProducts = mappedProducts.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.sku.toLowerCase().includes(searchLower)
      );
    }

    if (category) {
      mappedProducts = mappedProducts.filter(p => p.category === category);
    }

    return NextResponse.json({ products: mappedProducts });
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
        mainImage: mainImage || null,
        pricePLN: price || 0,
        priceEUR: priceEUR || 0,
        compareAtPLN: compareAtPrice || null,
        compareAtEUR: compareAtPriceEUR || null,
        stock: stock || 0,
        lowStockAlert: lowStockThreshold || 5,
        category,
        type: type || 'PRODUCT',
        status: isActive ? 'ACTIVE' : 'DRAFT',
        featured: isFeatured || false,
      },
    });

    // Create translation for the product
    await prisma.productTranslation.create({
      data: {
        productId: product.id,
        locale: 'en',
        name: name,
        tagline: tagline || null,
        description: description || null,
      },
    });

    return NextResponse.json({ success: true, product: { ...product, name } });
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
    const { 
      id, 
      name, 
      tagline, 
      description,
      // Fields that need mapping
      price,
      priceEUR,
      compareAtPrice,
      compareAtPriceEUR,
      lowStockThreshold,
      isFeatured,
      isActive,
      // Fields that don't exist in Product model - ignore them
      specifications,
      preorderEnabled,
      // Valid Prisma fields
      sku,
      slug,
      mainImage,
      stock,
      category,
      type,
      preorderLeadTime,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Build update data with proper field mapping
    const updateData: Record<string, unknown> = {};
    
    // Direct fields (only add if provided)
    if (sku !== undefined) updateData.sku = sku;
    if (slug !== undefined) updateData.slug = slug;
    if (mainImage !== undefined) updateData.mainImage = mainImage;
    if (stock !== undefined) updateData.stock = stock;
    if (category !== undefined) updateData.category = category;
    if (type !== undefined) updateData.type = type;
    
    // Mapped fields
    if (price !== undefined) updateData.pricePLN = price;
    if (priceEUR !== undefined) updateData.priceEUR = priceEUR;
    if (compareAtPrice !== undefined) updateData.compareAtPLN = compareAtPrice;
    if (compareAtPriceEUR !== undefined) updateData.compareAtEUR = compareAtPriceEUR;
    if (lowStockThreshold !== undefined) updateData.lowStockAlert = lowStockThreshold;
    if (isFeatured !== undefined) updateData.featured = isFeatured;
    if (isActive !== undefined) updateData.status = isActive ? 'ACTIVE' : 'DRAFT';
    
    // Handle preorderLeadTime - convert empty string to null
    if (preorderLeadTime !== undefined) {
      updateData.preorderLeadTime = preorderLeadTime === '' || preorderLeadTime === null 
        ? null 
        : parseInt(preorderLeadTime, 10) || null;
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    // Update translation if name/tagline/description provided
    if (name || tagline !== undefined || description !== undefined) {
      await prisma.productTranslation.upsert({
        where: {
          productId_locale: { productId: id, locale: 'en' }
        },
        update: {
          ...(name && { name }),
          ...(tagline !== undefined && { tagline: tagline || null }),
          ...(description !== undefined && { description: description || null }),
        },
        create: {
          productId: id,
          locale: 'en',
          name: name || product.sku,
          tagline: tagline || null,
          description: description || null,
        },
      });
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a product
export async function DELETE(request: NextRequest) {
  try {
    const prisma = await getPrisma();
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('id');

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Delete translations first
    await prisma.productTranslation.deleteMany({
      where: { productId },
    });

    await prisma.product.delete({
      where: { id: productId },
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
