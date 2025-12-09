import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import ParticleBackground from './components/ParticleBackground'
import BioTimeline from './components/BioTimeline'
import MemoryCapsule from './components/MemoryCapsule'
import GrowthMilestone from './components/GrowthMilestone'
import './index.css'
import ImageUploader from './admin/components/ImageUploader'


// 图片接口定义
interface ImageItem {
  id: string
  src: string
  alt: string
  file?: File
  filter?: string
}

// 时间轴事件接口定义
export interface TimelineEvent {
  id: string
  date: string
  title: string
  content: string
  tags: string[]
  isHighlight?: boolean
  images: ImageItem[]
}

// 管理员密码（实际项目中应该使用更安全的认证方式）
const ADMIN_PASSWORD = 'yaoyao2024'

// 美化：增加页面加载时的渐入动画
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

// 家庭重要时刻 - 按时间顺序排列
const initialEvents: TimelineEvent[] = [
  {
    id: '1',
    date: '2014-09-30',
    title: '我们牵手了 💕',
    content: '那个秋天，我们决定一起走下去，从此有了彼此的陪伴。',
    tags: ['爱情', '开始'],
    images: []
  },
  {
    id: '2',
    date: '2017-11-07',
    title: '领证结婚 💍',
    content: '在民政局，我们正式成为了一家人，从恋人变成了夫妻。',
    tags: ['婚姻', '承诺'],
    images: []
  },
  {
    id: '3',
    date: '2018-10-05',
    title: '婚礼庆典 🎉',
    content: '在亲朋好友的见证下，我们举办了温馨的婚礼，许下永恒的誓言。',
    tags: ['婚礼', '庆祝'],
    images: []
  },
  {
    id: '4',
    date: '2024-03-27',
    title: '我们的宝贝降临 💜',
    content: '欢迎来到这个世界，小天使！那一刻，我们的世界被温柔点亮，生命中最重要的时刻。',
    tags: ['起点', '诞生', '奇迹'],
    isHighlight: true,
    images: []
  },
  {
    id: '5',
    date: '2024-07-05',
    title: '宝宝100天纪念 🎂',
    content: '小宝贝已经100天了！从最初的小小一团，到现在会笑会闹，每一天都是惊喜。',
    tags: ['成长', '纪念日'],
    images: []
  },
  {
    id: '6',
    date: '2025-03-27',
    title: '宝宝一周岁生日 🎈',
    content: '我们的小天使一岁了！从爬到走，从咿呀学语到叫爸爸妈妈，这一年 记住了太多美好。',
    tags: ['生日', '里程碑'],
    isHighlight: true,
    images: []
  },
]

const INITIAL_EVENT_STATE = {
  date: '',
  title: '',
  content: '',
  tags: '',
  isHighlight: false,
  images: [] as ImageItem[]
}

function AuthModal({
  isOpen, 
  onClose, 
  onAuth 
}: { 
  isOpen: boolean
  onClose: () => void
  onAuth: () => void 
}) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      onAuth()
      setPassword('')
      setError('')
      onClose()
    } else {
      setError('密码错误，请重试')
      setPassword('')
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="auth-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="auth-modal-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>身份验证</h3>
            <p>请输入管理员密码以上传照片</p>
            <form onSubmit={handleSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="auth-input"
                autoFocus
              />
              {error && <div className="auth-error">{error}</div>}
              <div className="auth-buttons">
                <button type="button" onClick={onClose} className="auth-cancel">
                  取消
                </button>
                <button type="submit" className="auth-submit">
                  确认
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default function App() {
  const [events, setEvents] = useState<TimelineEvent[]>(initialEvents)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [showAddEventForm, setShowAddEventForm] = useState(false)
  const [newEvent, setNewEvent] = useState(() => ({ ...INITIAL_EVENT_STATE }))
  const [newImageLink, setNewImageLink] = useState('')
  const [sortBy, setSortBy] = useState<'asc' | 'desc'>('asc')
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'timeline' | 'capsule' | 'milestone'>('timeline')
  const logoutTimer = useRef<number | null>(null)

  const clearLogoutTimer = () => {
    if (logoutTimer.current) {
      window.clearTimeout(logoutTimer.current)
      logoutTimer.current = null
    }
  }

  useEffect(() => {
    return () => {
      clearLogoutTimer()
    }
  }, [])

  const resetNewEvent = () => {
    setNewEvent({ ...INITIAL_EVENT_STATE })
    setNewImageLink('')
  }

  const handleLogout = () => {
    clearLogoutTimer()
    setIsAuthenticated(false)
    setIsAuthModalOpen(false)
    setShowAddEventForm(false)
    setEditingEventId(null)
    resetNewEvent()
  }

  const handleAddImageLink = (e: React.MouseEvent) => {
    e.preventDefault()
    if (!newImageLink.trim()) return

    const newImage: ImageItem = {
      id: Date.now().toString(),
      src: newImageLink,
      alt: '事件图片'
    }

    setNewEvent({
      ...newEvent,
      images: [...newEvent.images, newImage]
    })
    setNewImageLink('')
  }

  const removeNewEventImage = (imageId: string) => {
    setNewEvent({
      ...newEvent,
      images: newEvent.images.filter(img => img.id !== imageId)
    })
  }

  const handleImageDelete = (eventId: string, imageId: string) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === eventId 
          ? { ...event, images: event.images.filter(img => img.id !== imageId) }
          : event
      )
    )
  }

  const handleAuth = () => {
    clearLogoutTimer()
    setIsAuthenticated(true)
    setIsAuthModalOpen(false)
    // 在实际应用中，这里应该设置一个过期时间
    logoutTimer.current = window.setTimeout(() => {
      setIsAuthenticated(false)
      setShowAddEventForm(false)
      setEditingEventId(null)
      resetNewEvent()
    }, 30 * 60 * 1000) // 30分钟后自动退出
  }

  const handleAddEvent = () => {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true)
      return
    }
    if (!newEvent.date || !newEvent.title || !newEvent.content) return

    const sanitizedTags = newEvent.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag)

    const event: TimelineEvent = {
      id: editingEventId || Date.now().toString(),
      date: newEvent.date,
      title: newEvent.title,
      content: newEvent.content,
      tags: sanitizedTags,
      isHighlight: newEvent.isHighlight,
      images: newEvent.images
    }
    
    if (editingEventId) {
      // Update existing event
      setEvents(prevEvents => 
        prevEvents.map(e => e.id === editingEventId ? event : e)
      )
    } else {
      // Add new event
      setEvents(prevEvents => [...prevEvents, event])
    }
    
    resetNewEvent()
    setEditingEventId(null)
    setShowAddEventForm(false)
  }

  const handleDeleteEvent = (eventId: string) => {
    setEvents(prevEvents => prevEvents.filter(event => event.id !== eventId))
  }

  const handleEditEvent = (event: TimelineEvent) => {
    setNewEvent({
      date: event.date,
      title: event.title,
      content: event.content,
      tags: event.tags.join(', '),
      isHighlight: !!event.isHighlight,
      images: event.images || []
    })
    setEditingEventId(event.id)
    setShowAddEventForm(true)
    setActiveTab('timeline')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const dateA = new Date(a.date).getTime()
      const dateB = new Date(b.date).getTime()
      return sortBy === 'asc' ? dateA - dateB : dateB - dateA
    })
  }, [events, sortBy])

  const filteredEvents = useMemo(() => {
    const term = searchTerm.trim().toLowerCase()
    return sortedEvents.filter(event => {
      if (term) {
        const matchesSearch =
          event.title.toLowerCase().includes(term) ||
          event.content.toLowerCase().includes(term) ||
          event.tags.some(tag => tag.toLowerCase().includes(term))
        if (!matchesSearch) return false
      }

      if (selectedTag && !event.tags.includes(selectedTag)) {
        return false
      }

      return true
    })
  }, [sortedEvents, searchTerm, selectedTag])

  // Get all unique tags
  const allTags = useMemo(() => {
    return Array.from(new Set(events.flatMap(event => event.tags))).sort()
  }, [events])

  const handleCancelForm = () => {
    setShowAddEventForm(false)
    setEditingEventId(null)
    resetNewEvent()
  }

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageVariants}
      transition={{ duration: 0.5 }}
      className="min-h-screen relative text-slate-100 overflow-x-hidden"
    >
      <ParticleBackground />

      {/* 顶部导航栏 - 毛玻璃效果 */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-slate-900/40 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 cursor-pointer"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
                setActiveTab('timeline')
              }}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
                <span className="text-lg">👶</span>
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 via-pink-200 to-blue-200 font-display tracking-tight">
                Yaoyao's Time
              </span>
            </motion.div>
            
            {/* 桌面端导航 */}
            <div className="hidden md:flex items-center gap-1">
              {[
                { id: 'timeline', label: '时间轴', icon: '📅' },
                { id: 'capsule', label: '时光胶囊', icon: '💊' },
                { id: 'milestone', label: '成长里程碑', icon: '🏆' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeTab === item.id 
                      ? 'text-white shadow-[0_0_20px_rgba(168,85,247,0.4)]' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {activeTab === item.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-purple-600/80 to-pink-600/80 rounded-full -z-10 backdrop-blur-sm"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="flex items-center gap-2">
                    <span>{item.icon}</span>
                    {item.label}
                  </span>
                </button>
              ))}

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => isAuthenticated ? handleLogout() : setIsAuthModalOpen(true)}
                className={`ml-4 px-4 py-2 rounded-full text-xs font-medium border transition-all duration-300 flex items-center gap-2 ${
                  isAuthenticated 
                    ? 'bg-red-500/20 border-red-500/50 text-red-200 hover:bg-red-500/30' 
                    : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-white'
                }`}
              >
                {isAuthenticated ? '🔒 退出管理' : '🔑 管理员'}
              </motion.button>
            </div>

            {/* 移动端菜单按钮 (保留但未实现完整逻辑，暂用简单的) */}
            <div className="md:hidden">
               {/* 简化的移动端菜单触发器 */}
            </div>
          </div>
        </div>
      </nav>

      {/* 内容区域 - 增加顶部内边距以避开固定导航栏 */}
      <main className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[calc(100vh-4rem)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {activeTab === 'timeline' && (
              <div className="space-y-8">
                 {/* 排序和搜索控件 */}
                 <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="flex gap-2">
                      <button 
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${sortBy === 'asc' ? 'bg-purple-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
                        onClick={() => setSortBy('asc')}
                      >
                        时间正序
                      </button>
                      <button 
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${sortBy === 'desc' ? 'bg-purple-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
                        onClick={() => setSortBy('desc')}
                      >
                        时间倒序
                      </button>
                    </div>
                    
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                      <button 
                        className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${!selectedTag ? 'bg-purple-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
                        onClick={() => setSelectedTag(null)}
                      >
                        全部
                      </button>
                      {allTags.map(tag => (
                        <button
                          key={tag}
                          className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors ${selectedTag === tag ? 'bg-purple-600 text-white' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}
                          onClick={() => setSelectedTag(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    <div className="relative w-full md:w-64">
                      <input
                        type="text"
                        placeholder="搜索事件..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                    </div>
                 </div>

                 {/* 管理员添加按钮 */}
                 {isAuthenticated && !showAddEventForm && (
                   <motion.button
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     onClick={() => setShowAddEventForm(true)}
                     className="w-full py-4 rounded-xl border-2 border-dashed border-white/20 text-slate-400 hover:text-white hover:border-purple-500/50 hover:bg-purple-500/5 transition-all flex items-center justify-center gap-2"
                   >
                     <span className="text-xl">+</span> 添加新美好时刻
                   </motion.button>
                 )}

                 {/* 添加/编辑事件表单 */}
                 <AnimatePresence>
                  {showAddEventForm && (
                    <motion.div
                      className="bg-slate-800/80 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl overflow-hidden"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3 className="text-xl font-bold mb-6 text-white">{editingEventId ? '编辑事件' : '添加新事件'}</h3>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">日期</label>
                            <input
                              type="date"
                              value={newEvent.date}
                              onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">标题</label>
                            <input
                              type="text"
                              value={newEvent.title}
                              onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                              placeholder="请输入事件标题"
                              className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">内容</label>
                          <textarea
                            value={newEvent.content}
                            onChange={(e) => setNewEvent({...newEvent, content: e.target.value})}
                            placeholder="请输入事件内容"
                            rows={4}
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 resize-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-400 mb-1">标签 (用逗号分隔)</label>
                          <input
                            type="text"
                            value={newEvent.tags}
                            onChange={(e) => setNewEvent({...newEvent, tags: e.target.value})}
                            placeholder="例如: 纪念日, 旅行, 节日"
                            className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                          />
                        </div>

                        <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={newEvent.isHighlight}
                            onChange={(e) => setNewEvent({...newEvent, isHighlight: e.target.checked})}
                            className="w-4 h-4 rounded border-white/20 bg-black/20 text-purple-600 focus:ring-purple-500"
                          />
                          设为重要时刻 (高亮显示)
                        </label>

                        <div className="border-t border-white/10 pt-4 mt-4">
                          <label className="block text-sm font-medium text-slate-400 mb-2">图片</label>
                          
                          <div className="flex gap-2 mb-4">
                            <input
                              type="text"
                              value={newImageLink}
                              onChange={(e) => setNewImageLink(e.target.value)}
                              placeholder="输入图片 URL"
                              className="flex-1 bg-black/20 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500"
                            />
                            <button onClick={handleAddImageLink} type="button" className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
                              添加链接
                            </button>
                          </div>

                          {isAuthenticated && (
                            <div className="mb-4">
                              <ImageUploader
                                onCompleted={(results) => {
                                  const uploadedImages = results.map(r => ({ id: Date.now().toString() + Math.random(), src: r.url, alt: '事件图片' }))
                                  setNewEvent(prev => ({ ...prev, images: [...prev.images, ...uploadedImages] }))
                                }}
                              />
                            </div>
                          )}

                          {newEvent.images.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                              {newEvent.images.map(img => (
                                <div key={img.id} className="relative group aspect-video rounded-lg overflow-hidden bg-black/40">
                                  <img src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                                  <button 
                                    type="button" 
                                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={() => removeNewEventImage(img.id)}
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                          <button className="px-6 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5 transition-colors" onClick={handleCancelForm}>
                            取消
                          </button>
                          <button className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 transition-all" onClick={handleAddEvent}>
                            {editingEventId ? '更新事件' : '发布事件'}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                 </AnimatePresence>

                <BioTimeline 
                  events={filteredEvents}
                  isAuthenticated={isAuthenticated}
                  onImageDelete={handleImageDelete}
                  onEdit={handleEditEvent}
                  onDelete={handleDeleteEvent}
                />
              </div>
            )}
            
            {activeTab === 'capsule' && (
              <div className="space-y-8">
                 <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-2xl p-8 border border-white/5 text-center">
                    <h2 className="text-2xl font-bold mb-2">时光胶囊</h2>
                    <p className="text-slate-400">封存珍贵的记忆瞬间</p>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <MemoryCapsule 
                      title="第一次微笑"
                      date="2024-04-15"
                      content="宝宝今天第一次对我们露出了甜甜的微笑，那一刻我的心都融化了。"
                      images={[
                        { id: '1', src: 'https://placehold.co/300x200/9D4EDD/FFFFFF?text=Smile+1', alt: '宝宝微笑1' },
                        { id: '2', src: 'https://placehold.co/300x200/FF9E00/FFFFFF?text=Smile+2', alt: '宝宝微笑2' }
                      ]}
                      isAuthenticated={isAuthenticated}
                    />
                    <MemoryCapsule 
                      title="第一次翻身"
                      date="2024-06-20"
                      content="宝宝今天成功地翻了个身，从趴着变成了仰卧，进步真大！"
                      images={[
                        { id: '3', src: 'https://placehold.co/300x200/FFB6C1/0B132B?text=Roll+Over', alt: '宝宝翻身' }
                      ]}
                      isAuthenticated={isAuthenticated}
                    />
                    <MemoryCapsule 
                      title="第一次叫妈妈"
                      date="2024-10-10"
                      content="宝宝今天清晰地叫出了一声'妈妈'，激动得我眼泪都出来了。"
                      images={[
                        { id: '4', src: 'https://placehold.co/300x200/0B132B/9D4EDD?text=First+Word', alt: '宝宝说话' }
                      ]}
                      isAuthenticated={isAuthenticated}
                    />
                 </div>
              </div>
            )}

            {activeTab === 'milestone' && (
              <div className="space-y-8">
                <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 rounded-2xl p-8 border border-white/5 text-center">
                    <h2 className="text-2xl font-bold mb-2">成长里程碑</h2>
                    <p className="text-slate-400">记录每一个成长的脚印</p>
                 </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <GrowthMilestone 
                    title="身高成长"
                    currentValue={75}
                    targetValue={85}
                    unit="cm"
                    color="#9D4EDD"
                    icon="📏"
                  />
                  <GrowthMilestone 
                    title="体重增长"
                    currentValue={9.5}
                    targetValue={12}
                    unit="kg"
                    color="#FF9E00"
                    icon="⚖️"
                  />
                  <GrowthMilestone 
                    title="语言发展"
                    currentValue={25}
                    targetValue={50}
                    unit="词汇"
                    color="#FFB6C1"
                    icon="💬"
                  />
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 底部版权 */}
      <footer className="py-8 text-center text-slate-500 text-sm border-t border-white/5 bg-slate-900/20 backdrop-blur-sm">
        <p>© {new Date().getFullYear()} Yaoyao's Time. Built with ❤️ for our little angel.</p>
      </footer>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuth={handleAuth}
      />
    </motion.div>
  )
}
