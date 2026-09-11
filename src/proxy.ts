import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/jwt';

export async function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get('yks_session')?.value;
  const role = request.cookies.get('yks_role')?.value;
  const { pathname } = request.nextUrl;
  
  let bearerToken = null;
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    bearerToken = authHeader.substring(7);
  }

  const tokenToVerify = sessionToken || bearerToken;

  // Statik dosyaları (next, images, favicon vb) atla
  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  const publicPaths = ['/', '/login', '/register', '/veli'];
  const isPublicPath = publicPaths.includes(pathname);
  const isApi = pathname.startsWith('/api/');

  if (tokenToVerify) {
    const payload = await verifyToken(tokenToVerify);
    
    if (payload && payload.userId) {
      // Geçerli JWT - Headers'ı manipüle edip downstream'e UUID paslıyoruz
      const requestHeaders = new Headers(request.headers);
      
      if (sessionToken) {
        const allCookies = request.cookies.getAll();
        const newCookiesString = allCookies.map(c => {
           if (c.name === 'yks_session') return `yks_session=${payload.userId}`;
           return `${c.name}=${c.value}`;
        }).join('; ');
        requestHeaders.set('cookie', newCookiesString);
      }
      
      if (bearerToken) {
        requestHeaders.set('authorization', `Bearer ${payload.userId}`);
      }

      if (isPublicPath && pathname !== '/' && pathname !== '/veli') {
        const redirectRole = payload.role || role;
        if (redirectRole === 'ogretmen') {
          return NextResponse.redirect(new URL('/ogretmen/dashboard', request.nextUrl.origin));
        }
        return NextResponse.redirect(new URL('/dashboard', request.nextUrl.origin));
      }

      return NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });
    } else {
      // Geçersiz JWT (veya eski UUID formatı)
      if (isApi) {
        const publicAuthRoutes = [
          '/api/auth/login', 
          '/api/auth/register', 
          '/api/auth/forgot-password', 
          '/api/auth/reset-password',
          '/api/auth/logout'
        ];
        if (!publicAuthRoutes.includes(pathname)) {
           const response = NextResponse.json({ error: 'Yetkisiz erişim veya geçersiz oturum' }, { status: 401 });
           response.cookies.delete('yks_session');
           return response;
        }
      } else {
         const response = NextResponse.redirect(new URL('/login', request.url));
         response.cookies.delete('yks_session');
         return response;
      }
    }
  }

  // Token Yoksa
  if (!isPublicPath) {
    // API route ise ve token yoksa karışmıyoruz, API kendi içinde yetki kontrolü yapacak.
    // Sayfa ise login'e yönlendiriyoruz.
    if (!isApi) {
      return NextResponse.redirect(new URL('/login', request.nextUrl.origin));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
