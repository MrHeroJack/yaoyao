import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import ParticleBackground from './components/ParticleBackground'
import BioTimeline from './components/BioTimeline'
import MemoryCapsule from './components/MemoryCapsule'
import GrowthMilestone from './components/GrowthMilestone'
import './index.css'

// 时间轴的核心日期：2024-03-27（女儿出生）
const CENTER_DATE = '2024-03-27'

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
  const [newEvent, setNewEvent] = useState({
    date: '',
    title: '',
    content: '',
    tags: '',
    isHighlight: false
  })
  const [sortBy, setSortBy] = useState<'asc' | 'desc'>('asc')
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

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
    setIsAuthenticated(true)
    setIsAuthModalOpen(false)
    // 在实际应用中，这里应该设置一个过期时间
    setTimeout(() => {
      setIsAuthenticated(false)
    }, 30 * 60 * 1000) // 30分钟后自动退出
  }

  const handleAddEvent = () => {
    if (!newEvent.date || !newEvent.title || !newEvent.content) return
    
    const event: TimelineEvent = {
      id: editingEventId || Date.now().toString(),
      date: newEvent.date,
      title: newEvent.title,
      content: newEvent.content,
      tags: newEvent.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      isHighlight: newEvent.isHighlight,
      images: editingEventId 
        ? events.find(e => e.id === editingEventId)?.images || [] 
        : []
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
    
    setNewEvent({
      date: '',
      title: '',
      content: '',
      tags: '',
      isHighlight: false
    })
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
      isHighlight: !!event.isHighlight
    })
    setEditingEventId(event.id)
    setShowAddEventForm(true)
  }

  const sortedEvents = [...events].sort((a, b) => {
    const dateA = new Date(a.date).getTime()
    const dateB = new Date(b.date).getTime()
    return sortBy === 'asc' ? dateA - dateB : dateB - dateA
  })
  
  const filteredEvents = sortedEvents.filter(event => {
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      const matchesSearch = 
        event.title.toLowerCase().includes(term) ||
        event.content.toLowerCase().includes(term) ||
        event.tags.some(tag => tag.toLowerCase().includes(term))
      if (!matchesSearch) return false
    }
    
    // Tag filter
    if (selectedTag && !event.tags.includes(selectedTag)) {
      return false
    }
    
    return true
  })
  
  // Get all unique tags
  const allTags = Array.from(
    new Set(events.flatMap(event => event.tags))
  ).sort()

  return (
    <div className="container">
      {/* 添加粒子背景 */}
      <ParticleBackground />
      
      <header className="header">
        <motion.div 
          className="brand"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="logo" />
          <h1>&lt;我们的欢乐时光 /&gt;</h1>
        </motion.div>
        <div className="code-tabs">
          <div className="code-tab active">Timeline.tsx</div>
          <div className="code-tab">Events.json</div>
        </div>
        <motion.p 
          className="subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          <span className="code-comment">// </span>用一条温柔的时间轴，记录一家人的小确幸与大事件
        </motion.p>
        {isAuthenticated && (
          <motion.div 
            className="auth-status"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <span className="code-comment">/* </span>🔓 管理员模式已激活<span className="code-comment"> */</span>
          </motion.div>
        )}
        {isAuthenticated && (
          <motion.button
            className="add-event-button"
            onClick={() => setShowAddEventForm(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="code-function">function</span> 添加新事件() {}
            </motion.button>
        )}
      </header>

      {/* 添加事件表单 */}
      <AnimatePresence>
        {showAddEventForm && (
          <motion.div
            className="add-event-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3>{editingEventId ? '编辑事件' : '添加新事件'}</h3>
            <div className="form-group">
              <label>日期:</label>
              <input
                type="date"
                value={newEvent.date}
                onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>标题:</label>
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                placeholder="请输入事件标题"
              />
            </div>
            <div className="form-group">
              <label>内容:</label>
              <textarea
                value={newEvent.content}
                onChange={(e) => setNewEvent({...newEvent, content: e.target.value})}
                placeholder="请输入事件内容"
              />
            </div>
            <div className="form-group">
              <label>标签 (用逗号分隔):</label>
              <input
                type="text"
                value={newEvent.tags}
                onChange={(e) => setNewEvent({...newEvent, tags: e.target.value})}
                placeholder="例如: 纪念日, 旅行, 节日"
              />
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={newEvent.isHighlight}
                  onChange={(e) => setNewEvent({...newEvent, isHighlight: e.target.checked})}
                />
                重要时刻
              </label>
            </div>
            <div className="form-actions">
              <button className="cancel-button" onClick={() => {
                setShowAddEventForm(false)
                setEditingEventId(null)
              }}>
                取消
              </button>
              <button className="submit-button" onClick={handleAddEvent}>
                {editingEventId ? '更新事件' : '添加事件'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 排序控件 */}
      <div className="controls">
        <div className="sort-controls">
          <span>排序:</span>
          <button 
            className={sortBy === 'asc' ? 'active' : ''}
            onClick={() => setSortBy('asc')}
          >
            时间正序
          </button>
          <button 
            className={sortBy === 'desc' ? 'active' : ''}
            onClick={() => setSortBy('desc')}
          >
            时间倒序
          </button>
        </div>
        
        <div className="search-container">
          <input
            type="text"
            placeholder="搜索事件..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>
      
      {/* 标签过滤器 */}
      <div className="tag-filter">
        <button 
          className={!selectedTag ? 'active' : ''}
          onClick={() => setSelectedTag(null)}
        >
          全部
        </button>
        {allTags.map(tag => (
          <button
            key={tag}
            className={selectedTag === tag ? 'active' : ''}
            onClick={() => setSelectedTag(tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* 新增记忆胶囊区域 */}
      <section className="memory-capsules">
        <h2 className="section-title">记忆胶囊</h2>
        <div className="capsules-container">
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
            content="宝宝今天清晰地叫了一声'妈妈'，激动得我眼泪都出来了。"
            images={[
              { id: '4', src: 'https://placehold.co/300x200/0B132B/9D4EDD?text=First+Word', alt: '宝宝说话' }
            ]}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </section>

      {/* 新增成长里程碑区域 */}
      <section className="growth-milestones">
        <h2 className="section-title">成长里程碑</h2>
        <div className="milestones-container">
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
      </section>

      {/* 生物时间轴区域 */}
      <section className="bio-timeline-wrapper">
        <h2 className="section-title">生物时间轴</h2>
        <BioTimeline 
          events={filteredEvents}
          isAuthenticated={isAuthenticated}
          onImageDelete={handleImageDelete}
          onEdit={handleEditEvent}
          onDelete={handleDeleteEvent}
        />
      </section>

      <motion.footer 
        className="footer"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        记录我们从相遇、相爱到成为一家三口的美好历程。
        <br />
        <strong style={{ color: 'var(--highlight)' }}>
          {CENTER_DATE} - 生命中最珍贵的时刻 ✨
        </strong>
      </motion.footer>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuth={handleAuth}
      />
    </div>
  )
}
