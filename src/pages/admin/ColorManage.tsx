import { useState } from 'react'
import { useStore } from '../../store/useStore'

export default function ColorManage() {
  const { colors, addColor, updateColor, deleteColor } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [value, setValue] = useState('#3B82F6')
  const [msg, setMsg] = useState('')

  const resetForm = () => {
    setName('')
    setValue('#3B82F6')
    setEditingId(null)
    setShowForm(false)
    setMsg('')
  }

  const handleEdit = (id: string) => {
    const c = colors.find(x => x.id === id)
    if (!c) return
    setName(c.name)
    setValue(c.value)
    setEditingId(id)
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setMsg('请输入颜色名称'); return }
    if (editingId) {
      updateColor(editingId, { name: name.trim(), value })
      setMsg('修改成功')
    } else {
      addColor(name.trim(), value)
      setMsg('添加成功')
    }
    resetForm()
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🎨 颜色管理</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm) }}>
          {showForm ? '取消' : '+ 添加颜色'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label className="form-label">颜色名称</label>
              <input className="form-input" placeholder="如：珍珠白" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <label className="form-label">颜色值</label>
              <input type="color" value={value} onChange={e => setValue(e.target.value)}
                style={{ width: 48, height: 40, border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer' }} />
            </div>
            <button className="btn btn-primary">{editingId ? '保存修改' : '确认添加'}</button>
            {msg && <span style={{ color: 'var(--success)', fontSize: 13 }}>{msg}</span>}
          </form>
        </div>
      )}

      <div className="table-wrap card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr><th>颜色预览</th><th>颜色名称</th><th>色值</th><th>操作</th></tr>
          </thead>
          <tbody>
            {colors.map(c => (
              <tr key={c.id}>
                <td><span style={{ display: 'inline-block', width: 32, height: 32, borderRadius: '50%', background: c.value, border: '1px solid #ddd' }} /></td>
                <td style={{ fontWeight: 600 }}>{c.name}</td>
                <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{c.value}</td>
                <td>
                  <button className="btn btn-outline btn-sm" onClick={() => handleEdit(c.id)}>编辑</button>
                  <button className="btn btn-danger btn-sm" style={{ marginLeft: 8 }}
                    onClick={() => { if (confirm(`确定删除颜色"${c.name}"？`)) deleteColor(c.id) }}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
