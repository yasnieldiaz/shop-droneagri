import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/db/prisma';

// GET - Retrieve bank settings (public endpoint for checkout)
export async function GET() {
  try {
    const prisma = await getPrisma();
    const settings = await prisma.settings.findMany({
      where: {
        key: {
          in: ['bank_name', 'bank_recipient', 'bank_account_pln', 'bank_account_eur', 'bank_swift']
        }
      }
    });

    const config: Record<string, string> = {};
    settings.forEach(s => {
      config[s.key] = s.value;
    });

    return NextResponse.json(config);
  } catch (error) {
    console.error('Get bank settings error:', error);
    return NextResponse.json({ error: 'Failed to get bank settings' }, { status: 500 });
  }
}
