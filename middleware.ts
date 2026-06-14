import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify, SignJWT } from 'jose'

const SECRET      = new TextEncoder().encode(process.env.TOOL_ACCESS_SECRET!)
const COOKIE_NAME = 'agb_access'
const MAIN_APP    = 'https://agbrothers.tech'

export async function middleware(request: NextRequest) {
  const { searchParams } = request.nextUrl

  // 1. Verificar cookie de sesión existente
  const cookie = request.cookies.get(COOKIE_NAME)?.value
  if (cookie) {
    try {
      await jwtVerify(cookie, SECRET)
      return NextResponse.next()
    } catch {
      // Cookie expirada o inválida
    }
  }

  // 2. Verificar token de un solo uso enviado por el main app
  const token = searchParams.get('token')
  if (token) {
    try {
      await jwtVerify(token, SECRET)

      // Token válido — crear sesión de 8 horas
      const sessionToken = await new SignJWT({ access: true })
        .setProtectedHeader({ alg: 'HS256' })
        .setExpirationTime('8h')
        .sign(SECRET)

      const url = request.nextUrl.clone()
      url.searchParams.delete('token')

      const response = NextResponse.redirect(url)
      response.cookies.set(COOKIE_NAME, sessionToken, {
        httpOnly: true,
        secure:   true,
        sameSite: 'lax',
        maxAge:   60 * 60 * 8,
        path:     '/',
      })
      return response
    } catch {
      // Token inválido o expirado
    }
  }

  // 3. Sin acceso válido → redirigir al main app
  return NextResponse.redirect(new URL(MAIN_APP))
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
