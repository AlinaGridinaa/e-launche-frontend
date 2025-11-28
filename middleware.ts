import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;

  // Публічні маршрути
  const publicPaths = ['/login'];
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

  // Якщо користувач не залогінений і намагається зайти на захищену сторінку
  if (!token && !isPublicPath && pathname !== '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Якщо користувач залогінений і намагається зайти на /login
  if (token && pathname === '/login') {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // Редірект з кореня на /home якщо залогінений
  if (token && pathname === '/') {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  // Редірект з кореня на /login якщо не залогінений
  if (!token && pathname === '/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/home/:path*',
    '/modules/:path*',
    '/my-progress/:path*',
    '/favorites/:path*',
    '/login',
  ],
};
