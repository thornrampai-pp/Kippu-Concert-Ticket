import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. ปล่อยผ่านถ้าเป็นหน้า Login หรือไฟล์ Static
  if (pathname.startsWith('/login') || pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // 2. ถ้าไม่มี Token ให้ส่งไปหน้า Login
  if (!token) {
    // ใช้ rewrite แทน redirect ในบางกรณีอาจจะช่วยเลี่ยง loop ได้ 
    // แต่ถ้าจะใช้ redirect ต้องมั่นใจว่า URL ถูกต้อง
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 3. ถ้ามี Token และพยายามเข้าหน้า Login ให้กลับไปหน้า Home
  if (token && pathname.startsWith('/login')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

//  ให้ Middleware ทำงานทุกหน้า ยกเว้นไฟล์ static และ api ของ Next
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};