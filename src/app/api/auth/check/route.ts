import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get('admin-session');
  
  if (!sessionCookie) {
    return NextResponse.json({ isAdmin: false }, { status: 200 });
  }

  try {
    const sessionData = JSON.parse(Buffer.from(sessionCookie.value, 'base64').toString());
    
    if (!sessionData.user || !sessionData.expires) {
      return NextResponse.json({ isAdmin: false }, { status: 200 });
    }
    
    if (new Date() > new Date(sessionData.expires)) {
      return NextResponse.json({ isAdmin: false }, { status: 200 });
    }
    
    return NextResponse.json({ isAdmin: true }, { status: 200 });
  } catch {
    return NextResponse.json({ isAdmin: false }, { status: 200 });
  }
}

