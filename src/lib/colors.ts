export const COLOR_MAP: Record<string, string> = {
  "Rosa Claro": "#F4C2C2",
  "Rosa Escuro": "#C97A7A",
  "Vermelho": "#C0392B",
  "Coral": "#E8836B",
  "Lilás": "#C39BD3",
  "Roxo": "#7D3C98",
  "Azul": "#5DADE2",
  "Verde": "#58D68D",
  "Amarelo": "#F7DC6F",
  "Branco": "#FDFEFE",
  "Preto": "#2C3E50",
  "Dourado": "#D4AC0D",
  "Rosa": "#F4C2C2",
  "Prata": "#BDC3C7",
  "Holográfico": "#E8DAEF",
}

export function getHexColor(name: string): string {
  return COLOR_MAP[name] || "#CCCCCC"
}
