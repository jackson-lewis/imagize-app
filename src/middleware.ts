import { NextResponse, type NextRequest } from 'next/server'
 
export function middleware(request: NextRequest) {
  const accountKey = request.cookies.get('accountKey')?.value
 
  if (!accountKey && request.nextUrl.pathname.startsWith('/dashboard')) {
    return Response.redirect(new URL('/login', request.url))
  }

  /**
   * rewrite assets.* to /api/cdn
   */
  // if (request.nextUrl.hostname.match(/^assets\./)) {
  if (request.nextUrl.hostname) {
    if (request.nextUrl.pathname !== '/') {
      return new NextResponse('404: route not found', { status: 404 })
    }

    const url = new URL('', request.url)
    url.hostname = 'imagize.jacksonlewis.dev'
    url.pathname = '/api/cdn'

    return NextResponse.rewrite(url)
  }

  /**
   * rewrite api.* to /api
   */
  if (request.nextUrl.hostname.match(/^api\./)) {
    const url = new URL('', request.url)
    url.hostname = 'imagize.jacksonlewis.dev'
    url.pathname = `/api${request.nextUrl.pathname}`

    return NextResponse.rewrite(url)
  }
}
 
export const config = {
  matcher: ['/((?!_next/static|_next/image|.*\\.png$).*)'],
}