import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

// Paths that don't require authentication
const publicPaths = ['/auth/signin', '/auth/signup'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the path is public
  if (publicPaths.includes(pathname)) {
    return NextResponse.next();
  }
  
  // Check if the user is authenticated
  const token = await getToken({ 
    req: request, 
    secret: process.env.NEXTAUTH_SECRET 
  });
  
  // If the user is not authenticated and trying to access a protected route
  if (!token && !pathname.startsWith('/_next') && !pathname.includes('.')) {
    const url = new URL('/auth/signin', request.url);
    url.searchParams.set('callbackUrl', encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api routes that don't require authentication
     * 2. /_next (Next.js internals)
     * 3. /fonts, /images (static files)
     * 4. /favicon.ico, /sitemap.xml (static files)
     */
    '/((?!api/auth|_next/static|_next/image|fonts|images|favicon.ico|sitemap.xml).*)',
  ],
};