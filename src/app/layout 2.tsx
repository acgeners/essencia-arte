import type { Metadata } from "next"
import { Cormorant_Garamond, Inter, Geist } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600"],
  display: "swap",
})

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = {
  title: {
    default: "Essência & Arte — Produtos Personalizados Artesanais",
    template: "%s | Essência & Arte",
  },
  description:
    "Transformamos ideias em lembranças únicas. Canetas, chaveiros, porta-alianças e lembranças personalizadas feitas com amor.",
  keywords: [
    "produtos personalizados",
    "artesanato",
    "canetas personalizadas",
    "chaveiros personalizados",
    "lembranças personalizadas",
    "porta-alianças",
    "presentes artesanais",
  ],
  authors: [{ name: "Essência & Arte" }],
  creator: "Essência & Arte",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Essência & Arte",
    title: "Essência & Arte — Produtos Personalizados Artesanais",
    description:
      "Transformamos ideias em lembranças únicas. Cada detalhe, feito com amor.",
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="pt-BR"
      className={cn(cormorant.variable, inter.variable, "font-sans", geist.variable)}
    >
      <body className="min-h-dvh flex flex-col bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  )
}
