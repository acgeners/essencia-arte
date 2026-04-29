import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

function isAdminUser(email: string | undefined): boolean {
  if (!email) return false
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return adminEmails.includes(email.toLowerCase())
}

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return response
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    })

    const { data: { user } } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl
    const isAdminRoute = pathname.startsWith("/admin")
    const isLoginPage = pathname === "/login"

    const isAdmin =
      isAdminUser(user?.email) ||
      user?.app_metadata?.role === "admin"

    // Bloqueia /admin para quem não é administrador
    if (isAdminRoute && (!user || !isAdmin)) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Admin logado que acessa /login vai direto pro painel
    if (isLoginPage && user && isAdmin) {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
  } catch {
    // Se o proxy falhar, passa adiante — o layout faz a verificação
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
}
