import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useStore } from './store/useStore'
import UserLayout from './components/UserLayout'
import AdminLayout from './components/AdminLayout'

// User pages
import Home from './pages/user/Home'
import Login from './pages/user/Login'
import Register from './pages/user/Register'
import CarList from './pages/user/CarList'
import CarDetail from './pages/user/CarDetail'
import UserCenter from './pages/user/UserCenter'
import Favorites from './pages/user/Favorites'
import Orders from './pages/user/Orders'
import Returns from './pages/user/Returns'

// Admin pages
import AdminLogin from './pages/admin/AdminLogin'
import Dashboard from './pages/admin/Dashboard'
import BrandManage from './pages/admin/BrandManage'
import ColorManage from './pages/admin/ColorManage'
import CarManage from './pages/admin/CarManage'
import OrderManage from './pages/admin/OrderManage'
import ReturnManage from './pages/admin/ReturnManage'
import UserManage from './pages/admin/UserManage'
import ContentManage from './pages/admin/ContentManage'
import AdminAccountManage from './pages/admin/AdminAccountManage'

function ProtectedUserRoute({ children }: { children: React.ReactNode }) {
  const currentUser = useStore(s => s.currentUser)
  if (!currentUser) return <Navigate to="/login" replace />
  return <>{children}</>
}

function ProtectedAdminRoute({ children }: { children: React.ReactNode }) {
  const currentAdmin = useStore(s => s.currentAdmin)
  if (!currentAdmin) return <Navigate to="/admin/login" replace />
  return <>{children}</>
}

export default function App() {
  const initialized = useStore(s => s.initialized)
  const init = useStore(s => s.init)

  useEffect(() => {
    init()
  }, [init])

  if (!initialized) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', flexDirection: 'column', gap: 12,
        color: 'var(--text-muted)', fontSize: 14,
      }}>
        <div style={{ fontSize: 32 }}>🚗</div>
        <div>连接服务器中...</div>
      </div>
    )
  }

  return (
    <Routes>
      {/* User routes */}
      <Route path="/" element={<UserLayout />}>
        <Route index element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="cars" element={<CarList />} />
        <Route path="cars/:id" element={<CarDetail />} />
        <Route path="user/center" element={<ProtectedUserRoute><UserCenter /></ProtectedUserRoute>} />
        <Route path="user/favorites" element={<ProtectedUserRoute><Favorites /></ProtectedUserRoute>} />
        <Route path="user/orders" element={<ProtectedUserRoute><Orders /></ProtectedUserRoute>} />
        <Route path="user/returns" element={<ProtectedUserRoute><Returns /></ProtectedUserRoute>} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<ProtectedAdminRoute><AdminLayout /></ProtectedAdminRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="brands" element={<BrandManage />} />
        <Route path="colors" element={<ColorManage />} />
        <Route path="cars" element={<CarManage />} />
        <Route path="orders" element={<OrderManage />} />
        <Route path="returns" element={<ReturnManage />} />
        <Route path="users" element={<UserManage />} />
        <Route path="content" element={<ContentManage />} />
        <Route path="accounts" element={<AdminAccountManage />} />
      </Route>
    </Routes>
  )
}
