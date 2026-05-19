import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (username === 'admin' && password === 'admin1122335544-') {
      const response = NextResponse.json({ success: true });
      
      // Cookie ayarla
      response.cookies.set({
        name: 'admin_session',
        value: 'motorsigorta_secure_admin_2026',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 hafta
      });

      return response;
    }

    return NextResponse.json({ success: false, error: 'Hatalı kullanıcı adı veya şifre' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Sunucu hatası' }, { status: 500 });
  }
}
