import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'

export default function Register() {
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const register = useStore(s => s.register)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim() || !email.trim() || !name.trim() || !password.trim()) {
      setMsg('请填写所有必填项')
      return
    }
    if (!/^1[3-9]\d{9}$/.test(phone.trim())) {
      setMsg('请输入正确的手机号')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setMsg('请输入正确的邮箱地址')
      return
    }
    if (password.length < 6) {
      setMsg('密码长度至少6位')
      return
    }
    if (password !== confirm) {
      setMsg('两次输入的密码不一致')
      return
    }
    setLoading(true)
    setMsg('')
    try {
      const result = await register(phone.trim(), email.trim(), password, name.trim())
      setMsg(result.msg)
      if (result.ok) {
        setTimeout(() => navigate('/login'), 1500)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420, margin: '60px auto' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>用户注册</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">姓名 *</label>
            <input className="form-input" type="text" placeholder="请输入姓名"
              value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">手机号 *</label>
            <input className="form-input" type="text" placeholder="请输入11位手机号"
              value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">邮箱 *</label>
            <input className="form-input" type="email" placeholder="请输入邮箱地址"
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">密码 *</label>
            <input className="form-input" type="password" placeholder="至少6位密码"
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">确认密码 *</label>
            <input className="form-input" type="password" placeholder="再次输入密码"
              value={confirm} onChange={e => setConfirm(e.target.value)} />
          </div>
          {msg && <p style={{ color: msg.includes('成功') ? 'var(--success)' : 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{msg}</p>}
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? '注册中...' : '注 册'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: 'var(--text-muted)' }}>
          已有账号？<Link to="/login" style={{ color: 'var(--primary)' }}>去登录</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
          提示：如果 Supabase 开启了邮箱验证，注册后请查看邮箱，或在 Supabase 面板关闭邮件确认
        </p>
      </div>
    </div>
  )
}
