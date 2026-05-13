import { useState } from 'react'
import { useStore } from '../../store/useStore'

export default function AdminAccountManage() {
  const { admins, currentAdmin, addAdmin, updateAdmin, deleteAdmin } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'super' | 'normal'>('normal')
  const [msg, setMsg] = useState('')

  const resetForm = () => {
    setUsername('')
    setPassword('')
    setName('')
    setRole('normal')
    setEditingId(null)
    setShowForm(false)
    setMsg('')
  }

  const handleEdit = (id: string) => {
    const admin = admins.find(a => a.id === id)
    if (!admin) return
    setUsername(admin.username)
    setPassword(admin.password)
    setName(admin.name)
    setRole(admin.role)
    setEditingId(id)
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username.trim() || !name.trim()) { setMsg('请填写必填项'); return }
    if (!editingId && !password.trim()) { setMsg('请输入密码'); return }

    const exists = admins.find(a => a.username === username.trim() && a.id !== editingId)
    if (exists) { setMsg('该账号已存在'); return }

    if (editingId) {
      updateAdmin(editingId, {
        username: username.trim(),
        ...(password.trim() ? { password: password.trim() } : {}),
        name: name.trim(),
        role,
      })
      setMsg('修改成功')
    } else {
      addAdmin({ username: username.trim(), password: password.trim(), name: name.trim(), role })
      setMsg('添加成功')
    }
    resetForm()
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">⚙️ 管理员账号管理</h1>
        {currentAdmin?.role === 'super' && (
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm) }}>
            {showForm ? '取消' : '+ 添加管理员'}
          </button>
        )}
      </div>

      {showForm && currentAdmin?.role === 'super' && (
        <div className="card" style={{ marginBottom: 20 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 150px' }}>
              <label className="form-label">账号 *</label>
              <input className="form-input" placeholder="登录账号" value={username} onChange={e => setUsername(e.target.value)} />
            </div>
            <div style={{ flex: '1 1 150px' }}>
              <label className="form-label">{editingId ? '新密码（留空不修改）' : '密码 *'}</label>
              <input className="form-input" type="password" placeholder="密码" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <div style={{ flex: '1 1 120px' }}>
              <label className="form-label">姓名 *</label>
              <input className="form-input" placeholder="姓名" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="form-label">角色</label>
              <select className="form-select" value={role} onChange={e => setRole(e.target.value as 'super' | 'normal')}>
                <option value="normal">普通管理员</option>
                <option value="super">超级管理员</option>
              </select>
            </div>
            <button className="btn btn-primary">{editingId ? '保存修改' : '确认添加'}</button>
            {msg && <span style={{ color: msg.includes('成功') ? 'var(--success)' : 'var(--danger)', fontSize: 13 }}>{msg}</span>}
          </form>
        </div>
      )}

      <div className="table-wrap card" style={{ padding: 0 }}>
        <table>
          <thead><tr><th>账号</th><th>姓名</th><th>角色</th><th>创建时间</th><th>操作</th></tr></thead>
          <tbody>
            {admins.map(a => (
              <tr key={a.id}>
                <td style={{ fontFamily: 'monospace' }}>{a.username}</td>
                <td style={{ fontWeight: 600 }}>{a.name}</td>
                <td>
                  <span className={`badge ${a.role === 'super' ? 'badge-danger' : 'badge-info'}`}>
                    {a.role === 'super' ? '超级管理员' : '普通管理员'}
                  </span>
                </td>
                <td style={{ fontSize: 13 }}>{new Date(a.createdAt).toLocaleDateString('zh-CN')}</td>
                <td>
                  {currentAdmin?.role === 'super' && (
                    <>
                      <button className="btn btn-outline btn-sm" onClick={() => handleEdit(a.id)}>编辑</button>
                      {a.id !== currentAdmin?.id && (
                        <button className="btn btn-danger btn-sm" style={{ marginLeft: 8 }}
                          onClick={() => { if (confirm('确定删除此管理员？')) deleteAdmin(a.id) }}>删除</button>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
