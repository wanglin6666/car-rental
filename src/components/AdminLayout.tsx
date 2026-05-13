import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

const navItems = [
  { path: '/admin', label: '📊 仪表盘', exact: true },
  { path: '/admin/brands', label: '🏷️ 品牌管理' },
  { path: '/admin/colors', label: '🎨 颜色管理' },
  { path: '/admin/cars', label: '🚗 车辆管理' },
  { path: '/admin/orders', label: '📋 订单管理' },
  { path: '/admin/returns', label: '🔄 还车管理' },
  { path: '/admin/users', label: '👥 用户管理' },
  { path: '/admin/content', label: '📢 内容管理' },
  { path: '/admin/accounts', label: '⚙️ 账号管理' },
]

export default function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { currentAdmin, adminLogout } = useStore()

  const handleLogout = () => {
    adminLogout()
    navigate('/admin/login')
  }

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return location.pathname === item.path
    return location.pathname.startsWith(item.path)
  }

  return (
    <div className="admin-wrap">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">🚗 租车管理后台</div>
        {navItems.map(item => (
          <Link key={item.path} to={item.path} className={isActive(item) ? 'active' : ''}>
            {item.label}
          </Link>
        ))}
      </aside>
      <div className="admin-main">
        <div className="admin-topbar">
          <div className="admin-topbar-title">
            👤 {currentAdmin?.name}（{currentAdmin?.role === 'super' ? '超级管理员' : '普通管理员'}）
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/" className="btn btn-outline btn-sm" target="_blank">前往前台</Link>
            <button className="btn btn-outline btn-sm" onClick={handleLogout}>退出登录</button>
          </div>
        </div>
        <Outlet />
      </div>
    </div>
  )
}
