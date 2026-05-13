import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'

export default function Login() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const login = useStore(s => s.login)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!phone.trim() || !password.trim()) {
      setMsg('请填写手机号和密码')
      return
    }
    if (!/^1[3-9]\d{9}$/.test(phone.trim())) {
      setMsg('请输入正确的手机号')
      return
    }
    setLoading(true)
    setMsg('')
    try {
      const result = await login(phone.trim(), password)
      setMsg(result.msg)
      if (result.ok) navigate('/')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420, margin: '60px auto' }}>
      <div className="card">
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>用户登录</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">手机号</label>
            <input className="form-input" type="text" placeholder="请输入11位手机号"
              value={phone} onChange={e => setPhone(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">密码</label>
            <input className="form-input" type="password" placeholder="请输入密码"
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          {msg && <p style={{ color: msg.includes('成功') ? 'var(--success)' : 'var(--danger)', fontSize: 13, marginBottom: 12 }}>{msg}</p>}
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? '登录中...' : '登 录'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 14, color: 'var(--text-muted)' }}>
          还没有账号？<Link to="/register" style={{ color: 'var(--primary)' }}>立即注册</Link>
        </p>
      </div>
    </div>
  )
}
