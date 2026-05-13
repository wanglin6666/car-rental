import { useState } from 'react'
import { useStore } from '../../store/useStore'

export default function ContentManage() {
  const {
    carousels, addCarousel, updateCarousel, deleteCarousel,
    announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement,
    favorites, users, cars, getBrandName,
  } = useStore()

  const [tab, setTab] = useState<'carousel' | 'announcement' | 'favorites'>('carousel')

  // Carousel form
  const [showCarouselForm, setShowCarouselForm] = useState(false)
  const [carouselForm, setCarouselForm] = useState({ id: '', image: '', link: '', sort: 1, isActive: true })

  // Announcement form
  const [showAnnForm, setShowAnnForm] = useState(false)
  const [annForm, setAnnForm] = useState({ id: '', title: '', content: '' })

  const handleSaveCarousel = () => {
    if (!carouselForm.image.trim()) return
    if (carouselForm.id) {
      updateCarousel(carouselForm.id, carouselForm)
    } else {
      addCarousel(carouselForm)
    }
    setShowCarouselForm(false)
    setCarouselForm({ id: '', image: '', link: '', sort: 1, isActive: true })
  }

  const handleEditCarousel = (id: string) => {
    const c = carousels.find(x => x.id === id)
    if (!c) return
    setCarouselForm({ ...c })
    setShowCarouselForm(true)
  }

  const handleSaveAnnouncement = () => {
    if (!annForm.title.trim() || !annForm.content.trim()) return
    if (annForm.id) {
      updateAnnouncement(annForm.id, annForm)
    } else {
      addAnnouncement(annForm.title, annForm.content)
    }
    setShowAnnForm(false)
    setAnnForm({ id: '', title: '', content: '' })
  }

  const handleEditAnnouncement = (id: string) => {
    const a = announcements.find(x => x.id === id)
    if (!a) return
    setAnnForm({ id: a.id, title: a.title, content: a.content })
    setShowAnnForm(true)
  }

  // Favorites stats
  const favStats = cars.map(car => {
    const count = favorites.filter(f => f.carId === car.id).length
    return { car, count }
  }).filter(s => s.count > 0).sort((a, b) => b.count - a.count)

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">📢 内容管理</h1>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {(['carousel', 'announcement', 'favorites'] as const).map(t => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-outline'} btn-sm`}
            onClick={() => setTab(t)}>
            {t === 'carousel' ? '🖼️ 轮播图' : t === 'announcement' ? '📢 系统公告' : '❤️ 收藏统计'}
          </button>
        ))}
      </div>

      {/* === CAROUSEL === */}
      {tab === 'carousel' && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <button className="btn btn-primary btn-sm" onClick={() => {
              setCarouselForm({ id: '', image: '', link: '', sort: 1, isActive: true })
              setShowCarouselForm(!showCarouselForm)
            }}>
              {showCarouselForm ? '取消' : '+ 添加轮播图'}
            </button>
          </div>

          {showCarouselForm && (
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <div style={{ flex: '2 1 250px' }}>
                  <label className="form-label">图片URL *</label>
                  <input className="form-input" placeholder="https://..." value={carouselForm.image}
                    onChange={e => setCarouselForm(p => ({ ...p, image: e.target.value }))} />
                </div>
                <div style={{ flex: '1 1 150px' }}>
                  <label className="form-label">跳转链接</label>
                  <input className="form-input" placeholder="/cars" value={carouselForm.link}
                    onChange={e => setCarouselForm(p => ({ ...p, link: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">排序</label>
                  <input className="form-input" type="number" style={{ width: 70 }} value={carouselForm.sort}
                    onChange={e => setCarouselForm(p => ({ ...p, sort: Number(e.target.value) }))} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="checkbox" checked={carouselForm.isActive}
                    onChange={e => setCarouselForm(p => ({ ...p, isActive: e.target.checked }))} />
                  <label className="form-label" style={{ margin: 0 }}>启用</label>
                </div>
                <button className="btn btn-primary btn-sm" onClick={handleSaveCarousel}>
                  {carouselForm.id ? '保存' : '添加'}
                </button>
              </div>
            </div>
          )}

          <div className="table-wrap card" style={{ padding: 0 }}>
            <table>
              <thead><tr><th>预览</th><th>链接</th><th>排序</th><th>状态</th><th>操作</th></tr></thead>
              <tbody>
                {[...carousels].sort((a, b) => a.sort - b.sort).map(c => (
                  <tr key={c.id}>
                    <td><img src={c.image} alt="" style={{ width: 120, height: 50, objectFit: 'cover', borderRadius: 4 }} /></td>
                    <td style={{ fontSize: 13 }}>{c.link}</td>
                    <td>{c.sort}</td>
                    <td>{c.isActive ? <span className="badge badge-success">启用</span> : <span className="badge badge-muted">禁用</span>}</td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => handleEditCarousel(c.id)}>编辑</button>
                      <button className="btn btn-danger btn-sm" style={{ marginLeft: 8 }}
                        onClick={() => { if (confirm('确定删除？')) deleteCarousel(c.id) }}>删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === ANNOUNCEMENTS === */}
      {tab === 'announcement' && (
        <div>
          <div style={{ marginBottom: 16 }}>
            <button className="btn btn-primary btn-sm" onClick={() => {
              setAnnForm({ id: '', title: '', content: '' })
              setShowAnnForm(!showAnnForm)
            }}>
              {showAnnForm ? '取消' : '+ 发布公告'}
            </button>
          </div>

          {showAnnForm && (
            <div className="card" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">公告标题</label>
                <input className="form-input" placeholder="公告标题" value={annForm.title}
                  onChange={e => setAnnForm(p => ({ ...p, title: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">公告内容</label>
                <textarea className="form-textarea" placeholder="公告内容..." value={annForm.content}
                  onChange={e => setAnnForm(p => ({ ...p, content: e.target.value }))} />
              </div>
              <button className="btn btn-primary btn-sm" onClick={handleSaveAnnouncement}>
                {annForm.id ? '保存' : '发布'}
              </button>
            </div>
          )}

          <div className="table-wrap card" style={{ padding: 0 }}>
            <table>
              <thead><tr><th>标题</th><th>内容</th><th>状态</th><th>发布时间</th><th>操作</th></tr></thead>
              <tbody>
                {announcements.map(a => (
                  <tr key={a.id}>
                    <td style={{ fontWeight: 600 }}>{a.title}</td>
                    <td style={{ fontSize: 13, maxWidth: 300 }}>{a.content}</td>
                    <td>{a.isActive ? <span className="badge badge-success">显示中</span> : <span className="badge badge-muted">已隐藏</span>}</td>
                    <td style={{ fontSize: 12 }}>{new Date(a.createdAt).toLocaleString('zh-CN')}</td>
                    <td>
                      <button className="btn btn-outline btn-sm" onClick={() => {
                        updateAnnouncement(a.id, { isActive: !a.isActive })
                      }}>{a.isActive ? '隐藏' : '显示'}</button>
                      <button className="btn btn-outline btn-sm" style={{ marginLeft: 4 }} onClick={() => handleEditAnnouncement(a.id)}>编辑</button>
                      <button className="btn btn-danger btn-sm" style={{ marginLeft: 4 }}
                        onClick={() => { if (confirm('确定删除？')) deleteAnnouncement(a.id) }}>删除</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* === FAVORITES STATS === */}
      {tab === 'favorites' && (
        <div className="table-wrap card" style={{ padding: 0 }}>
          <table>
            <thead><tr><th>车辆</th><th>品牌</th><th>车牌号</th><th>日租价格</th><th>收藏人数</th></tr></thead>
            <tbody>
              {favStats.map(({ car, count }) => (
                <tr key={car.id}>
                  <td style={{ fontWeight: 600 }}>{car.name}</td>
                  <td>{getBrandName(car.brandId)}</td>
                  <td>{car.plateNumber}</td>
                  <td style={{ color: 'var(--danger)', fontWeight: 600 }}>¥{car.dailyPrice}</td>
                  <td><span className="badge badge-info">❤️ {count}人</span></td>
                </tr>
              ))}
              {favStats.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>暂无收藏数据</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
