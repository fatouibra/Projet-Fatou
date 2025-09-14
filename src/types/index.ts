export type Restaurant = {
  id: string
  name: string
  description?: string
  address: string
  phone: string
  email: string
  image?: string
  rating: number
  isActive: boolean
  cuisine: string
  deliveryFee: number
  minOrderAmount: number
  openingHours: string
  products?: Product[]
  orders?: Order[]
  reviews?: Review[]
  createdAt: Date
  updatedAt: Date
}

export type Category = {
  id: string
  name: string
  description?: string
  image?: string
  active: boolean
  order: number
  createdAt: Date
  updatedAt: Date
  products?: Product[]
}

export type Product = {
  id: string
  name: string
  description?: string
  price: number
  image?: string
  active: boolean
  featured: boolean
  isNew: boolean
  isPopular: boolean
  isVegetarian: boolean
  rating: number
  restaurantId: string
  restaurant?: Restaurant
  categoryId: string
  category?: Category
  reviews?: Review[]
  createdAt: Date
  updatedAt: Date
}

export type CartItem = {
  id: string
  name: string
  price: number
  image?: string
  quantity: number
  categoryName?: string
  restaurantId: string
  restaurantName?: string
}

export type Order = {
  id: string
  orderNumber: string
  restaurantId: string
  restaurant?: Restaurant
  customerName: string
  customerPhone: string
  customerEmail?: string
  address: string
  deliveryType: 'DELIVERY' | 'PICKUP'
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  status: OrderStatus
  total: number
  deliveryFee: number
  items: OrderItem[]
  notes?: string
  estimatedTime?: number
  createdAt: Date
  updatedAt: Date
}

export type OrderItem = {
  id: string
  quantity: number
  price: number
  orderId: string
  productId: string
  product: Product
}

export type OrderStatus = 
  | 'RECEIVED'
  | 'PREPARING' 
  | 'READY'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'CANCELLED'

export type DeliveryType = 'DELIVERY' | 'PICKUP'

export type PaymentMethod = 'CASH_ON_DELIVERY' | 'ONLINE'

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED'

// Settings type supprimé - remplacé par Restaurant

export type Admin = {
  id: string
  email: string
  name: string
  password: string
  createdAt: Date
  updatedAt: Date
}

export type SearchResult = {
  restaurants: Restaurant[]
  products: Product[]
  totalRestaurants: number
  totalProducts: number
}

export type SearchFilters = {
  cuisine?: string
  minPrice?: number
  maxPrice?: number
  rating?: number
  deliveryFee?: number
  vegetarian?: boolean
}

export type Review = {
  id: string
  rating: number
  comment?: string
  customerName: string
  customerEmail?: string
  restaurantId?: string
  productId?: string
  restaurant?: Restaurant
  product?: Product
  createdAt: Date
  updatedAt: Date
}

export type ReviewCreate = {
  rating: number
  comment?: string
  customerName: string
  customerEmail?: string
  restaurantId?: string
  productId?: string
}

export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
  message?: string
}