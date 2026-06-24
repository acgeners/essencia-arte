import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
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
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    const { pathname } = request.nextUrl
    const isAdminRoute = pathname.startsWith("/admin")
    const isLoginPage = pathname === "/login"

    const adminEmails = getAdminEmails()
    const isAdmin =
      (user?.email ? adminEmails.includes(user.email.toLowerCase()) : false) ||
      user?.app_metadata?.role === "admin"

    if (isAdminRoute && (!user || !isAdmin)) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    if (isLoginPage && user && isAdmin) {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
  } catch {
    // Se o middleware falhar, passa adiante — o layout faz a verificação
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
