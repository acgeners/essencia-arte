"use client"

import { MessageCircle } from "lucide-react"

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "5511999999999"
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Olá! Gostaria de saber mais sobre os produtos personalizados da Essência & Arte 💕"
)

export function WhatsAppFab() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Fale conosco pelo WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-elevated transition-all duration-200 hover:scale-110 hover:shadow-xl active:scale-95 md:bottom-8 md:right-8"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  )
}
