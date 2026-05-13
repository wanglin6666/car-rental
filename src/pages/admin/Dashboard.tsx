import { useStore } from '../../store/useStore'

export default function Dashboard() {
  const { cars, orders, users, returnRecords } = useStore()

  const availableCars = cars.filter(c => c.status === 'available').length
  const rentedCars = cars.filter(c => c.status === 'rented').length
  const maintenanceCars = cars.filter(c => c.status === 'maintenance').length
  const pendingOrders = orders.filter(o => o.status === 'pending_payment').length
  const activeOrders = orders.filter(o => o.status === 'paid' || o.status === 'renting').length
  const completedOrders = orders.filter(o => o.status === 'returned').length

  const stats = [
    { label: '车辆总数', value: cars.length, color: '#2563eb', icon: '🚗' },
    { label: '可租赁', value: availableCars, color: '#16a34a', icon: '✅' },
    { label: '已租出', value: rentedCars, color: '#f59e0b', icon: '🔑' },
    { label: '维修中', value: maintenanceCars, color: '#64748b', icon: '🔧' },
    { label: '注册用户', value: users.length, color: '#8b5cf6', icon: '👥' },
    { label: '待处理订单', value: pendingOrders, color: '#f59e0b', icon: '📋' },
    { label: '进行中订单', value: activeOrders, color: '#3b82f6', icon: '🔄' },
    { label: '已完成订单', value: completedOrders, color: '#16a34a', icon: '✅' },
    { label: '还车记录', value: returnRecords.length, color: '#6366f1', icon: '📝' },
  ]

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20 }}>📊 数据概览</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {stats.map(s => (
          <div key={s.label} className="card" style={{
            padding: 20, borderLeft: `4px solid ${s.color}`,
          }}>
            <div style={{ fontSize: 28, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 700 }}>{s.value}</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <h3 style={{ fontSize: 16, fontWeight: 600, marginTop: 28, marginBottom: 12 }}>最近订单</h3>
      <div className="table-wrap card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr>
              <th>订单编号</th>
              <th>状态</th>
              <th>金额</th>
              <th>租期</th>
              <th>创建时间</th>
            </tr>
          </thead>
          <tbody>
            {orders.slice(-8).reverse().map(o => (
              <tr key={o.id}>
                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{o.id}</td>
                <td>
                  {o.status === 'pending_payment' && <span className="badge badge-warning">待支付</span>}
                  {o.status === 'paid' && <span className="badge badge-info">已支付</span>}
                  {o.status === 'renting' && <span className="badge badge-success">租赁中</span>}
                  {o.status === 'returned' && <span className="badge badge-muted">已还车</span>}
                  {o.status === 'cancelled' && <span className="badge badge-muted">已取消</span>}
                </td>
                <td style={{ fontWeight: 600, color: 'var(--danger)' }}>¥{o.totalPrice}</td>
                <td style={{ fontSize: 13 }}>{o.startDate} ~ {o.endDate}</td>
                <td style={{ fontSize: 13 }}>{new Date(o.createdAt).toLocaleString('zh-CN')}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>暂无订单</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
