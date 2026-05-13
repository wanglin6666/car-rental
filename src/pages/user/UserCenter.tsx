import { useState } from 'react'
import { useStore } from '../../store/useStore'

export default function UserCenter() {
  const { currentUser, updateProfile } = useStore()
  const [name, setName] = useState(currentUser?.name ?? '')
  const [email, setEmail] = useState(currentUser?.email ?? '')
  const [msg, setMsg] = useState('')

  if (!currentUser) return null

  const handleSave = () => {
    if (!name.trim()) { setMsg('姓名不能为空'); return }
    updateProfile({ name: name.trim(), email: email.trim() })
    setMsg('保存成功')
  }

  return (
    <div className="container" style={{ maxWidth: 600, margin: '32px auto' }}>
      <div className="page-header">
        <h1 className="page-title">个人中心</h1>
      </div>
      <div className="card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 64, marginBottom: 8 }}>👤</div>
          <h3>{currentUser.name}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{currentUser.phone}</p>
        </div>

        <div className="form-group">
          <label className="form-label">姓名</label>
          <input className="form-input" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">手机号</label>
          <input className="form-input" value={currentUser.phone} disabled />
        </div>
        <div className="form-group">
          <label className="form-label">邮箱</label>
          <input className="form-input" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">注册时间</label>
          <input className="form-input" value={new Date(currentUser.createdAt).toLocaleDateString('zh-CN')} disabled />
        </div>
        {msg && <p style={{ color: 'var(--success)', fontSize: 13, marginBottom: 12 }}>{msg}</p>}
        <button className="btn btn-primary" onClick={handleSave}>保存修改</button>
      </div>
    </div>
  )
}
