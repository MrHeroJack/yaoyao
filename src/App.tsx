import { motion, AnimatePresence } from 'framer-motion'
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import BioTimeline from './components/BioTimeline'
import './index.css'
import { getAdminSession, loginAdmin, logoutAdmin } from './api/admin'

const MemoryCapsule = lazy(() => import('./components/MemoryCapsule'))
const GrowthMilestone = lazy(() => import('./components/GrowthMilestone'))
const ImageUploader = lazy(() => import('./admin/components/ImageUploader'))

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

// 美化：增加页面加载时的渐入动画
const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const TIMELINE_STORAGE_KEY = 'yaoyao.timeline.events.v1'

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

function isImageItem(value: unknown): value is ImageItem {
  return Boolean(
    value &&
    typeof value === 'object' &&
    typeof (value as ImageItem).id === 'string' &&
    typeof (value as ImageItem).src === 'string' &&
    typeof (value as ImageItem).alt === 'string',
  )
}

function isTimelineEvent(value: unknown): value is TimelineEvent {
  return Boolean(
    value &&
    typeof value === 'object' &&
    typeof (value as TimelineEvent).id === 'string' &&
    typeof (value as TimelineEvent).date === 'string' &&
    typeof (value as TimelineEvent).title === 'string' &&
    typeof (value as TimelineEvent).content === 'string' &&
    Array.isArray((value as TimelineEvent).tags) &&
    (value as TimelineEvent).tags.every((tag) => typeof tag === 'string') &&
    Array.isArray((value as TimelineEvent).images) &&
    (value as TimelineEvent).images.every(isImageItem),
  )
}

function loadPersistedEvents() {
  if (typeof window === 'undefined') return initialEvents
  const raw = window.localStorage.getItem(TIMELINE_STORAGE_KEY)
  if (!raw) return initialEvents
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.every(isTimelineEvent)) {
      return parsed
    }
  } catch {
    // Ignore corrupted local cache and use defaults.
  }
  return initialEvents
}

function AuthModal({
  isOpen, 
  onClose, 
  onAuth 
}: { 
  isOpen: boolean
  onClose: () => void
  onAuth: (password: string) => Promise<void> 
}) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      setError('请输入密码')
      return
    }
    try {
      setIsSubmitting(true)
      await onAuth(password)
      setError('')
      onClose()
      setPassword('')
    } catch (err) {
      setError((err as Error).message || '登录失败，请重试')
      setPassword('')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="z-card bg-white p-8 w-full max-w-md m-4 border-4 border-z-blue"
            initial={{ scale: 0.8, opacity: 0, rotate: -5 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", bounce: 0.5 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 text-6xl drop-shadow-lg">
              👮
            </div>
            <h3 className="text-3xl font-bold text-center mt-6 mb-2 text-z-blue">身份验证</h3>
            <p className="text-center text-slate-500 mb-6">请输入管理员密码以继续访问</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-z-blue focus:outline-none focus:ring-4 focus:ring-z-blue/20 text-lg"
                aria-label="管理员密码"
                autoFocus
              />
              {error && <div className="text-red-500 text-center font-bold bg-red-100 p-2 rounded-lg">{error}</div>}
              <div className="flex gap-3">
                <button 
                  type="button" 
                  onClick={onClose} 
                  className="flex-1 py-3 rounded-full border-2 border-slate-300 font-bold text-slate-500 hover:bg-slate-100 transition-colors"
                >
                  取消
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 py-3 rounded-full bg-z-blue text-white font-bold shadow-lg hover:bg-blue-600 transition-colors transform active:scale-95"
                >
                  {isSubmitting ? '验证中...' : '确认'}
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
  const [events, setEvents] = useState<TimelineEvent[]>(() => loadPersistedEvents())
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isCheckingSession, setIsCheckingSession] = useState(true)
  const [showAddEventForm, setShowAddEventForm] = useState(false)
  const [newEvent, setNewEvent] = useState(() => ({ ...INITIAL_EVENT_STATE }))
  const [newImageLink, setNewImageLink] = useState('')
  const [sortBy, setSortBy] = useState<'asc' | 'desc'>('asc')
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'timeline' | 'capsule' | 'milestone'>('timeline')
  const [dataMessage, setDataMessage] = useState('')
  const logoutTimer = useRef<number | null>(null)
  const importInputRef = useRef<HTMLInputElement | null>(null)

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

  useEffect(() => {
    let active = true
    getAdminSession()
      .then((session) => {
        if (!active) return
        if (session.authenticated) {
          clearLogoutTimer()
          setIsAuthenticated(true)
          logoutTimer.current = window.setTimeout(() => {
            setIsAuthenticated(false)
            setShowAddEventForm(false)
            setEditingEventId(null)
            resetNewEvent()
          }, 30 * 60 * 1000)
        }
      })
      .finally(() => {
        if (active) setIsCheckingSession(false)
      })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(TIMELINE_STORAGE_KEY, JSON.stringify(events))
  }, [events])

  const resetNewEvent = () => {
    setNewEvent({ ...INITIAL_EVENT_STATE })
    setNewImageLink('')
  }

  const handleLogout = useCallback(async () => {
    clearLogoutTimer()
    setIsAuthenticated(false)
    setIsAuthModalOpen(false)
    setShowAddEventForm(false)
    setEditingEventId(null)
    resetNewEvent()
    try {
      await logoutAdmin()
    } catch {
      // Ignore logout network failures and keep local state consistent.
    }
  }, [])

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

  const handleAuth = useCallback(async (password: string) => {
    await loginAdmin(password)
    clearLogoutTimer()
    setIsAuthenticated(true)
    setIsAuthModalOpen(false)
    logoutTimer.current = window.setTimeout(() => {
      setIsAuthenticated(false)
      setShowAddEventForm(false)
      setEditingEventId(null)
      resetNewEvent()
    }, 30 * 60 * 1000)
  }, [])

  const exportEvents = useCallback(() => {
    const payload = JSON.stringify(events, null, 2)
    const blob = new Blob([payload], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `yaoyao-events-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
    setDataMessage('事件已导出为 JSON 文件')
  }, [events])

  const importEvents = useCallback(async (file: File) => {
    const text = await file.text()
    const parsed = JSON.parse(text)
    if (!Array.isArray(parsed) || !parsed.every(isTimelineEvent)) {
      throw new Error('文件格式无效，请选择合法的事件 JSON')
    }
    setEvents(parsed)
    setDataMessage(`已导入 ${parsed.length} 条事件`)
  }, [])

  const handleImportClick = useCallback(() => {
    importInputRef.current?.click()
  }, [])

  const handleImportFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await importEvents(file)
    } catch (err) {
      setDataMessage((err as Error).message || '导入失败')
    } finally {
      if (importInputRef.current) importInputRef.current.value = ''
    }
  }, [importEvents])

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
      className="min-h-screen relative text-slate-800 overflow-x-hidden"
    >
      {/* 城市剪影背景 */}
      <div className="fixed bottom-0 left-0 w-full h-64 bg-repeat-x opacity-10 pointer-events-none z-0" 
           style={{ 
             backgroundImage: 'linear-gradient(to top, #000 0%, transparent 100%)',
             maskImage: 'url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMCAxMDBWMjBoMTB2ODBoMTBWNTBoMTB2NTBoMTBWMzBoMTB2NzB6IiBmaWxsPSJibGFjayIvPjwvc3ZnPg==")' 
           }} 
      />

      {/* 顶部导航栏 - 警徽/自然风格 */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b-4 border-z-orange shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <motion.div
              whileHover={{ scale: 1.05, rotate: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' })
                setActiveTab('timeline')
              }}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-z-purple to-z-blue flex items-center justify-center shadow-lg border-2 border-white text-2xl relative overflow-hidden group-hover:animate-bounce">
                🐰
                <div className="absolute inset-0 bg-white opacity-20 rounded-full animate-pulse"></div>
              </div>
              <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-z-purple to-z-blue font-heading tracking-tight drop-shadow-sm">
                Yaoyao's Time
              </span>
            </motion.div>
            
            {/* 桌面端导航 */}
            <div className="hidden md:flex items-center gap-2">
              {[
                { id: 'timeline', label: '美好回忆', icon: '🥕' },
                { id: 'capsule', label: '时光胶囊', icon: '💊' },
                { id: 'milestone', label: '成长记录', icon: '📏' }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`relative px-6 py-2 rounded-full text-lg font-bold transition-all duration-300 border-2 ${
                    activeTab === item.id 
                      ? 'bg-z-green text-white border-z-green-light shadow-lg scale-105' 
                      : 'bg-white text-slate-500 border-slate-200 hover:border-z-green hover:text-z-green'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-xl">{item.icon}</span>
                    {item.label}
                  </span>
                </button>
              ))}

              <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => isAuthenticated ? void handleLogout() : setIsAuthModalOpen(true)}
                aria-label={isAuthenticated ? '退出管理员' : '管理员登录'}
                data-testid="admin-auth-toggle"
                disabled={isCheckingSession}
                className={`ml-4 w-12 h-12 rounded-full border-4 flex items-center justify-center shadow-md transition-colors ${
                  isAuthenticated 
                    ? 'bg-red-500 border-red-300 text-white' 
                    : 'bg-blue-500 border-blue-300 text-white'
                }`}
              >
                {isAuthenticated ? '🔒' : '🔑'}
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* 内容区域 */}
      <main className="pt-28 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto min-h-[calc(100vh-4rem)]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="h-full"
          >
            {activeTab === 'timeline' && (
              <div className="space-y-8">
                 {/* 排序和搜索控件 - 文件夹风格 */}
                 <div className="z-card p-4 flex flex-col md:flex-row gap-4 justify-between items-center bg-orange-50 border-orange-200">
                    <div className="flex gap-2">
                      <button 
                        className={`px-4 py-2 rounded-xl text-lg font-bold transition-all shadow-sm ${sortBy === 'asc' ? 'bg-z-orange text-white transform -translate-y-1' : 'bg-white text-slate-500 border-2 border-slate-100'}`}
                        onClick={() => setSortBy('asc')}
                      >
                        ⬇️ 正序
                      </button>
                      <button 
                        className={`px-4 py-2 rounded-xl text-lg font-bold transition-all shadow-sm ${sortBy === 'desc' ? 'bg-z-orange text-white transform -translate-y-1' : 'bg-white text-slate-500 border-2 border-slate-100'}`}
                        onClick={() => setSortBy('desc')}
                      >
                        ⬆️ 倒序
                      </button>
                    </div>
                    
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                      <button 
                        className={`px-4 py-2 rounded-xl text-lg font-bold whitespace-nowrap transition-all shadow-sm ${!selectedTag ? 'bg-z-purple text-white transform -translate-y-1' : 'bg-white text-slate-500 border-2 border-slate-100'}`}
                        onClick={() => setSelectedTag(null)}
                      >
                        全部
                      </button>
                      {allTags.map(tag => (
                        <button
                          key={tag}
                          className={`px-4 py-2 rounded-xl text-lg font-bold whitespace-nowrap transition-all shadow-sm ${selectedTag === tag ? 'bg-z-purple text-white transform -translate-y-1' : 'bg-white text-slate-500 border-2 border-slate-100'}`}
                          onClick={() => setSelectedTag(tag)}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    <div className="relative w-full md:w-64">
                      <input
                        type="text"
                        placeholder="🔍 搜索记忆..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white border-2 border-slate-200 rounded-xl px-4 py-2 text-lg text-slate-700 placeholder-slate-400 focus:outline-none focus:border-z-purple focus:ring-4 focus:ring-purple-100 transition-all"
                      />
                    </div>
                 </div>

                 {isAuthenticated && (
                   <div className="z-card p-4 flex flex-col md:flex-row md:items-center gap-3 bg-blue-50 border-blue-200">
                     <div className="text-slate-600 text-sm md:text-base">数据工具</div>
                     <div className="flex gap-2 flex-wrap">
                       <button
                         type="button"
                         onClick={exportEvents}
                         className="px-4 py-2 rounded-xl bg-white border-2 border-blue-200 text-blue-700 font-bold hover:bg-blue-100 transition-colors"
                       >
                         导出事件 JSON
                       </button>
                       <button
                         type="button"
                         onClick={handleImportClick}
                         className="px-4 py-2 rounded-xl bg-white border-2 border-blue-200 text-blue-700 font-bold hover:bg-blue-100 transition-colors"
                       >
                         导入事件 JSON
                       </button>
                       <input
                         ref={importInputRef}
                         type="file"
                         accept="application/json"
                         className="hidden"
                         onChange={handleImportFileChange}
                       />
                     </div>
                     {dataMessage && <span className="text-sm text-slate-500">{dataMessage}</span>}
                   </div>
                 )}

                 {/* 管理员添加按钮 */}
                 {isAuthenticated && !showAddEventForm && (
                   <motion.button
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     whileHover={{ scale: 1.02 }}
                     whileTap={{ scale: 0.98 }}
                     onClick={() => setShowAddEventForm(true)}
                     className="w-full py-6 rounded-3xl border-4 border-dashed border-z-green/40 text-z-green bg-green-50/50 hover:bg-green-100/50 transition-all flex items-center justify-center gap-3 group"
                   >
                     <span className="text-4xl group-hover:rotate-90 transition-transform duration-300">➕</span> 
                     <span className="text-2xl font-bold">记录新的美好时刻</span>
                   </motion.button>
                 )}

                 {/* 添加/编辑事件表单 */}
                 <AnimatePresence>
                  {showAddEventForm && (
                    <motion.div
                      className="z-card p-8 bg-white border-4 border-z-purple"
                      initial={{ opacity: 0, height: 0, scale: 0.9 }}
                      animate={{ opacity: 1, height: 'auto', scale: 1 }}
                      exit={{ opacity: 0, height: 0, scale: 0.9 }}
                      transition={{ type: "spring", bounce: 0.3 }}
                    >
                      <h3 className="text-3xl font-bold mb-6 text-z-purple flex items-center gap-3">
                        {editingEventId ? '✏️ 编辑事件' : '✨ 新的记忆'}
                      </h3>
                      
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-xl font-bold text-slate-600 mb-2">日期</label>
                            <input
                              type="date"
                              value={newEvent.date}
                              onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-z-purple text-lg"
                            />
                          </div>
                          <div>
                            <label className="block text-xl font-bold text-slate-600 mb-2">标题</label>
                            <input
                              type="text"
                              value={newEvent.title}
                              onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                              placeholder="给这段记忆起个名字"
                              className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-z-purple text-lg"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xl font-bold text-slate-600 mb-2">内容</label>
                          <textarea
                            value={newEvent.content}
                            onChange={(e) => setNewEvent({...newEvent, content: e.target.value})}
                            placeholder="发生了什么有趣的事情？"
                            rows={4}
                            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-z-purple resize-none text-lg"
                          />
                        </div>

                        <div>
                          <label className="block text-xl font-bold text-slate-600 mb-2">标签 (用逗号分隔)</label>
                          <input
                            type="text"
                            value={newEvent.tags}
                            onChange={(e) => setNewEvent({...newEvent, tags: e.target.value})}
                            placeholder="例如: 第一次, 搞笑, 惊喜"
                            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-z-purple text-lg"
                          />
                        </div>

                        <label className="flex items-center gap-3 text-lg text-slate-600 cursor-pointer p-4 bg-yellow-50 rounded-xl border-2 border-yellow-200 hover:bg-yellow-100 transition-colors">
                          <input
                            type="checkbox"
                            checked={newEvent.isHighlight}
                            onChange={(e) => setNewEvent({...newEvent, isHighlight: e.target.checked})}
                            className="w-6 h-6 rounded border-slate-300 text-z-orange focus:ring-z-orange"
                          />
                          <span>🌟 这是一个超级重要的时刻！(高亮显示)</span>
                        </label>

                        <div className="border-t-2 border-dashed border-slate-200 pt-6 mt-6">
                          <label className="block text-xl font-bold text-slate-600 mb-4">照片</label>
                          
                          <div className="flex gap-2 mb-4">
                            <input
                              type="text"
                              value={newImageLink}
                              onChange={(e) => setNewImageLink(e.target.value)}
                              placeholder="输入图片 URL"
                              className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:border-z-purple"
                            />
                            <button onClick={handleAddImageLink} type="button" className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-bold transition-colors">
                              添加链接
                            </button>
                          </div>

                          {isAuthenticated && (
                            <div className="mb-6 p-4 bg-blue-50 rounded-xl border-2 border-blue-100">
                              <Suspense fallback={<div className="text-slate-500">上传组件加载中...</div>}>
                                <ImageUploader
                                  onCompleted={(results) => {
                                    const uploadedImages = results.map((r) => ({
                                      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
                                      src: r.url,
                                      alt: '事件图片'
                                    }))
                                    setNewEvent((prev) => ({ ...prev, images: [...prev.images, ...uploadedImages] }))
                                  }}
                                />
                              </Suspense>
                            </div>
                          )}

                          {newEvent.images.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
                              {newEvent.images.map(img => (
                                <div key={img.id} className="relative group aspect-video rounded-xl overflow-hidden border-4 border-white shadow-md transform hover:scale-105 transition-transform">
                                  <img
                                    src={img.src}
                                    alt={img.alt}
                                    loading="lazy"
                                    decoding="async"
                                    className="w-full h-full object-cover"
                                  />
                                  <button 
                                    type="button" 
                                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity font-bold shadow-md"
                                    onClick={() => removeNewEventImage(img.id)}
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex justify-end gap-4 pt-6 border-t-2 border-slate-100">
                          <button 
                            className="px-8 py-3 rounded-full border-2 border-slate-300 text-slate-500 font-bold hover:bg-slate-100 transition-colors" 
                            onClick={handleCancelForm}
                          >
                            取消
                          </button>
                          <button 
                            className="z-btn px-8 py-3 bg-gradient-to-r from-z-purple to-pink-500 text-white font-bold text-lg shadow-lg hover:shadow-purple-500/30" 
                            onClick={handleAddEvent}
                          >
                            {editingEventId ? '💾 保存修改' : '🚀 发布'}
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
                 <div className="z-card p-8 bg-gradient-to-br from-purple-100 to-pink-100 border-purple-200 text-center">
                    <h2 className="text-4xl font-bold mb-2 text-z-purple">💊 时光胶囊</h2>
                    <p className="text-slate-600 text-xl">封存珍贵的记忆瞬间</p>
                 </div>
                 <Suspense fallback={<div className="text-slate-500 text-center py-8">内容加载中...</div>}>
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
                 </Suspense>
              </div>
            )}

            {activeTab === 'milestone' && (
              <div className="space-y-8">
                <div className="z-card p-8 bg-gradient-to-br from-blue-100 to-cyan-100 border-blue-200 text-center">
                    <h2 className="text-4xl font-bold mb-2 text-blue-600">🏆 成长里程碑</h2>
                    <p className="text-slate-600 text-xl">记录每一个成长的脚印</p>
                 </div>
                <Suspense fallback={<div className="text-slate-500 text-center py-8">内容加载中...</div>}>
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
                </Suspense>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 底部版权 */}
      <footer className="py-8 text-center text-slate-500 text-lg border-t-2 border-slate-100 bg-white/50 backdrop-blur-sm">
        <p>© {new Date().getFullYear()} Yaoyao's Time. Built with 🥕 and ❤️.</p>
      </footer>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuth={handleAuth}
      />
    </motion.div>
  )
}
