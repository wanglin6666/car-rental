import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../store/useStore'

export default function CarList() {
  const { cars, brands, colors, getBrandName, getColorName } = useStore()
  const [brandFilter, setBrandFilter] = useState('')
  const [colorFilter, setColorFilter] = useState('')
  const [priceRange, setPriceRange] = useState('')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    return cars.filter(car => {
      if (brandFilter && car.brandId !== brandFilter) return false
      if (colorFilter && car.colorId !== colorFilter) return false
      if (priceRange === '0-200' && car.dailyPrice > 200) return false
      if (priceRange === '200-400' && (car.dailyPrice <= 200 || car.dailyPrice > 400)) return false
      if (priceRange === '400-600' && (car.dailyPrice <= 400 || car.dailyPrice > 600)) return false
      if (priceRange === '600+' && car.dailyPrice <= 600) return false
      if (search && !car.name.toLowerCase().includes(search.toLowerCase()) && !car.plateNumber.includes(search)) return false
      return true
    })
  }, [cars, brandFilter, colorFilter, priceRange, search])

  const statusLabel = (status: string) => {
    switch (status) {
      case 'available': return <span className="badge badge-success">可租赁</span>
      case 'rented': return <span className="badge badge-warning">已租出</span>
      case 'maintenance': return <span className="badge badge-muted">维修中</span>
    }
  }

  return (
    <div className="container" style={{ marginTop: 24, marginBottom: 40 }}>
      <div className="page-header">
        <h1 className="page-title">车辆列表</h1>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20, padding: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 180px' }}>
          <label className="form-label">🔍 搜索</label>
          <input className="form-input" type="text" placeholder="车型名称 / 车牌号"
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ flex: '1 1 140px' }}>
          <label className="form-label">品牌</label>
          <select className="form-select" value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
            <option value="">全部品牌</option>
            {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div style={{ flex: '1 1 140px' }}>
          <label className="form-label">颜色</label>
          <select className="form-select" value={colorFilter} onChange={e => setColorFilter(e.target.value)}>
            <option value="">全部颜色</option>
            {colors.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div style={{ flex: '1 1 140px' }}>
          <label className="form-label">日租价格</label>
          <select className="form-select" value={priceRange} onChange={e => setPriceRange(e.target.value)}>
            <option value="">不限</option>
            <option value="0-200">¥200以下</option>
            <option value="200-400">¥200-400</option>
            <option value="400-600">¥400-600</option>
            <option value="600+">¥600以上</option>
          </select>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => { setBrandFilter(''); setColorFilter(''); setPriceRange(''); setSearch('') }}>
          重置筛选
        </button>
      </div>

      {/* Result count */}
      <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
        共 {filtered.length} 辆车辆
      </p>

      {/* Car grid */}
      <div className="car-grid">
        {filtered.map(car => (
          <Link to={`/cars/${car.id}`} key={car.id} className="car-card">
            <img className="car-card-img" src={car.image} alt={car.name} />
            <div className="car-card-body">
              <div className="car-card-title">{car.name}</div>
              <div className="car-card-info">
                {getBrandName(car.brandId)} · {getColorName(car.colorId)} · {car.plateNumber}
              </div>
              <div className="car-card-footer">
                <div className="car-card-price">¥{car.dailyPrice}<span>/天</span></div>
                {statusLabel(car.status)}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          没有找到匹配的车辆
        </div>
      )}
    </div>
  )
}
