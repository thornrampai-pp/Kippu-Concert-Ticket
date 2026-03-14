import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // 1. ดึงคุกกี้ที่ชื่อ "token" (ตามที่ Backend ส่งมาใน res.cookie)
  const token = request.cookies.get('token')?.value;

  const isLoginPage = request.nextUrl.pathname.startsWith('/login');

  //  ถ้าไม่มี Token และไม่ได้อยู่ที่หน้า Login -> ให้ไปหน้า Login
  if (!token && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  //  ถ้ามี Token แล้วแต่ยังจะเข้าหน้า Login -> ให้ไปหน้าแรก (Home)
  if (token && isLoginPage) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

//  ให้ Middleware ทำงานทุกหน้า ยกเว้นไฟล์ static และ api ของ Next
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};