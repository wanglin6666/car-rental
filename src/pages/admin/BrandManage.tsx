import { useState } from 'react'
import { useStore } from '../../store/useStore'

export default function BrandManage() {
  const { brands, addBrand, updateBrand, deleteBrand } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [logo, setLogo] = useState('')
  const [msg, setMsg] = useState('')

  const resetForm = () => {
    setName('')
    setLogo('')
    setEditingId(null)
    setShowForm(false)
    setMsg('')
  }

  const handleEdit = (id: string) => {
    const brand = brands.find(b => b.id === id)
    if (!brand) return
    setName(brand.name)
    setLogo(brand.logo)
    setEditingId(id)
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) { setMsg('请输入品牌名称'); return }
    if (editingId) {
      updateBrand(editingId, { name: name.trim(), logo: logo.trim() || '🚗' })
      setMsg('修改成功')
    } else {
      addBrand(name.trim(), logo.trim() || '🚗')
      setMsg('添加成功')
    }
    resetForm()
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🏷️ 品牌管理</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm) }}>
          {showForm ? '取消' : '+ 添加品牌'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label className="form-label">品牌名称</label>
              <input className="form-input" placeholder="如：丰田" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div style={{ flex: '1 1 150px' }}>
              <label className="form-label">图标 (emoji)</label>
              <input className="form-input" placeholder="如：🚗" value={logo} onChange={e => setLogo(e.target.value)} />
            </div>
            <button className="btn btn-primary">{editingId ? '保存修改' : '确认添加'}</button>
            {msg && <span style={{ color: 'var(--success)', fontSize: 13 }}>{msg}</span>}
          </form>
        </div>
      )}

      <div className="table-wrap card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr><th>图标</th><th>品牌名称</th><th>操作</th></tr>
          </thead>
          <tbody>
            {brands.map(b => (
              <tr key={b.id}>
                <td style={{ fontSize: 28 }}>{b.logo}</td>
                <td style={{ fontWeight: 600 }}>{b.name}</td>
                <td>
                  <button className="btn btn-outline btn-sm" onClick={() => handleEdit(b.id)}>编辑</button>
                  <button className="btn btn-danger btn-sm" style={{ marginLeft: 8 }}
                    onClick={() => { if (confirm(`确定删除品牌"${b.name}"？`)) deleteBrand(b.id) }}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
