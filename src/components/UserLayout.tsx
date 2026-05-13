import { useState, useRef, useEffect } from 'react'
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { useStore } from '../store/useStore'

export default function UserLayout() {
  const { currentUser, logout } = useStore()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleLogout = () => {
    logout()
    setShowDropdown(false)
    navigate('/')
  }

  const isActive = (path: string) => location.pathname === path ? 'active' : ''

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="header">
        <div className="header-inner">
          <Link to="/" className="header-logo">🚗 行远租车</Link>
          <nav className="header-nav">
            <Link to="/" className={isActive('/')}>首页</Link>
            <Link to="/cars" className={location.pathname.startsWith('/cars') ? 'active' : ''}>车辆列表</Link>
            {currentUser ? (
              <>
                <Link to="/user/orders" className={isActive('/user/orders')}>我的订单</Link>
                <Link to="/user/favorites" className={isActive('/user/favorites')}>我的收藏</Link>
                <div className="header-user" ref={dropdownRef}>
                  <span onClick={() => setShowDropdown(!showDropdown)} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    👤 {currentUser.name}
                  </span>
                  {showDropdown && (
                    <div className="header-user-dropdown">
                      <Link to="/user/center" onClick={() => setShowDropdown(false)}>个人中心</Link>
                      <Link to="/user/returns" onClick={() => setShowDropdown(false)}>还车记录</Link>
                      <button onClick={handleLogout}>退出登录</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className={isActive('/login')}>登录</Link>
            )}
          </nav>
        </div>
      </header>
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>
      <footer style={{
        textAlign: 'center', padding: '20px', fontSize: 13,
        color: 'var(--text-muted)', borderTop: '1px solid var(--border)', background: '#fff',
      }}>
        © 2026 行远租车 — 专业汽车租赁服务平台
      </footer>
    </div>
  )
}
