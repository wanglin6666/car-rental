import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import dayjs from 'dayjs'

export default function CarDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getCar, getBrandName, getColorName, getColorValue, currentUser, createOrder, isFavorited, toggleFavorite } = useStore()
  const car = getCar(id ?? '')

  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [msg, setMsg] = useState('')
  const [msgType, setMsgType] = useState<'success' | 'error'>('success')

  if (!car) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: 80 }}>
        <h2>车辆不存在</h2>
        <Link to="/cars" className="btn btn-primary" style={{ marginTop: 16 }}>返回车辆列表</Link>
      </div>
    )
  }

  const favorited = currentUser ? isFavorited(car.id) : false

  const statusMap: Record<string, { label: string; cls: string }> = {
    available: { label: '可租赁', cls: 'badge-success' },
    rented: { label: '已租出', cls: 'badge-warning' },
    maintenance: { label: '维修中', cls: 'badge-muted' },
  }

  const st = statusMap[car.status]

  const today = dayjs().format('YYYY-MM-DD')

  const calculate = () => {
    if (!startDate || !endDate) return { days: 0, total: 0 }
    const s = dayjs(startDate)
    const e = dayjs(endDate)
    if (!s.isBefore(e)) return { days: 0, total: 0 }
    const days = e.diff(s, 'day')
    return { days, total: days * car.dailyPrice }
  }

  const { days, total } = calculate()

  const [ordering, setOrdering] = useState(false)

  const handleOrder = async () => {
    setMsg('')
    if (!currentUser) {
      navigate('/login')
      return
    }
    if (!startDate || !endDate) {
      setMsg('请选择租赁起止日期')
      setMsgType('error')
      return
    }
    setOrdering(true)
    try {
      const result = await createOrder(car.id, startDate, endDate)
      setMsg(result.msg)
      setMsgType(result.ok ? 'success' : 'error')
      if (result.ok) {
        setTimeout(() => navigate('/user/orders'), 1000)
      }
    } finally {
      setOrdering(false)
    }
  }

  return (
    <div className="container" style={{ marginTop: 24, marginBottom: 40 }}>
      <div className="detail-grid">
        <div>
          <img className="detail-img" src={car.image} alt={car.name} />
        </div>
        <div>
          <h1 className="detail-name">{car.name}</h1>
          <div className="detail-meta">
            <span className="detail-tag">{getBrandName(car.brandId)}</span>
            <span className="detail-tag" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 14, height: 14, borderRadius: '50%', background: getColorValue(car.colorId), display: 'inline-block', border: '1px solid #ddd' }} />
              {getColorName(car.colorId)}
            </span>
            <span className="detail-tag">{car.plateNumber}</span>
            <span className={`badge ${st.cls}`}>{st.label}</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, lineHeight: 1.8 }}>{car.description}</p>
          <div className="detail-price">¥{car.dailyPrice}<span> / 天</span></div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>押金：¥{car.deposit}</p>

          <div className="detail-actions">
            <button className={`btn ${favorited ? 'btn-warning' : 'btn-outline'}`}
              onClick={() => {
                if (!currentUser) { navigate('/login'); return }
                toggleFavorite(car.id)
              }}>
              {favorited ? '❤️ 已收藏' : '🤍 收藏'}
            </button>
          </div>

          {/* Order form */}
          {car.status === 'available' && (
            <div className="order-form">
              <h3 style={{ fontSize: 16, marginBottom: 12 }}>📅 租赁下单</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label">开始日期</label>
                  <input className="form-input" type="date" min={today}
                    value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div>
                  <label className="form-label">结束日期</label>
                  <input className="form-input" type="date" min={startDate || today}
                    value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>
              {days > 0 && (
                <div className="order-summary">
                  <div className="order-summary-row"><span>租赁天数</span><span>{days} 天</span></div>
                  <div className="order-summary-row"><span>日租金</span><span>¥{car.dailyPrice}/天</span></div>
                  <div className="order-summary-row"><span>押金</span><span>¥{car.deposit}</span></div>
                  <div className="order-summary-total" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>租金合计</span><span>¥{total}</span>
                  </div>
                </div>
              )}
              {msg && (
                <p style={{ color: msgType === 'success' ? 'var(--success)' : 'var(--danger)', fontSize: 13, marginTop: 12 }}>{msg}</p>
              )}
              <button className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: 12 }}
                onClick={handleOrder} disabled={days <= 0 || ordering}>
                {ordering ? '下单中...' : '立即下单'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
