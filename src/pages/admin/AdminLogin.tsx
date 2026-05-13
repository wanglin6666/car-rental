import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useStore } from '../../store/useStore'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)
  const adminLogin = useStore(s => s.adminLogin)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !password.trim()) {
      setMsg('请填写账号和密码')
      return
    }
    setLoading(true)
    setMsg('')
    try {
      const result = await adminLogin(username.trim(), password)
      setMsg(result.msg)
      if (result.ok) navigate('/admin')
    } catch {
      setMsg('网络连接失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
    }}>
      <div className="card" style={{ width: 380, padding: 32 }}>
        <h2 style={{ textAlign: 'center', marginBottom: 8 }}>🚗 管理后台登录</h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginBottom: 24 }}>
          默认账号：admin / admin123
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">管理员账号</label>
            <input className="form-input" type="text" placeholder="请输入管理员账号"
              value={username} onChange={e => setUsername(e.target.value)} />
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
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13 }}>
          <Link to="/" style={{ color: 'var(--text-muted)' }}>← 返回前台</Link>
        </p>
      </div>
    </div>
  )
}
