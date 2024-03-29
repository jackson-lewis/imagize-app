import { NextResponse, type NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  const accountKey = request.cookies.get('accountKey')?.value
 
  if (!accountKey && request.nextUrl.pathname.startsWith('/dashboard')) {
    return Response.redirect(new URL('/login', request.url))
  }

  /**
   * rewrite assets.imagize.io to imagize.io/api/serve
   */
  if (request.nextUrl.hostname === 'assets.imagize.jacksonlewis.dev') {
    return NextResponse.rewrite(new URL('/api/serve', request.url))
  }
}
 
export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.png$).*)'],
}