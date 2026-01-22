import { NextRequest, NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
);

async function verifyAdmin(request: NextRequest): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;

  if (!token) return false;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload.type === 'admin';
  } catch {
    return false;
  }
}

// GET - Retrieve all settings
export async function GET(request: NextRequest) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const prisma = await getPrisma();
    const settings = await prisma.settings.findMany();

    const config: Record<string, string> = {};
    settings.forEach(s => {
      config[s.key] = s.value;
    });

    return NextResponse.json({ settings: config });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 });
  }
}

// POST - Save settings
export async function POST(request: NextRequest) {
  const isAdmin = await verifyAdmin(request);
  if (!isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const prisma = await getPrisma();
    const body = await request.json();

    // List of allowed settings keys
    const allowedKeys = [
      'store_name',
      'store_email',
      'store_phone',
      'currency',
      'low_stock_threshold',
      'smtp_enabled',
      'smtp_host',
      'smtp_port',
      'smtp_user',
      'smtp_password',
      'smtp_from_name',
      'smtp_from_email',
      'sms_enabled',
      'vonage_api_key',
      'vonage_api_secret',
      'vonage_from_number',
      'sms_order_confirmation',
      'sms_shipping_update',
      'sms_delivery_confirmation',
      'bank_name',
      'bank_recipient',
      'bank_account_pln',
      'bank_account_eur',
      'bank_swift',
    ];

    // Upsert each setting
    const updates = [];
    for (const [key, value] of Object.entries(body)) {
      if (allowedKeys.includes(key) && typeof value === 'string') {
        updates.push(
          prisma.settings.upsert({
            where: { key },
            update: { value, updatedAt: new Date() },
            create: { key, value },
          })
        );
      }
    }

    await Promise.all(updates);

    return NextResponse.json({ success: true, message: 'Settings saved' });
  } catch (error) {
    console.error('Save settings error:', error);
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 });
  }
}
