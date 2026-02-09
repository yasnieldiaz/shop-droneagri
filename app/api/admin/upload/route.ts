import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const PROJECT_ROOT = '/var/www/vhosts/droneagri.pl/shop.droneagri.pl';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = (formData.get('folder') as string) || 'products';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Max 5MB' }, { status: 400 });
    }

    const timestamp = Date.now();
    const ext = file.name.split('.').pop() || 'jpg';
    const safeName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .toLowerCase()
      .slice(0, 50);
    const filename = safeName + '-' + timestamp + '.' + ext.toLowerCase();

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const publicDir = path.join(PROJECT_ROOT, 'public', 'images', folder);
    if (!existsSync(publicDir)) {
      await mkdir(publicDir, { recursive: true });
    }
    await writeFile(path.join(publicDir, filename), buffer);
    
    const standaloneDir = path.join(PROJECT_ROOT, '.next', 'standalone', 'public', 'images', folder);
    if (!existsSync(standaloneDir)) {
      await mkdir(standaloneDir, { recursive: true });
    }
    await writeFile(path.join(standaloneDir, filename), buffer);

    const publicUrl = '/images/' + folder + '/' + filename;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
