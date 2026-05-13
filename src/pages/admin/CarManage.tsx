import { useState } from 'react'
import { useStore } from '../../store/useStore'
import type { CarStatus } from '../../types'

const emptyCar = { brandId: '', colorId: '', name: '', plateNumber: '', dailyPrice: 0, deposit: 0, image: '', description: '', status: 'available' as CarStatus }

export default function CarManage() {
  const { cars, brands, colors, addCar, updateCar, deleteCar, getBrandName, getColorName } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyCar)
  const [msg, setMsg] = useState('')

  const resetForm = () => {
    setForm(emptyCar)
    setEditingId(null)
    setShowForm(false)
    setMsg('')
  }

  const handleEdit = (id: string) => {
    const car = cars.find(c => c.id === id)
    if (!car) return
    setForm({ brandId: car.brandId, colorId: car.colorId, name: car.name, plateNumber: car.plateNumber, dailyPrice: car.dailyPrice, deposit: car.deposit, image: car.image, description: car.description, status: car.status })
    setEditingId(id)
    setShowForm(true)
  }

  const updateField = (field: string, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim() || !form.plateNumber.trim() || !form.brandId || !form.colorId) {
      setMsg('请填写所有必填项'); return
    }
    if (form.dailyPrice <= 0) { setMsg('日租价格必须大于0'); return }

    if (editingId) {
      updateCar(editingId, form)
      setMsg('修改成功')
    } else {
      addCar(form)
      setMsg('添加成功')
    }
    resetForm()
  }

  const statusLabel = (s: string) => {
    switch (s) {
      case 'available': return <span className="badge badge-success">可租赁</span>
      case 'rented': return <span className="badge badge-warning">已租出</span>
      case 'maintenance': return <span className="badge badge-muted">维修中</span>
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🚗 车辆管理</h1>
        <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(!showForm) }}>
          {showForm ? '取消' : '+ 添加车辆'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
              <div><label className="form-label">品牌 *</label>
                <select className="form-select" value={form.brandId} onChange={e => updateField('brandId', e.target.value)}>
                  <option value="">请选择品牌</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              <div><label className="form-label">颜色 *</label>
                <select className="form-select" value={form.colorId} onChange={e => updateField('colorId', e.target.value)}>
                  <option value="">请选择颜色</option>
                  {colors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div><label className="form-label">车辆名称 *</label>
                <input className="form-input" placeholder="如：卡罗拉 2024款" value={form.name} onChange={e => updateField('name', e.target.value)} />
              </div>
              <div><label className="form-label">车牌号 *</label>
                <input className="form-input" placeholder="如：京A·12345" value={form.plateNumber} onChange={e => updateField('plateNumber', e.target.value)} />
              </div>
              <div><label className="form-label">日租价格 (元) *</label>
                <input className="form-input" type="number" min="0" value={form.dailyPrice || ''} onChange={e => updateField('dailyPrice', Number(e.target.value))} />
              </div>
              <div><label className="form-label">押金 (元)</label>
                <input className="form-input" type="number" min="0" value={form.deposit || ''} onChange={e => updateField('deposit', Number(e.target.value))} />
              </div>
              <div><label className="form-label">车辆状态</label>
                <select className="form-select" value={form.status} onChange={e => updateField('status', e.target.value)}>
                  <option value="available">可租赁</option>
                  <option value="rented">已租出</option>
                  <option value="maintenance">维修中</option>
                </select>
              </div>
              <div><label className="form-label">图片URL</label>
                <input className="form-input" placeholder="https://..." value={form.image} onChange={e => updateField('image', e.target.value)} />
              </div>
            </div>
            <div style={{ marginTop: 12 }}>
              <label className="form-label">描述</label>
              <textarea className="form-textarea" placeholder="车辆描述..." value={form.description} onChange={e => updateField('description', e.target.value)} />
            </div>
            <div style={{ marginTop: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
              <button className="btn btn-primary">{editingId ? '保存修改' : '确认添加'}</button>
              {msg && <span style={{ color: 'var(--success)', fontSize: 13 }}>{msg}</span>}
            </div>
          </form>
        </div>
      )}

      <div className="table-wrap card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr><th>图片</th><th>名称</th><th>品牌</th><th>颜色</th><th>车牌号</th><th>日租</th><th>押金</th><th>状态</th><th>操作</th></tr>
          </thead>
          <tbody>
            {cars.map(car => (
              <tr key={car.id}>
                <td>{car.image ? <img src={car.image} alt="" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 4 }} /> : '-'}</td>
                <td style={{ fontWeight: 600 }}>{car.name}</td>
                <td>{getBrandName(car.brandId)}</td>
                <td>{getColorName(car.colorId)}</td>
                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{car.plateNumber}</td>
                <td style={{ color: 'var(--danger)', fontWeight: 600 }}>¥{car.dailyPrice}</td>
                <td>¥{car.deposit}</td>
                <td>{statusLabel(car.status)}</td>
                <td>
                  <button className="btn btn-outline btn-sm" onClick={() => handleEdit(car.id)}>编辑</button>
                  <button className="btn btn-danger btn-sm" style={{ marginLeft: 8 }}
                    onClick={() => { if (confirm(`确定删除车辆"${car.name}"？`)) deleteCar(car.id) }}>删除</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
