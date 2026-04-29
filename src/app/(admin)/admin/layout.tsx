import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AdminSidebar } from "@/components/admin/sidebar"

function isAdminUser(email: string | undefined): boolean {
  if (!email) return false
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return adminEmails.includes(email.toLowerCase())
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const isAdmin =
    isAdminUser(user?.email) ||
    user?.app_metadata?.role === "admin"

  if (!user || !isAdmin) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-dvh bg-background">
      <AdminSidebar />
      <div className="flex flex-1 flex-col">
        {/* Header padding for mobile hamburger */}
        <div className="h-16 shrink-0 lg:hidden" />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
