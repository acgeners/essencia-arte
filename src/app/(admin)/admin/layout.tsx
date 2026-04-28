import { AdminSidebar } from "@/components/admin/sidebar"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
