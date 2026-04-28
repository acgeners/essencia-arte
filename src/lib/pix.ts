/**
 * Gerador de payload PIX estático no padrão EMV-BR (BACEN).
 * Referência: https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II_ManualdePadroesparaIniciacaodoPix.pdf
 */

function crc16ccitt(str: string): string {
  let crc = 0xffff
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0")
}

function field(id: string, value: string): string {
  return `${id}${String(value.length).padStart(2, "0")}${value}`
}

export interface PixParams {
  key: string
  merchantName: string
  merchantCity: string
  amount: number
  txid?: string
  description?: string
}

/**
 * Gera o payload EMV-BR para um QR Code PIX estático com valor.
 * Compatível com todos os apps bancários brasileiros.
 */
export function generatePixPayload({
  key,
  merchantName,
  merchantCity,
  amount,
  txid = "***",
  description,
}: PixParams): string {
  // ID 26: Merchant Account Info (br.gov.bcb.pix)
  let merchantInfo = field("00", "br.gov.bcb.pix") + field("01", key)
  if (description) merchantInfo += field("02", description.slice(0, 72))

  // ID 62: Additional Data (txid)
  const safeTxid = txid.replace(/[^a-zA-Z0-9]/g, "").slice(0, 25) || "***"
  const additionalData = field("05", safeTxid)

  // Payload sem CRC
  let payload =
    field("00", "01") +                          // Payload format indicator
    field("01", "12") +                          // Static QR (reusable)
    field("26", merchantInfo) +                  // Merchant account info
    field("52", "0000") +                        // MCC (not specified)
    field("53", "986") +                         // BRL
    field("54", amount.toFixed(2)) +             // Amount
    field("58", "BR") +                          // Country
    field("59", merchantName.slice(0, 25)) +     // Merchant name
    field("60", merchantCity.slice(0, 15).toUpperCase()) + // City
    field("62", additionalData) +
    "6304"                                       // CRC placeholder (value computed below)

  return payload + crc16ccitt(payload)
}
