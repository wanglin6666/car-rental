import { useState } from 'react'
import { useStore } from '../../store/useStore'
import dayjs from 'dayjs'

export default function ReturnManage() {
  const { orders, cars, users, returnRecords, confirmReturn, getBrandName } = useStore()
  const [msg, setMsg] = useState('')
  const [returningOrderId, setReturningOrderId] = useState<string | null>(null)

  // Return form state
  const [actualReturnTime, setActualReturnTime] = useState(dayjs().format('YYYY-MM-DDTHH:mm'))
  const [damageFee, setDamageFee] = useState(0)
  const [remark, setRemark] = useState('')

  // Orders that can be returned: paid or renting
  const returnableOrders = orders.filter(o => o.status === 'paid' || o.status === 'renting')

  const getCarInfo = (carId: string) => cars.find(c => c.id === carId)
  const getUserInfo = (userId: string) => users.find(u => u.id === userId)

  const calculateOverdue = (order: typeof orders[0]) => {
    const actual = dayjs(actualReturnTime)
    const planned = dayjs(order.endDate)
    if (actual.isAfter(planned, 'day')) {
      const overdueDays = actual.diff(planned, 'day')
      return { isOverdue: true, overdueDays, overdueFee: overdueDays * Math.ceil(order.totalPrice / order.days) * 1.5 }
    }
    return { isOverdue: false, overdueDays: 0, overdueFee: 0 }
  }

  const handleConfirmReturn = () => {
    if (!returningOrderId) return
    const order = orders.find(o => o.id === returningOrderId)
    if (!order) return

    const { isOverdue, overdueDays, overdueFee } = calculateOverdue(order)
    const finalSettlement = order.deposit - overdueFee - damageFee

    confirmReturn(returningOrderId, {
      actualReturnTime: new Date(actualReturnTime).toISOString(),
      isOverdue, overdueDays, overdueFee, damageFee,
      finalSettlement, remark,
    })
    setMsg('还车确认成功')
    setReturningOrderId(null)
    setActualReturnTime(dayjs().format('YYYY-MM-DDTHH:mm'))
    setDamageFee(0)
    setRemark('')
    setTimeout(() => setMsg(''), 2000)
  }

  const orderForReturn = returningOrderId ? orders.find(o => o.id === returningOrderId) : null
  const overdue = orderForReturn ? calculateOverdue(orderForReturn) : null

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">🔄 还车管理</h1>
      </div>

      {msg && <div className="toast toast-success">{msg}</div>}

      {/* Return form modal */}
      {orderForReturn && (
        <div className="card" style={{ marginBottom: 20, border: '2px solid var(--primary)' }}>
          <h3 style={{ marginBottom: 16 }}>📝 确认还车 — {getBrandName(orderForReturn.carId)} {getCarInfo(orderForReturn.carId)?.name}</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
            <div>
              <label className="form-label">租赁期间</label>
              <input className="form-input" disabled value={`${orderForReturn.startDate} ~ ${orderForReturn.endDate}（${orderForReturn.days}天）`} />
            </div>
            <div>
              <label className="form-label">实际还车时间 *</label>
              <input className="form-input" type="datetime-local" value={actualReturnTime}
                onChange={e => setActualReturnTime(e.target.value)} />
            </div>
            <div>
              <label className="form-label">车辆损坏费 (元)</label>
              <input className="form-input" type="number" min="0" value={damageFee}
                onChange={e => setDamageFee(Number(e.target.value))} />
            </div>
            <div>
              <label className="form-label">备注</label>
              <input className="form-input" placeholder="还车备注" value={remark}
                onChange={e => setRemark(e.target.value)} />
            </div>
          </div>

          {overdue && (
            <div className="order-summary" style={{ marginTop: 16 }}>
              <div className="order-summary-row">
                <span>押金</span><span>¥{orderForReturn.deposit}</span>
              </div>
              <div className="order-summary-row">
                <span>逾期情况</span>
                <span style={{ color: overdue.isOverdue ? 'var(--danger)' : 'var(--success)' }}>
                  {overdue.isOverdue ? `逾期 ${overdue.overdueDays} 天` : '按时还车'}
                </span>
              </div>
              {overdue.isOverdue && (
                <div className="order-summary-row">
                  <span>逾期费（日租×1.5倍×逾期天数）</span>
                  <span style={{ color: 'var(--danger)' }}>¥{overdue.overdueFee}</span>
                </div>
              )}
              <div className="order-summary-row">
                <span>损坏费</span>
                <span style={{ color: damageFee > 0 ? 'var(--danger)' : '' }}>¥{damageFee}</span>
              </div>
              <div className="order-summary-total" style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>最终结算（押金 - 逾期费 - 损坏费）</span>
                <span style={{ color: orderForReturn.deposit - overdue.overdueFee - damageFee >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                  ¥{orderForReturn.deposit - overdue.overdueFee - damageFee}
                </span>
              </div>
            </div>
          )}

          <div style={{ marginTop: 16, display: 'flex', gap: 12 }}>
            <button className="btn btn-success" onClick={handleConfirmReturn}>确认还车</button>
            <button className="btn btn-outline" onClick={() => setReturningOrderId(null)}>取消</button>
          </div>
        </div>
      )}

      {/* Returnable orders */}
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>
        待还车订单（{returnableOrders.length}）
      </h3>
      <div className="table-wrap card" style={{ padding: 0, marginBottom: 24 }}>
        <table>
          <thead>
            <tr><th>订单编号</th><th>用户</th><th>车辆</th><th>租期</th><th>金额</th><th>状态</th><th>操作</th></tr>
          </thead>
          <tbody>
            {returnableOrders.map(o => {
              const car = getCarInfo(o.carId)
              const user = getUserInfo(o.userId)
              return (
                <tr key={o.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{o.id}</td>
                  <td>{user?.name ?? '未知'}</td>
                  <td>{car ? `${getBrandName(car.brandId)} ${car.name} (${car.plateNumber})` : '已删除'}</td>
                  <td style={{ fontSize: 12 }}>{o.startDate} ~ {o.endDate}</td>
                  <td style={{ fontWeight: 600, color: 'var(--danger)' }}>¥{o.totalPrice}</td>
                  <td>
                    {o.status === 'paid' && <span className="badge badge-info">已支付</span>}
                    {o.status === 'renting' && <span className="badge badge-success">租赁中</span>}
                  </td>
                  <td>
                    <button className="btn btn-primary btn-sm" onClick={() => {
                      setReturningOrderId(o.id)
                      setActualReturnTime(dayjs().format('YYYY-MM-DDTHH:mm'))
                      setDamageFee(0)
                      setRemark('')
                    }}>确认还车</button>
                  </td>
                </tr>
              )
            })}
            {returnableOrders.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>暂无待还车订单</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Return history */}
      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>还车记录</h3>
      <div className="table-wrap card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr><th>订单编号</th><th>车辆</th><th>实际还车</th><th>逾期</th><th>逾期费</th><th>损坏费</th><th>结算</th><th>备注</th></tr>
          </thead>
          <tbody>
            {[...returnRecords].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(r => {
              const car = getCarInfo(r.carId)
              const order = orders.find(o => o.id === r.orderId)
              return (
                <tr key={r.id}>
                  <td style={{ fontFamily: 'monospace', fontSize: 11 }}>{r.orderId}</td>
                  <td>{car ? `${car.name} (${car.plateNumber})` : '已删除'}</td>
                  <td style={{ fontSize: 12 }}>{dayjs(r.actualReturnTime).format('YYYY-MM-DD HH:mm')}</td>
                  <td>{r.isOverdue ? <span className="badge badge-danger">逾期{r.overdueDays}天</span> : <span className="badge badge-success">按时</span>}</td>
                  <td style={{ color: r.overdueFee > 0 ? 'var(--danger)' : '' }}>¥{r.overdueFee}</td>
                  <td style={{ color: r.damageFee > 0 ? 'var(--danger)' : '' }}>¥{r.damageFee}</td>
                  <td style={{ fontWeight: 600, color: r.finalSettlement >= 0 ? 'var(--success)' : 'var(--danger)' }}>¥{r.finalSettlement}</td>
                  <td style={{ fontSize: 12, maxWidth: 120 }}>{r.remark || '-'}</td>
                </tr>
              )
            })}
            {returnRecords.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>暂无还车记录</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
