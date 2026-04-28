/**
 * Formata valor em BRL (Real Brasileiro).
 * @example formatBRL(1234.5) => "R$ 1.234,50"
 */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

/**
 * Formata número de telefone brasileiro.
 * @example formatPhone("11999999999") => "(11) 99999-9999"
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "")

  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }

  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }

  return phone
}

/**
 * Formata CEP brasileiro.
 * @example formatCEP("12345678") => "12345-678"
 */
export function formatCEP(cep: string): string {
  const digits = cep.replace(/\D/g, "")

  if (digits.length === 8) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`
  }

  return cep
}

/**
 * Formata CPF.
 * @example formatCPF("12345678901") => "123.456.789-01"
 */
export function formatCPF(cpf: string): string {
  const digits = cpf.replace(/\D/g, "")

  if (digits.length === 11) {
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
  }

  return cpf
}

/**
 * Formata número do pedido.
 * @example formatOrderNumber("2026-00042") => "#2026-00042"
 */
export function formatOrderNumber(orderNumber: string): string {
  return `#${orderNumber}`
}

/**
 * Formata data para exibição em pt-BR.
 * @example formatDate(new Date()) => "26 de abril de 2026"
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date

  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d)
}

/**
 * Formata data e hora para exibição em pt-BR.
 * @example formatDateTime(new Date()) => "26/04/2026 às 14:30"
 */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date

  const dateStr = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d)

  const timeStr = new Intl.DateTimeFormat("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)

  return `${dateStr} às ${timeStr}`
}
