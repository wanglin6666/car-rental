export interface User {
  id: string
  phone: string
  email: string
  password: string
  name: string
  avatar: string
  createdAt: string
}

export interface Admin {
  id: string
  username: string
  password: string
  password_hash?: string
  name: string
  role: 'super' | 'normal'
  createdAt: string
}

export interface Brand {
  id: string
  name: string
  logo: string
}

export interface Color {
  id: string
  name: string
  value: string
}

export type CarStatus = 'available' | 'rented' | 'maintenance'

export interface Car {
  id: string
  brandId: string
  colorId: string
  name: string
  plateNumber: string
  dailyPrice: number
  deposit: number
  image: string
  description: string
  status: CarStatus
  createdAt: string
}

export type OrderStatus = 'pending_payment' | 'paid' | 'renting' | 'returned' | 'cancelled'

export interface RentalOrder {
  id: string
  userId: string
  carId: string
  startDate: string
  endDate: string
  days: number
  totalPrice: number
  deposit: number
  status: OrderStatus
  paidAt?: string
  createdAt: string
}

export interface ReturnRecord {
  id: string
  orderId: string
  carId: string
  userId: string
  actualReturnTime: string
  isOverdue: boolean
  overdueDays: number
  overdueFee: number
  damageFee: number
  finalSettlement: number
  remark: string
  createdAt: string
}

export interface CarouselItem {
  id: string
  image: string
  link: string
  sort: number
  isActive: boolean
}

export interface Announcement {
  id: string
  title: string
  content: string
  isActive: boolean
  createdAt: string
}

export interface Favorite {
  id: string
  userId: string
  carId: string
  createdAt: string
}
