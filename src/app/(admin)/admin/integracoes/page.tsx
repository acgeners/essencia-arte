import { Zap, MessageSquare, Send, Globe, Share2 } from "lucide-react"

export const metadata = {
  title: "Integrações | Admin",
}

export default async function AdminIntegrationsPage() {
  const apps = [
    { name: "WhatsApp Business", status: "Conectado", desc: "Envio automático de recibos e avisos.", icon: MessageSquare, color: "text-green-500" },
    { name: "Google Analytics", status: "Desconectado", desc: "Acompanhamento de acessos e funil.", icon: Globe, color: "text-blue-500" },
    { name: "Facebook/Instagram", status: "Desconectado", desc: "Catálogo de produtos integrado.", icon: Share2, color: "text-pink-500" },
    { name: "Melhor Envio", status: "Aguardando", desc: "Cálculo de frete e etiquetas.", icon: Send, color: "text-orange-500" },
    { name: "Webhook Geral", status: "Inativo", desc: "Disparo de dados para ferramentas externas.", icon: Zap, color: "text-amber-500" },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Integrações Externas</h1>
        <p className="text-sm text-muted-foreground mt-1">Conecte sua loja com ferramentas de marketing, logística e suporte.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {apps.map((app, i) => (
          <div key={i} className="flex items-center justify-between p-6 rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-lg bg-muted/50 ${app.color}`}>
                <app.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{app.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{app.desc}</p>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${
                app.status === "Conectado" ? "bg-green-100 text-green-700" : 
                app.status === "Desconectado" ? "bg-red-100 text-red-700" : "bg-muted text-muted-foreground"
              }`}>
                {app.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
