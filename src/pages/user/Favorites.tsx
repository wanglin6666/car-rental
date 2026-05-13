import { Link } from 'react-router-dom'
import { useStore } from '../../store/useStore'

export default function Favorites() {
  const { currentUser, favorites, getCar, getBrandName, toggleFavorite } = useStore()

  if (!currentUser) return null

  const myFavorites = favorites
    .filter(f => f.userId === currentUser.id)
    .map(f => ({ favorite: f, car: getCar(f.carId) }))
    .filter(item => item.car)

  return (
    <div className="container" style={{ marginTop: 24, marginBottom: 40 }}>
      <div className="page-header">
        <h1 className="page-title">我的收藏</h1>
      </div>

      {myFavorites.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 48, marginBottom: 12 }}>💔</p>
          <p>还没有收藏任何车辆</p>
          <Link to="/cars" className="btn btn-primary" style={{ marginTop: 12 }}>去看看</Link>
        </div>
      ) : (
        <div className="car-grid">
          {myFavorites.map(({ favorite, car }) => car && (
            <div key={favorite.id} className="car-card" style={{ position: 'relative' }}>
              <Link to={`/cars/${car.id}`}>
                <img className="car-card-img" src={car.image} alt={car.name} />
              </Link>
              <button
                onClick={() => toggleFavorite(car.id)}
                style={{
                  position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,.9)',
                  border: 'none', borderRadius: '50%', width: 32, height: 32,
                  cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,.2)',
                }}
              >❤️</button>
              <Link to={`/cars/${car.id}`}>
                <div className="car-card-body">
                  <div className="car-card-title">{car.name}</div>
                  <div className="car-card-info">{getBrandName(car.brandId)} · {car.plateNumber}</div>
                  <div className="car-card-footer">
                    <div className="car-card-price">¥{car.dailyPrice}<span>/天</span></div>
                    <span className={`badge ${car.status === 'available' ? 'badge-success' : car.status === 'rented' ? 'badge-warning' : 'badge-muted'}`}>
                      {car.status === 'available' ? '可租赁' : car.status === 'rented' ? '已租出' : '维修中'}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
