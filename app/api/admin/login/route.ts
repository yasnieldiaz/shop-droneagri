import { NextRequest, NextResponse } from 'next/server';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-super-secret-key-change-in-production'
);

// Admin credentials - in production, these should be in environment variables or database
const ADMIN_USERS = [
  {
    id: 'admin-1',
    email: 'admin@drone-partss.com',
    // Password hash for 'FisherYou1983'
    passwordHash: '$2a$10$PLACEHOLDER', // Will be replaced with actual hash
    name: 'Administrator',
  },
];

// Generate hash on first request if needed
let adminPasswordHash: string | null = null;

async function getAdminPasswordHash(): Promise<string> {
  if (!adminPasswordHash) {
    adminPasswordHash = await bcrypt.hash('FisherYou1983', 10);
  }
  return adminPasswordHash;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find admin user
    const adminUser = ADMIN_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!adminUser) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check password (hardcoded for now)
    const correctPassword = password === 'FisherYou1983';

    if (!correctPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await new SignJWT({
      id: adminUser.id,
      email: adminUser.email,
      name: adminUser.name,
      type: 'admin',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(JWT_SECRET);

    // Create response
    const response = NextResponse.json({
      success: true,
      admin: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
      },
    });

    // Set HTTP-only cookie
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
