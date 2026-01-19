import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Define protected routes
  const protectedRoutes = ['/dashboard'];
  const isProtectedRoute = protectedRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  // Check if user has a valid JWT token in the Authorization header for protected routes
  if (isProtectedRoute) {
    const token = request.headers.get('authorization')?.split(' ')[1]; // Bearer token

    if (!token) {
      // Redirect to login if no token is present
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // In a real implementation, you would verify the JWT token here
    // For now, we'll just check if a token exists
    // A proper implementation would decode and verify the JWT signature
  }

  // Allow the request to continue
  return NextResponse.next();
}

// Define which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
    '/dashboard/:path*',
  ],
};