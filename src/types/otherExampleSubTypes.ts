/**
 * Example types to test code generators
 * Run: npm run generate-zod src/types/example.ts
 * Run: npm run generate-store src/types/example.ts
 */

// Simple interface with primitives
export interface Product {
  id: string
  name: string
  description: string
  price: number
  inStock: boolean
  quantity: number
}

// Interface with union types and literals
export interface Order {
  orderId: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  totalAmount: number
  itemCount: number
  product: Product
}

// Interface with optional properties and arrays
export interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  addresses: Address[]
  tags: string[]
  isVerified: boolean
  createdAt: Date,
}

// Nested interface
export interface Address {
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  isDefault: boolean
}

// Interface with nested object type
export interface ShoppingCart {
  cartId: string
  customerId: string
  items: CartItem[]
  subtotal: number
  tax: number
  total: number
  couponCode?: string
  discountAmount: number
}

export interface CartItem {
  productId: string
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

// Interface with Record type
export interface Inventory {
  warehouseId: string
  name: string
  stockLevels: Record<string, number>
  lastUpdated: Date
}

// Settings/Config style interface
export interface AppConfig {
  apiBaseUrl: string
  apiTimeout: number
  enableAnalytics: boolean
  enableNotifications: boolean
  theme: 'light' | 'dark' | 'system'
  language: string
  itemsPerPage: number
  features: string[]
}

// Status type (using type alias instead of enum for erasableSyntaxOnly compatibility)
export type OrderStatusType = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

// Type alias with union
export type PaymentMethod = 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer'

// Interface using enum
export interface Payment {
  paymentId: string
  orderId: string
  amount: number
  currency: string
  method: PaymentMethod
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  processedAt?: Date
}
