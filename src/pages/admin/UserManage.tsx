import { useStore } from '../../store/useStore'

export default function UserManage() {
  const { users, orders, returnRecords } = useStore()

  const getUserStats = (userId: string) => ({
    orderCount: orders.filter(o => o.userId === userId).length,
    returnCount: returnRecords.filter(r => r.userId === userId).length,
  })

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">👥 用户管理</h1>
      </div>

      <div className="table-wrap card" style={{ padding: 0 }}>
        <table>
          <thead>
            <tr><th>姓名</th><th>手机号</th><th>邮箱</th><th>订单数</th><th>还车次数</th><th>注册时间</th></tr>
          </thead>
          <tbody>
            {users.map(u => {
              const stats = getUserStats(u.id)
              return (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td>{u.phone}</td>
                  <td>{u.email}</td>
                  <td>{stats.orderCount}</td>
                  <td>{stats.returnCount}</td>
                  <td style={{ fontSize: 13 }}>{new Date(u.createdAt).toLocaleDateString('zh-CN')}</td>
                </tr>
              )
            })}
            {users.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>暂无注册用户</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
