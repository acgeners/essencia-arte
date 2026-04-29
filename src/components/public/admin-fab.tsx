import Link from "next/link"
import { LayoutDashboard } from "lucide-react"
import { createClient } from "@/lib/supabase/server"

function isAdminUser(email: string | undefined): boolean {
  if (!email) return false
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return adminEmails.includes(email.toLowerCase())
}

export async function AdminFab() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const isAdmin =
    isAdminUser(user?.email) ||
    user?.app_metadata?.role === "admin"

  if (!isAdmin) return null

  return (
    <Link
      href="/admin"
      aria-label="Painel administrativo"
      title="Painel Admin"
      className="fixed bottom-6 left-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-foreground text-background shadow-elevated transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95 md:bottom-8 md:left-8"
    >
      <LayoutDashboard className="h-6 w-6" />
    </Link>
  )
}
