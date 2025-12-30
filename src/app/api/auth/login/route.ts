import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // 환경변수에서 관리자 계정 확인
    const adminEmail = process.env.ADMIN_USERNAME || process.env.ADMIN_USER;
    const adminPassword = process.env.ADMIN_PASSWORD || process.env.ADMIN_PASS;

    if (!adminEmail || !adminPassword) {
      return NextResponse.json(
        { error: '관리자 계정이 설정되지 않았습니다.' },
        { status: 500 }
      );
    }

    // 인증 확인
    if (email !== adminEmail || password !== adminPassword) {
      return NextResponse.json(
        { error: '잘못된 이메일 또는 비밀번호입니다.' },
        { status: 401 }
      );
    }

    // 세션 생성 (7일 유효)
    const sessionData = {
      user: email,
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    const sessionToken = Buffer.from(JSON.stringify(sessionData)).toString('base64');

    // 쿠키 설정
    const response = NextResponse.json({ success: true });
    response.cookies.set('admin-session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 7 * 24 * 60 * 60, // 7일
      path: '/',
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

