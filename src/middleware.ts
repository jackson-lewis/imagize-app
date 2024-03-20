import type { NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  const accountKey = request.cookies.get('accountKey')?.value
 
  if (!accountKey && request.nextUrl.pathname.startsWith('/dashboard')) {
    return Response.redirect(new URL('/login', request.url))
  }
}
 
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
}