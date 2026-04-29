/**
 * Tipos de domínio do Essência & Arte.
 * Representações tipadas das entidades do negócio,
 * independentes do formato do banco de dados.
 */

import type { OrderStatus } from "@/lib/constants"

/** Categoria de produto */
export interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  displayOrder: number
  active: boolean
}

/** Produto */
export interface Product {
  id: string
  categoryId: string
  name: string
  slug: string
  description: string | null
  basePrice: number
  productionDaysMin: number
  productionDaysMax: number
  active: boolean
  displayOrder: number
  category?: Category
  models?: ProductModel[]
}

/** Modelo de produto (ex: Patinha, Gatinho, Estrela) */
export interface ProductModel {
  id: string
  productId: string
  name: string
  imagePath: string | null
  priceModifier: number
  active: boolean
}

/** Grupo de opções (ex: Cores, Glitter, Adicionais) */
export interface OptionGroup {
  id: string
  name: string
  slug: string
  type: "tangible" | "intangible"
  selectionMode: "single" | "multi"
  required: boolean
  options?: Option[]
}

/** Opção individual */
export interface Option {
  id: string
  groupId: string
  name: string
  hexColor: string | null
  imagePath: string | null
  priceModifier: number
  active: boolean
  stock?: Stock
}

/** Estoque de opção tangível */
export interface Stock {
  id: string
  optionId: string
  quantity: number
  alertThreshold: number
}

/** Opção de embalagem */
export interface PackagingOption {
  id: string
  name: string
  description: string | null
  price: number
  active: boolean
}

/** Opção de envio */
export interface ShippingOption {
  id: string
  name: string
  type: "pickup" | "correios_pac" | "correios_sedex" | "transportadora"
  basePrice: number
  deadlineDaysMin: number
  deadlineDaysMax: number
  active: boolean
}

/** Cliente */
export interface Customer {
  id: string
  name: string
  phone: string
  email: string | null
  document: string | null
  createdAt: string
}

/** Endereço */
export interface Address {
  id: string
  customerId: string
  zipCode: string
  street: string
  number: string
  complement: string | null
  district: string
  city: string
  state: string
  isDefault: boolean
}

/** Pedido */
export interface Order {
  id: string
  orderNumber: string
  customerId: string
  status: OrderStatus
  subtotal: number
  packagingFee: number
  shippingFee: number
  total: number
  depositAmount: number
  depositPaidAt: string | null
  balancePaidAt: string | null
  paymentMethod: "pix" | "transfer" | null
  shippingOptionId: string | null
  shippingAddressId: string | null
  packagingOptionId: string | null
  giftMessage: string | null
  customerNotes: string | null
  estimatedDeliveryDate: string | null
  createdAt: string
  updatedAt: string
  customer?: Customer
  items?: OrderItem[]
  shippingOption?: ShippingOption
  packagingOption?: PackagingOption
}

/** Item do pedido */
export interface OrderItem {
  id: string
  orderId: string
  productId: string
  modelId: string
  customName: string | null
  customizations: Record<string, unknown>
  unitPrice: number
  quantity: number
  lineTotal: number
  product?: Product
  model?: ProductModel
}

/** Comprovante de pagamento */
export interface PaymentProof {
  id: string
  orderId: string
  filePath: string
  uploadedAt: string
  verifiedBy: string | null
  verifiedAt: string | null
  status: "pending" | "approved" | "rejected"
  notes: string | null
}

/** Histórico de status do pedido */
export interface OrderStatusHistory {
  id: string
  orderId: string
  fromStatus: OrderStatus | null
  toStatus: OrderStatus
  changedBy: string | null
  notes: string | null
  changedAt: string
}

/** KPIs do dashboard */
export interface DashboardKPIs {
  totalOrders: number
  totalRevenue: number
  inProduction: number
  delivered: number
}

/** Breakdown de preço do wizard */
export interface PriceBreakdown {
  label: string
  value: number
}

/** Resultado do cálculo de preço */
export interface PriceCalculation {
  subtotal: number
  packagingFee: number
  shippingFee: number
  total: number
  deposit: number
  balance: number
  breakdown: PriceBreakdown[]
}
