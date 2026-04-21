import { NextResponse } from 'next/server'

export function GET(request: Request) {
  const iconUrl = new URL('/icon', request.url)
  return NextResponse.redirect(iconUrl, 307)
}
