import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/prisma';

// GET - Fetch all products with prices from database
export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrisma();
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const locale = searchParams.get('locale') || 'en';

    if (slug) {
      // Fetch single product by slug with translations
      const product = await prisma.product.findUnique({
        where: { slug },
        include: {
          translations: {
            where: { locale }
          }
        }
      });

      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }

      // Flatten product with translation
      const translation = product.translations[0];
      const flatProduct = {
        id: product.id,
        sku: product.sku,
        slug: product.slug,
        name: translation?.name || product.sku,
        tagline: translation?.tagline || '',
        description: translation?.description || '',
        specifications: translation?.specs ? JSON.stringify(translation.specs) : null,
        price: product.pricePLN,
        priceEUR: product.priceEUR,
        compareAtPrice: product.compareAtPLN,
        compareAtPriceEUR: product.compareAtEUR,
        stock: product.stock,
        isActive: product.status === 'ACTIVE',
        mainImage: product.mainImage,
        images: product.gallery?.length ? JSON.stringify(product.gallery) : null,
        category: product.category,
        type: product.type,
        preorderEnabled: false,
        preorderLeadTime: product.preorderLeadTime?.toString() || null,
      };

      return NextResponse.json({ product: flatProduct });
    }

    // Get optional filters
    const category = searchParams.get('category');
    const type = searchParams.get('type');
    const limit = searchParams.get('limit');

    // Build where clause
    const whereClause: { 
      status?: 'ACTIVE' | 'DRAFT' | 'ARCHIVED'; 
      category?: string;
      type?: 'PRODUCT' | 'SPARE_PART' | 'ACCESSORY';
    } = {
      status: 'ACTIVE'  // Always filter by active status
    };

    if (category) {
      whereClause.category = category;
    }

    if (type && ['PRODUCT', 'SPARE_PART', 'ACCESSORY'].includes(type)) {
      whereClause.type = type as 'PRODUCT' | 'SPARE_PART' | 'ACCESSORY';
    }

    // Fetch products with translations
    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        translations: {
          where: { locale }
        }
      },
      orderBy: { sortOrder: 'asc' },
      ...(limit ? { take: parseInt(limit) } : {}),
    });

    // Flatten products with translations
    const flatProducts = products.map(product => {
      const translation = product.translations[0];
      return {
        id: product.id,
        sku: product.sku,
        slug: product.slug,
        name: translation?.name || product.sku,
        tagline: translation?.tagline || '',
        description: translation?.description || '',
        specifications: translation?.specs ? JSON.stringify(translation.specs) : null,
        price: product.pricePLN,
        priceEUR: product.priceEUR,
        compareAtPrice: product.compareAtPLN,
        compareAtPriceEUR: product.compareAtEUR,
        stock: product.stock,
        mainImage: product.mainImage,
        images: product.gallery?.length ? JSON.stringify(product.gallery) : null,
        isActive: product.status === 'ACTIVE',
        category: product.category,
        type: product.type,
        preorderEnabled: false,
        preorderLeadTime: product.preorderLeadTime?.toString() || null,
      };
    });

    return NextResponse.json({ products: flatProducts });
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
