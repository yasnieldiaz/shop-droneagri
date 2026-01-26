import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/prisma';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrisma();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    // Get products
    const products = await prisma.product.findMany({
      where: { category },
      orderBy: { sku: 'asc' },
      select: {
        sku: true,
        name: true,
        price: true,
        priceEUR: true,
        stock: true,
        isActive: true,
      },
    });

    // Create worksheet data
    const wsData = [
      ['SKU', 'Name', 'Price PLN', 'Price EUR', 'Stock', 'Active'],
      ...products.map(p => [
        p.sku,
        p.name,
        (p.price / 100).toFixed(2),
        (p.priceEUR / 100).toFixed(2),
        p.stock,
        p.isActive ? 'Yes' : 'No',
      ]),
    ];

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Set column widths
    ws['!cols'] = [
      { wch: 15 },  // SKU
      { wch: 50 },  // Name
      { wch: 12 },  // Price PLN
      { wch: 12 },  // Price EUR
      { wch: 8 },   // Stock
      { wch: 8 },   // Active
    ];

    XLSX.utils.book_append_sheet(wb, ws, category);

    // Generate buffer
    const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Return as downloadable file
    const filename = `${category.replace(/\s+/g, '-').toLowerCase()}-spare-parts.xlsx`;

    return new NextResponse(buf, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
