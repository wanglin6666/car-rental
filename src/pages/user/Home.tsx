import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useStore } from '../../store/useStore'

export default function Home() {
  const { cars, carousels, announcements, getBrandName } = useStore()
  const [slideIndex, setSlideIndex] = useState(0)
  const activeCarousels = carousels.filter(c => c.isActive).sort((a, b) => a.sort - b.sort)
  const activeAnnouncements = announcements.filter(a => a.isActive)
  const availableCars = cars.filter(c => c.status === 'available').slice(0, 6)

  useEffect(() => {
    if (activeCarousels.length <= 1) return
    const timer = setInterval(() => {
      setSlideIndex(i => (i + 1) % activeCarousels.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [activeCarousels.length])

  return (
    <div>
      {/* Carousel */}
      {activeCarousels.length > 0 && (
        <div className="carousel" style={{ borderRadius: 0 }}>
          <img src={activeCarousels[slideIndex].image} alt="轮播图" />
          <div className="carousel-dots">
            {activeCarousels.map((_, i) => (
              <button key={i} className={`carousel-dot ${i === slideIndex ? 'active' : ''}`}
                onClick={() => setSlideIndex(i)} />
            ))}
          </div>
        </div>
      )}

      <div className="container">
        {/* Announcements */}
        {activeAnnouncements.length > 0 && (
          <div className="section" style={{ marginTop: 24 }}>
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 'var(--radius)', padding: '12px 20px' }}>
              <span style={{ fontWeight: 600, marginRight: 12 }}>📢 公告：</span>
              {activeAnnouncements.map(a => (
                <span key={a.id} style={{ marginRight: 24, fontSize: 14 }}>{a.title} — {a.content}</span>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Cars */}
        <div className="section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 className="section-title" style={{ margin: 0 }}>推荐车型</h2>
            <Link to="/cars" className="btn btn-outline btn-sm">查看全部 →</Link>
          </div>
          <div className="car-grid">
            {availableCars.map(car => (
              <Link to={`/cars/${car.id}`} key={car.id} className="car-card">
                <img className="car-card-img" src={car.image} alt={car.name} />
                <div className="car-card-body">
                  <div className="car-card-title">{car.name}</div>
                  <div className="car-card-info">{getBrandName(car.brandId)} · {car.plateNumber}</div>
                  <div className="car-card-footer">
                    <div className="car-card-price">¥{car.dailyPrice}<span>/天</span></div>
                    <span className="badge badge-success">可租赁</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Why Us */}
        <div className="section" style={{ marginBottom: 40 }}>
          <h2 className="section-title">为什么选择行远租车</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              { icon: '🚗', title: '车型丰富', desc: '经济型到豪华型，满足各种出行需求' },
              { icon: '💰', title: '价格透明', desc: '日租价格清晰，无隐形费用' },
              { icon: '🔒', title: '安全可靠', desc: '车辆定期保养，保险齐全' },
              { icon: '📱', title: '便捷下单', desc: '在线选车下单，支持多种支付方式' },
            ].map(item => (
              <div key={item.title} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 36, marginBottom: 8 }}>{item.icon}</div>
                <h3 style={{ fontSize: 16, marginBottom: 4 }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
