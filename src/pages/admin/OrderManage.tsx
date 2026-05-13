import { useState } from 'react'
import { useStore } from '../../store/useStore'
import dayjs from 'dayjs'

export default function OrderManage() {
  const { orders, cars, users, adminCancelOrder, getBrandName } = useStore()
  const [statusFilter, setStatusFilter] = useState('')

  const filtered = orders
    .filter(o => !statusFilter || o.status === statusFilter)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const getCarInfo = (carId: string) => cars.find(c => c.id === carId)
  const getUserInfo = (userId: string) => users.find(u => u.id === userId)

  const statusConfig: Record<string, { label: string; cls: string }> = {
    pending_payment: { label: '待支付', cls: 'badge-warning' },
    paid: { label: '已支付', cls: 'badge-info' },
    renting: { label: '租赁中', cls: 'badge-success' },
    returned: { label: '已还车', cls: 'badge-muted' },
    cancelled: { label: '已取消', cls: 'badge-muted' },
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📋 订单管理</h1>
        <select className="form-select" style={{ width: 150 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">全部状态</option>
          <option value="pending_payment">待支付</option>
          <option value="paid">已支付</option>
          <option value="renting">租赁中</option>
          <option value="returned">已还车</option>
          <option value="cancelled">已取消</option>
        </select>
      </div>

      <div className="table-wrap card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr><th>订单编号</th><th>用户</th><th>车辆</th><th>租期</th><th>天数</th><th>金额</th><th>押金</th><th>状态</th><th>操作</th></tr>
          </thead>
          <tbody>
            {filtered.map(o => {
              const car = getCarInfo(o.carId)
              const user = getUserInfo(o.userId)
              const sc = statusConfig[o.status]
              return (
                <tr key={o.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{o.id}</td>
                  <td>{user?.name ?? '未知'}<br /><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user?.phone}</span></td>
                  <td>{car ? `${getBrandName(car.brandId)} ${car.name}` : '已删除'}<br /><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{car?.plateNumber}</span></td>
                  <td style={{ fontSize: 12 }}>{o.startDate}<br />~ {o.endDate}</td>
                  <td>{o.days}天</td>
                  <td style={{ fontWeight: 600, color: 'var(--danger)' }}>¥{o.totalPrice}</td>
                  <td>¥{o.deposit}</td>
                  <td><span className={`badge ${sc.cls}`}>{sc.label}</span></td>
                  <td>
                    {(o.status === 'pending_payment' || o.status === 'paid') && (
                      <button className="btn btn-danger btn-sm"
                        onClick={() => { if (confirm('确定强制取消此订单？')) adminCancelOrder(o.id) }}>
                        取消
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>暂无订单</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
