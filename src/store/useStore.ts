import { create } from 'zustand'
import { supabase } from '../lib/supabase'
import type {
  User, Admin, Brand, Color, Car, CarStatus,
  RentalOrder, OrderStatus, ReturnRecord,
  CarouselItem, Announcement, Favorite,
} from '../types'
import type { RealtimeChannel } from '@supabase/supabase-js'

function now() {
  return new Date().toISOString()
}

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message)
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// -- Shape mappers: Supabase row → app type --
function mapBrand(row: any): Brand {
  return { id: row.id, name: row.name, logo: row.logo }
}
function mapColor(row: any): Color {
  return { id: row.id, name: row.name, value: row.value }
}
function mapCar(row: any): Car {
  return {
    id: row.id, brandId: row.brand_id, colorId: row.color_id,
    name: row.name, plateNumber: row.plate_number,
    dailyPrice: row.daily_price, deposit: row.deposit,
    image: row.image, description: row.description,
    status: row.status as CarStatus, createdAt: row.created_at,
  }
}
function mapOrder(row: any): RentalOrder {
  return {
    id: row.id, userId: row.user_id, carId: row.car_id,
    startDate: row.start_date, endDate: row.end_date,
    days: row.days, totalPrice: row.total_price,
    deposit: row.deposit, status: row.status as OrderStatus,
    paidAt: row.paid_at ?? undefined, createdAt: row.created_at,
  }
}
function mapReturnRecord(row: any): ReturnRecord {
  return {
    id: row.id, orderId: row.order_id, carId: row.car_id, userId: row.user_id,
    actualReturnTime: row.actual_return_time, isOverdue: row.is_overdue,
    overdueDays: row.overdue_days, overdueFee: row.overdue_fee,
    damageFee: row.damage_fee, finalSettlement: row.final_settlement,
    remark: row.remark, createdAt: row.created_at,
  }
}
function mapCarousel(row: any): CarouselItem {
  return { id: row.id, image: row.image, link: row.link, sort: row.sort, isActive: row.is_active }
}
function mapAnnouncement(row: any): Announcement {
  return { id: row.id, title: row.title, content: row.content, isActive: row.is_active, createdAt: row.created_at }
}
function mapFavorite(row: any): Favorite {
  return { id: row.id, userId: row.user_id, carId: row.car_id, createdAt: row.created_at }
}
function mapProfile(row: any): User {
  return { id: row.id, phone: row.phone ?? '', email: '', password: '', name: row.name ?? '', avatar: row.avatar ?? '', createdAt: row.created_at }
}
function mapAdmin(row: any): Admin {
  return { id: row.id, username: row.username, password: '', password_hash: row.password_hash, name: row.name, role: row.role, createdAt: row.created_at }
}

interface AppState {
  users: User[]
  currentUser: User | null
  admins: Admin[]
  currentAdmin: Admin | null
  brands: Brand[]
  colors: Color[]
  cars: Car[]
  orders: RentalOrder[]
  returnRecords: ReturnRecord[]
  carousels: CarouselItem[]
  announcements: Announcement[]
  favorites: Favorite[]
  initialized: boolean

  init: () => Promise<void>

  register: (phone: string, email: string, password: string, name: string) => Promise<{ ok: boolean; msg: string }>
  login: (account: string, password: string) => Promise<{ ok: boolean; msg: string }>
  logout: () => Promise<void>
  updateProfile: (data: Partial<User>) => Promise<void>

  adminLogin: (username: string, password: string) => Promise<{ ok: boolean; msg: string }>
  adminLogout: () => void

  addBrand: (name: string, logo: string) => Promise<void>
  updateBrand: (id: string, data: Partial<Brand>) => Promise<void>
  deleteBrand: (id: string) => Promise<void>

  addColor: (name: string, value: string) => Promise<void>
  updateColor: (id: string, data: Partial<Color>) => Promise<void>
  deleteColor: (id: string) => Promise<void>

  addCar: (car: Omit<Car, 'id' | 'createdAt'>) => Promise<void>
  updateCar: (id: string, data: Partial<Car>) => Promise<void>
  deleteCar: (id: string) => Promise<void>

  createOrder: (carId: string, startDate: string, endDate: string) => Promise<{ ok: boolean; msg: string }>
  payOrder: (orderId: string) => Promise<void>
  cancelOrder: (orderId: string) => Promise<void>
  adminCancelOrder: (orderId: string) => Promise<void>
  confirmReturn: (orderId: string, record: Omit<ReturnRecord, 'id' | 'orderId' | 'carId' | 'userId' | 'createdAt'>) => Promise<void>

  toggleFavorite: (carId: string) => Promise<void>
  isFavorited: (carId: string) => boolean

  addCarousel: (item: Omit<CarouselItem, 'id'>) => Promise<void>
  updateCarousel: (id: string, data: Partial<CarouselItem>) => Promise<void>
  deleteCarousel: (id: string) => Promise<void>

  addAnnouncement: (title: string, content: string) => Promise<void>
  updateAnnouncement: (id: string, data: Partial<Announcement>) => Promise<void>
  deleteAnnouncement: (id: string) => Promise<void>

  addAdmin: (admin: Omit<Admin, 'id' | 'createdAt'>) => Promise<void>
  updateAdmin: (id: string, data: Partial<Admin>) => Promise<void>
  deleteAdmin: (id: string) => Promise<void>

  toggleUserStatus: (userId: string) => void

  getBrandName: (brandId: string) => string
  getColorName: (colorId: string) => string
  getColorValue: (colorId: string) => string
  getCar: (carId: string) => Car | undefined
}

export const useStore = create<AppState>()((set, get) => {
  let _realtimeChannel: RealtimeChannel | null = null

  // ---- Initialisation ----
  const loadAll = () => Promise.all([
    supabase.from('brands').select('*').order('created_at'),
    supabase.from('colors').select('*').order('created_at'),
    supabase.from('cars').select('*').order('created_at'),
    supabase.from('carousels').select('*').order('sort'),
    supabase.from('announcements').select('*').order('created_at', { ascending: false }),
    supabase.from('favorites').select('*'),
    supabase.from('orders').select('*').order('created_at', { ascending: false }),
    supabase.from('return_records').select('*').order('created_at', { ascending: false }),
    supabase.from('admins').select('*'),
    supabase.from('profiles').select('*'),
  ])

  const setupRealtime = () => {
    if (_realtimeChannel) supabase.removeChannel(_realtimeChannel)

    _realtimeChannel = supabase.channel('db-changes')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => { refreshOrders() }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'cars' },
        () => { refreshCars() }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'return_records' },
        () => { refreshReturnRecords() }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'favorites' },
        () => { refreshFavorites() }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'brands' },
        () => { refreshBrands() }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'colors' },
        () => { refreshColors() }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'carousels' },
        () => { refreshCarousels() }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        () => { refreshAnnouncements() }
      )
      .subscribe()
  }

  // Refresh helpers (re-fetch from Supabase and update local state)
  const refreshOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    if (data) set({ orders: data.map(mapOrder) })
  }
  const refreshCars = async () => {
    const { data } = await supabase.from('cars').select('*').order('created_at')
    if (data) set({ cars: data.map(mapCar) })
  }
  const refreshReturnRecords = async () => {
    const { data } = await supabase.from('return_records').select('*').order('created_at', { ascending: false })
    if (data) set({ returnRecords: data.map(mapReturnRecord) })
  }
  const refreshFavorites = async () => {
    const { data } = await supabase.from('favorites').select('*')
    if (data) set({ favorites: data.map(mapFavorite) })
  }
  const refreshBrands = async () => {
    const { data } = await supabase.from('brands').select('*').order('created_at')
    if (data) set({ brands: data.map(mapBrand) })
  }
  const refreshColors = async () => {
    const { data } = await supabase.from('colors').select('*').order('created_at')
    if (data) set({ colors: data.map(mapColor) })
  }
  const refreshCarousels = async () => {
    const { data } = await supabase.from('carousels').select('*').order('sort')
    if (data) set({ carousels: data.map(mapCarousel) })
  }
  const refreshAnnouncements = async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false })
    if (data) set({ announcements: data.map(mapAnnouncement) })
  }

  return {
    users: [],
    currentUser: null,
    admins: [],
    currentAdmin: null,
    brands: [],
    colors: [],
    cars: [],
    orders: [],
    returnRecords: [],
    carousels: [],
    announcements: [],
    favorites: [],
    initialized: false,

    init: async () => {
      try {
        const [br, cl, ca, cs, an, fv, od, rr, ad, pf] = await loadAll()

        if (br.data) set({ brands: br.data.map(mapBrand) })
        if (cl.data) set({ colors: cl.data.map(mapColor) })
        if (ca.data) set({ cars: ca.data.map(mapCar) })
        if (cs.data) set({ carousels: cs.data.map(mapCarousel) })
        if (an.data) set({ announcements: an.data.map(mapAnnouncement) })
        if (fv.data) set({ favorites: fv.data.map(mapFavorite) })
        if (od.data) set({ orders: od.data.map(mapOrder) })
        if (rr.data) set({ returnRecords: rr.data.map(mapReturnRecord) })
        if (ad.data) set({ admins: ad.data.map(mapAdmin) })
        if (pf.data) set({ users: pf.data.map(mapProfile) })

        // Restore Supabase Auth session
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          // User is already logged in; profile might be in-memory from the loadAll above
          const phone = session.user.user_metadata?.phone ?? ''
          set({
            currentUser: {
              id: session.user.id,
              phone,
              email: session.user.email ?? '',
              password: '',
              name: session.user.user_metadata?.name ?? phone,
              avatar: '',
              createdAt: session.user.created_at,
            },
          })
        }

        // Listen for auth changes
        supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            const phone = session.user.user_metadata?.phone ?? ''
            set({
              currentUser: {
                id: session.user.id,
                phone,
                email: session.user.email ?? '',
                password: '',
                name: session.user.user_metadata?.name ?? phone,
                avatar: '',
                createdAt: session.user.created_at,
              },
            })
          } else {
            set({ currentUser: null })
          }
        })

        setupRealtime()
      } catch (_e) {
        // Even if initialisation partially fails, allow the UI to render
      }
      set({ initialized: true })
    },

    // ================ AUTH ================
    register: async (phone, _email, password, name) => {
      const authEmail = `${phone}@carrental.local`
      const { data, error } = await supabase.auth.signUp({
        email: authEmail,
        password,
        options: { data: { phone, name } },
      })
      if (error) {
        const msg = error.message === 'User already registered'
          ? '该手机号已被注册'
          : error.message
        return { ok: false, msg }
      }
      // Manually insert profile
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          phone,
          name,
        }, { onConflict: 'id' })
      }
      return { ok: true, msg: '注册成功' }
    },

    login: async (account, password) => {
      const authEmail = account.includes('@') ? account : `${account}@carrental.local`
      const { data, error } = await supabase.auth.signInWithPassword({ email: authEmail, password })
      if (error) {
        return { ok: false, msg: '手机号或密码错误' }
      }
      return { ok: true, msg: '登录成功' }
    },

    logout: async () => {
      await supabase.auth.signOut()
      set({ currentUser: null })
    },

    updateProfile: async (data) => {
      const { currentUser } = get()
      if (!currentUser) return
      const { error } = await supabase
        .from('profiles')
        .update({ name: data.name, phone: data.phone, avatar: data.avatar })
        .eq('id', currentUser.id)
      if (!error) {
        set(s => ({
          currentUser: s.currentUser ? { ...s.currentUser, ...data } : null,
          users: s.users.map(u => u.id === currentUser.id ? { ...u, ...data } : u),
        }))
      }
    },

    // ================ ADMIN AUTH ================
    adminLogin: async (username, password) => {
      // Re-fetch admins to ensure we have latest
      const { data } = await supabase.from('admins').select('*')
      if (data) set({ admins: data.map(mapAdmin) })

      const hash = await sha256(password)
      const admin = get().admins.find(a => a.username === username && a.password_hash === hash)
      if (!admin) return { ok: false, msg: '账号或密码错误' }
      set({ currentAdmin: admin })
      return { ok: true, msg: '登录成功' }
    },

    adminLogout: () => set({ currentAdmin: null }),

    // ================ BRAND ================
    addBrand: async (name, logo) => {
      const { data, error } = await supabase.from('brands').insert({ name, logo: logo || '🚗' }).select().single()
      if (!error && data) set(s => ({ brands: [...s.brands, mapBrand(data)] }))
    },
    updateBrand: async (id, data) => {
      const { error } = await supabase.from('brands').update(data).eq('id', id)
      if (!error) set(s => ({ brands: s.brands.map(b => b.id === id ? { ...b, ...data } : b) }))
    },
    deleteBrand: async (id) => {
      const { error } = await supabase.from('brands').delete().eq('id', id)
      if (!error) set(s => ({ brands: s.brands.filter(b => b.id !== id) }))
    },

    // ================ COLOR ================
    addColor: async (name, value) => {
      const { data, error } = await supabase.from('colors').insert({ name, value }).select().single()
      if (!error && data) set(s => ({ colors: [...s.colors, mapColor(data)] }))
    },
    updateColor: async (id, data) => {
      const { error } = await supabase.from('colors').update(data).eq('id', id)
      if (!error) set(s => ({ colors: s.colors.map(c => c.id === id ? { ...c, ...data } : c) }))
    },
    deleteColor: async (id) => {
      const { error } = await supabase.from('colors').delete().eq('id', id)
      if (!error) set(s => ({ colors: s.colors.filter(c => c.id !== id) }))
    },

    // ================ CAR ================
    addCar: async (car) => {
      const { data, error } = await supabase.from('cars').insert({
        brand_id: car.brandId,
        color_id: car.colorId,
        name: car.name,
        plate_number: car.plateNumber,
        daily_price: car.dailyPrice,
        deposit: car.deposit,
        image: car.image,
        description: car.description,
        status: car.status,
      }).select().single()
      if (!error && data) set(s => ({ cars: [...s.cars, mapCar(data)] }))
    },
    updateCar: async (id, data) => {
      const payload: any = {}
      if (data.brandId !== undefined) payload.brand_id = data.brandId
      if (data.colorId !== undefined) payload.color_id = data.colorId
      if (data.name !== undefined) payload.name = data.name
      if (data.plateNumber !== undefined) payload.plate_number = data.plateNumber
      if (data.dailyPrice !== undefined) payload.daily_price = data.dailyPrice
      if (data.deposit !== undefined) payload.deposit = data.deposit
      if (data.image !== undefined) payload.image = data.image
      if (data.description !== undefined) payload.description = data.description
      if (data.status !== undefined) payload.status = data.status

      const { error } = await supabase.from('cars').update(payload).eq('id', id)
      if (!error) set(s => ({ cars: s.cars.map(c => c.id === id ? { ...c, ...data } : c) }))
    },
    deleteCar: async (id) => {
      const { error } = await supabase.from('cars').delete().eq('id', id)
      if (!error) set(s => ({ cars: s.cars.filter(c => c.id !== id) }))
    },

    // ================ ORDERS ================
    createOrder: async (carId, startDate, endDate) => {
      const { currentUser, cars } = get()
      if (!currentUser) return { ok: false, msg: '请先登录' }

      const car = cars.find(c => c.id === carId)
      if (!car || car.status !== 'available') return { ok: false, msg: '该车辆当前不可租赁' }

      const start = new Date(startDate)
      const end = new Date(endDate)
      if (start >= end) return { ok: false, msg: '结束日期必须大于开始日期' }
      if (start < new Date(new Date().toDateString())) return { ok: false, msg: '开始日期不能早于今天' }

      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      const totalPrice = days * car.dailyPrice

      // Check conflict against DB
      const { data: conflicts } = await supabase
        .from('orders')
        .select('id')
        .eq('car_id', carId)
        .not('status', 'in', '("cancelled","returned")')
        .lte('start_date', endDate)
        .gte('end_date', startDate)

      if (conflicts && conflicts.length > 0) {
        return { ok: false, msg: '该车辆在所选时段已被预订，请选择其他时段' }
      }

      const { data, error } = await supabase.from('orders').insert({
        user_id: currentUser.id,
        car_id: carId,
        start_date: startDate,
        end_date: endDate,
        days,
        total_price: totalPrice,
        deposit: car.deposit,
        status: 'pending_payment',
      }).select().single()

      if (error) return { ok: false, msg: '下单失败：' + error.message }

      // Mark car as rented
      await supabase.from('cars').update({ status: 'rented' }).eq('id', carId)

      if (data) {
        set(s => ({
          orders: [mapOrder(data), ...s.orders],
          cars: s.cars.map(c => c.id === carId ? { ...c, status: 'rented' as CarStatus } : c),
        }))
      }
      return { ok: true, msg: '下单成功，请尽快支付' }
    },

    payOrder: async (orderId) => {
      const { error } = await supabase.from('orders').update({
        status: 'paid',
        paid_at: now(),
      }).eq('id', orderId)
      if (!error) {
        set(s => ({
          orders: s.orders.map(o => o.id === orderId ? { ...o, status: 'paid' as OrderStatus, paidAt: now() } : o),
        }))
      }
    },

    cancelOrder: async (orderId) => {
      const order = get().orders.find(o => o.id === orderId)
      if (!order) return
      await supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderId)
      await supabase.from('cars').update({ status: 'available' }).eq('id', order.carId)
      set(s => ({
        orders: s.orders.map(o => o.id === orderId ? { ...o, status: 'cancelled' as OrderStatus } : o),
        cars: s.cars.map(c => c.id === order.carId ? { ...c, status: 'available' as CarStatus } : c),
      }))
    },

    adminCancelOrder: async (orderId) => {
      const order = get().orders.find(o => o.id === orderId)
      if (!order) return
      await supabase.from('orders').update({ status: 'cancelled' }).eq('id', orderId)
      await supabase.from('cars').update({ status: 'available' }).eq('id', order.carId)
      set(s => ({
        orders: s.orders.map(o => o.id === orderId ? { ...o, status: 'cancelled' as OrderStatus } : o),
        cars: s.cars.map(c => c.id === order.carId ? { ...c, status: 'available' as CarStatus } : c),
      }))
    },

    confirmReturn: async (orderId, record) => {
      const order = get().orders.find(o => o.id === orderId)
      if (!order) return

      const { data, error } = await supabase.from('return_records').insert({
        order_id: orderId,
        car_id: order.carId,
        user_id: order.userId,
        actual_return_time: record.actualReturnTime,
        is_overdue: record.isOverdue,
        overdue_days: record.overdueDays,
        overdue_fee: record.overdueFee,
        damage_fee: record.damageFee,
        final_settlement: record.finalSettlement,
        remark: record.remark,
      }).select().single()

      if (error) return

      await supabase.from('orders').update({ status: 'returned' }).eq('id', orderId)
      await supabase.from('cars').update({ status: 'available' }).eq('id', order.carId)

      if (data) {
        set(s => ({
          returnRecords: [...s.returnRecords, mapReturnRecord(data)],
          orders: s.orders.map(o => o.id === orderId ? { ...o, status: 'returned' as OrderStatus } : o),
          cars: s.cars.map(c => c.id === order.carId ? { ...c, status: 'available' as CarStatus } : c),
        }))
      }
    },

    // ================ FAVORITES ================
    toggleFavorite: async (carId) => {
      const { currentUser, favorites } = get()
      if (!currentUser) return

      const existing = favorites.find(f => f.userId === currentUser.id && f.carId === carId)
      if (existing) {
        const { error } = await supabase.from('favorites').delete().eq('id', existing.id)
        if (!error) set(s => ({ favorites: s.favorites.filter(f => f.id !== existing.id) }))
      } else {
        const { data, error } = await supabase.from('favorites').insert({
          user_id: currentUser.id,
          car_id: carId,
        }).select().single()
        if (!error && data) set(s => ({ favorites: [...s.favorites, mapFavorite(data)] }))
      }
    },

    isFavorited: (carId) => {
      const { currentUser, favorites } = get()
      if (!currentUser) return false
      return favorites.some(f => f.userId === currentUser.id && f.carId === carId)
    },

    // ================ CAROUSEL ================
    addCarousel: async (item) => {
      const { data, error } = await supabase.from('carousels').insert(item).select().single()
      if (!error && data) set(s => ({ carousels: [...s.carousels, mapCarousel(data)] }))
    },
    updateCarousel: async (id, data) => {
      await supabase.from('carousels').update(data).eq('id', id)
      set(s => ({ carousels: s.carousels.map(c => c.id === id ? { ...c, ...data } : c) }))
    },
    deleteCarousel: async (id) => {
      await supabase.from('carousels').delete().eq('id', id)
      set(s => ({ carousels: s.carousels.filter(c => c.id !== id) }))
    },

    // ================ ANNOUNCEMENTS ================
    addAnnouncement: async (title, content) => {
      const { data, error } = await supabase.from('announcements').insert({ title, content }).select().single()
      if (!error && data) set(s => ({ announcements: [...s.announcements, mapAnnouncement(data)] }))
    },
    updateAnnouncement: async (id, data) => {
      await supabase.from('announcements').update(data).eq('id', id)
      set(s => ({ announcements: s.announcements.map(a => a.id === id ? { ...a, ...data } : a) }))
    },
    deleteAnnouncement: async (id) => {
      await supabase.from('announcements').delete().eq('id', id)
      set(s => ({ announcements: s.announcements.filter(a => a.id !== id) }))
    },

    // ================ ADMIN ACCOUNTS ================
    addAdmin: async (admin) => {
      const hash = await sha256(admin.password || '123456')
      const { data, error } = await supabase.from('admins').insert({
        username: admin.username,
        password_hash: hash,
        name: admin.name,
        role: admin.role,
      }).select().single()
      if (!error && data) set(s => ({ admins: [...s.admins, mapAdmin(data)] }))
    },
    updateAdmin: async (id, data) => {
      const payload: any = { ...data }
      if ((data as any).password) {
        payload.password_hash = await sha256((data as any).password)
        delete payload.password
      }
      delete payload.password_hash // don't let client override hash directly
      if ((data as any).password) {
        payload.password_hash = await sha256((data as any).password)
      }
      await supabase.from('admins').update(payload).eq('id', id)
      set(s => ({ admins: s.admins.map(a => a.id === id ? { ...a, ...data } : a) }))
    },
    deleteAdmin: async (id) => {
      await supabase.from('admins').delete().eq('id', id)
      set(s => ({ admins: s.admins.filter(a => a.id !== id) }))
    },

    // ================ USER MANAGEMENT ================
    toggleUserStatus: () => {},

    // ================ HELPERS ================
    getBrandName: (brandId) => get().brands.find(b => b.id === brandId)?.name ?? '未知',
    getColorName: (colorId) => get().colors.find(c => c.id === colorId)?.name ?? '未知',
    getColorValue: (colorId) => get().colors.find(c => c.id === colorId)?.value ?? '#999',
    getCar: (carId) => get().cars.find(c => c.id === carId),
  }
})
