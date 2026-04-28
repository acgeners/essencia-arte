import { Settings, User, Bell, Shield, Palette, Database } from "lucide-react"

export const metadata = {
  title: "Configurações | Admin",
}

export default async function AdminSettingsPage() {
  const sections = [
    { label: "Perfil da Loja", desc: "Nome, logo, endereços e redes sociais.", icon: Settings },
    { label: "Pagamentos", desc: "Configuração de Chave Pix e regras de entrada.", icon: Database },
    { label: "Visual e Temas", desc: "Cores da marca, tipografia e logo.", icon: Palette },
    { label: "Notificações", desc: "Configuração de WhatsApp e e-mails automáticos.", icon: Bell },
    { label: "Usuários e Acessos", desc: "Gerenciar administradores do painel.", icon: User },
    { label: "Segurança", desc: "Logs de acesso e backup do banco de dados.", icon: Shield },
  ]

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configurações do Sistema</h1>
        <p className="text-sm text-muted-foreground mt-1">Gerencie as preferências e parâmetros globais da sua loja.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section, i) => (
          <button key={i} className="flex items-start gap-4 p-6 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors text-left group">
            <div className="p-3 rounded-lg bg-primary/5 text-primary group-hover:bg-primary/10 transition-colors">
              <section.icon className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{section.label}</h3>
              <p className="text-sm text-muted-foreground mt-1">{section.desc}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
