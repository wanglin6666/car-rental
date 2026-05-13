import { useStore } from '../../store/useStore'
import dayjs from 'dayjs'

export default function Orders() {
  const { currentUser, orders, cars, payOrder, cancelOrder, getBrandName } = useStore()

  if (!currentUser) return null

  const myOrders = orders
    .filter(o => o.userId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const statusConfig: Record<string, { label: string; cls: string }> = {
    pending_payment: { label: '待支付', cls: 'badge-warning' },
    paid: { label: '已支付', cls: 'badge-info' },
    renting: { label: '租赁中', cls: 'badge-success' },
    returned: { label: '已还车', cls: 'badge-muted' },
    cancelled: { label: '已取消', cls: 'badge-muted' },
  }

  const getCarInfo = (carId: string) => cars.find(c => c.id === carId)

  return (
    <div className="container" style={{ marginTop: 24, marginBottom: 40 }}>
      <div className="page-header">
        <h1 className="page-title">我的订单</h1>
      </div>

      {myOrders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 48, marginBottom: 12 }}>📋</p>
          <p>还没有任何订单</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {myOrders.map(order => {
            const car = getCarInfo(order.carId)
            const sc = statusConfig[order.status]
            const isOverdue = order.status === 'renting' && dayjs().isAfter(dayjs(order.endDate))

            return (
              <div key={order.id} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 16 }}>
                    {car && (
                      <img src={car.image} alt={car.name} style={{
                        width: 120, height: 80, objectFit: 'cover', borderRadius: 6,
                      }} />
                    )}
                    <div>
                      <h3 style={{ fontSize: 16, marginBottom: 4 }}>
                        {car ? `${car.name}` : '车辆已删除'}
                        {isOverdue && <span className="badge badge-danger" style={{ marginLeft: 8 }}>已逾期</span>}
                      </h3>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {car && `${getBrandName(car.brandId)} · ${car.plateNumber}`}
                      </p>
                      <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                        {order.startDate} ~ {order.endDate}（{order.days}天）
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className={`badge ${sc.cls}`}>{sc.label}</span>
                    <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--danger)', marginTop: 4 }}>
                      ¥{order.totalPrice}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      押金 ¥{order.deposit}
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ marginTop: 12, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  {order.status === 'pending_payment' && (
                    <>
                      <button className="btn btn-success btn-sm" onClick={() => payOrder(order.id)}>确认支付</button>
                      <button className="btn btn-outline btn-sm" onClick={() => cancelOrder(order.id)}>取消订单</button>
                    </>
                  )}
                  {order.status === 'paid' && (
                    <span className="badge badge-info" style={{ fontSize: 13 }}>等待管理员确认取车</span>
                  )}
                  {order.status === 'returned' && (
                    <span className="badge badge-muted" style={{ fontSize: 13 }}>订单已完成</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
