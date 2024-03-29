import { NextResponse, type NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  const accountKey = request.cookies.get('accountKey')?.value
 
  if (!accountKey && request.nextUrl.pathname.startsWith('/dashboard')) {
    return Response.redirect(new URL('/login', request.url))
  }

  /**
   * rewrite assets.* to /api/cdn
   */
  if (request.nextUrl.hostname.match(/^assets\./)) {
    if (request.nextUrl.pathname !== '/') {
      return new NextResponse('404: route not found', { status: 404 })
    }

    return NextResponse.rewrite(new URL('/api/cdn', request.url))
  }

  /**
   * rewrite api.* to /api
   */
  if (request.nextUrl.hostname.match(/^api\./)) {
    return NextResponse.rewrite(new URL(`/api${request.nextUrl.pathname}`, request.url))
  }
}
 
export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.png$).*)'],
}