import { useStore } from '../../store/useStore'
import dayjs from 'dayjs'

export default function Returns() {
  const { currentUser, returnRecords, orders, cars, getBrandName } = useStore()

  if (!currentUser) return null

  const myReturns = returnRecords
    .filter(r => r.userId === currentUser.id)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(r => {
      const order = orders.find(o => o.id === r.orderId)
      const car = order ? cars.find(c => c.id === order.carId) : undefined
      return { ...r, order, car }
    })

  return (
    <div className="container" style={{ marginTop: 24, marginBottom: 40 }}>
      <div className="page-header">
        <h1 className="page-title">还车记录</h1>
      </div>

      {myReturns.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <p style={{ fontSize: 48, marginBottom: 12 }}>🔄</p>
          <p>还没有还车记录</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>车辆信息</th>
                <th>租赁期间</th>
                <th>实际还车时间</th>
                <th>逾期情况</th>
                <th>逾期费</th>
                <th>损坏费</th>
                <th>押金</th>
                <th>最终结算</th>
                <th>备注</th>
              </tr>
            </thead>
            <tbody>
              {myReturns.map(r => {
                const deposit = r.order?.deposit ?? 0
                return (
                  <tr key={r.id}>
                    <td>
                      <strong>{r.car?.name ?? '未知'}</strong>
                      <br />
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        {r.car ? `${getBrandName(r.car.brandId)} · ${r.car.plateNumber}` : ''}
                      </span>
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {r.order ? `${r.order.startDate} ~ ${r.order.endDate}` : '-'}
                    </td>
                    <td>{dayjs(r.actualReturnTime).format('YYYY-MM-DD HH:mm')}</td>
                    <td>
                      {r.isOverdue ? (
                        <span className="badge badge-danger">逾期{r.overdueDays}天</span>
                      ) : (
                        <span className="badge badge-success">按时还车</span>
                      )}
                    </td>
                    <td style={{ color: r.overdueFee > 0 ? 'var(--danger)' : '' }}>
                      ¥{r.overdueFee}
                    </td>
                    <td style={{ color: r.damageFee > 0 ? 'var(--danger)' : '' }}>
                      ¥{r.damageFee}
                    </td>
                    <td>¥{deposit}</td>
                    <td>
                      <strong style={{ color: r.finalSettlement >= 0 ? 'var(--success)' : 'var(--danger)' }}>
                        ¥{r.finalSettlement}
                      </strong>
                      {r.finalSettlement < 0 && <span style={{ fontSize: 11, color: 'var(--danger)' }}>（需补缴）</span>}
                    </td>
                    <td style={{ fontSize: 13, maxWidth: 150 }}>{r.remark || '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
