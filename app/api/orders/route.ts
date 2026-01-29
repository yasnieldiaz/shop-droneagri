import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/prisma';

// GET - List all orders
export async function GET(request: NextRequest) {
  try {
    const prisma = await getPrisma();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: Record<string, unknown> = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        items: true,
        payments: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    // Map user to customer for backwards compatibility
    const mappedOrders = orders.map(order => ({
      ...order,
      customer: order.user,
    }));

    return NextResponse.json({ orders: mappedOrders });
  } catch (error) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    const prisma = await getPrisma();
    const body = await request.json();

    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${Date.now()}`,
        status: 'pending',
        totalPLN: body.totalPLN || 0,
        totalEUR: body.totalEUR,
        currency: body.currency || 'PLN',
        notes: body.notes,
        userId: body.userId,
      },
      include: {
        user: true,
        items: true,
      },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error('Failed to create order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
