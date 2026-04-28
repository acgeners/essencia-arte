import { Header } from "@/components/public/header"
import { Footer } from "@/components/public/footer"
import { WhatsAppFab } from "@/components/public/whatsapp-fab"
import { CartDrawer } from "@/components/public/cart-drawer"
import { getCategories } from "@/server/queries/catalog"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const categories = await getCategories()

  return (
    <>
      <Header categories={categories} />
      <main className="flex-1">{children}</main>
      <Footer />
      <WhatsAppFab />
      <CartDrawer />
    </>
  )
}
