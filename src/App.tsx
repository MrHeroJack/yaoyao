import { motion, AnimatePresence } from 'framer-motion'
import { useState, useRef } from 'react'
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

// 管理员密码（实际项目中应该使用更安全的认证方式）
const ADMIN_PASSWORD = 'yaoyao2024'

// 家庭重要时刻 - 按时间顺序排列
const initialEvents = [
  {
    id: '1',
    date: '2014-09-30',
    title: '我们牵手了 💕',
    content: '那个秋天，我们决定一起走下去，从此有了彼此的陪伴。',
    tags: ['爱情', '开始'],
    images: [] as ImageItem[]
  },
  {
    id: '2',
    date: '2017-11-07',
    title: '领证结婚 💍',
    content: '在民政局，我们正式成为了一家人，从恋人变成了夫妻。',
    tags: ['婚姻', '承诺'],
    images: [] as ImageItem[]
  },
  {
    id: '3',
    date: '2018-10-05',
    title: '婚礼庆典 🎉',
    content: '在亲朋好友的见证下，我们举办了温馨的婚礼，许下永恒的誓言。',
    tags: ['婚礼', '庆祝'],
    images: [] as ImageItem[]
  },
  {
    id: '4',
    date: '2024-03-27',
    title: '我们的宝贝降临 💜',
    content: '欢迎来到这个世界，小天使！那一刻，我们的世界被温柔点亮，生命中最重要的时刻。',
    tags: ['起点', '诞生', '奇迹'],
    isHighlight: true,
    images: [] as ImageItem[]
  },
  {
    id: '5',
    date: '2024-07-05',
    title: '宝宝100天纪念 🎂',
    content: '小宝贝已经100天了！从最初的小小一团，到现在会笑会闹，每一天都是惊喜。',
    tags: ['成长', '纪念日'],
    images: [] as ImageItem[]
  },
  {
    id: '6',
    date: '2025-03-27',
    title: '宝宝一周岁生日 🎈',
    content: '我们的小天使一岁了！从爬到走，从咿呀学语到叫爸爸妈妈，这一年 记住了太多美好。',
    tags: ['生日', '里程碑'],
    isHighlight: true,
    images: [] as ImageItem[]
  },
]

function Badge({ text }: { text: string }) {
  return <span className="badge">{text}</span>
}

function UploadIconButton({ 
  eventId, 
  onImageAdd,
  isAuthenticated,
  onAuthRequest
}: { 
  eventId: string
  onImageAdd: (eventId: string, images: ImageItem[]) => void
  isAuthenticated: boolean
  onAuthRequest: () => void
}) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (files: FileList | null) => {
    if (!files || !isAuthenticated) return
    
    const newImages: ImageItem[] = []
    Array.from(files).forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          const filters = ['none', 'sepia', 'vintage', 'warm', 'cool']
          const randomFilter = filters[Math.floor(Math.random() * filters.length)]
          
          const newImage: ImageItem = {
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
            src: e.target?.result as string,
            alt: file.name,
            file,
            filter: randomFilter
          }
          newImages.push(newImage)
          if (newImages.length === Array.from(files).filter(f => f.type.startsWith('image/')).length) {
            onImageAdd(eventId, newImages)
          }
        }
        reader.readAsDataURL(file)
      }
    })
  }

  const handleClick = () => {
    if (!isAuthenticated) {
      onAuthRequest()
      return
    }
    fileInputRef.current?.click()
  }

  return (
    <>
      <div 
        className={`upload-icon-button ${!isAuthenticated ? 'locked' : ''}`}
        onClick={handleClick}
      >
        <span className="icon">{isAuthenticated ? '📸' : '🔒'}</span>
      </div>
      {isAuthenticated && (
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden-input"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      )}
    </>
  )
}

function ImageModal({ 
  image, 
  isOpen, 
  onClose 
}: { 
  image: ImageItem | null
  isOpen: boolean
  onClose: () => void 
}) {
  if (!image) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="image-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="image-modal-content"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <img 
              src={image.src} 
              alt={image.alt} 
              className={`modal-image filter-${image.filter}`}
            />
            <button className="modal-close" onClick={onClose}>×</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function ImageGallery({ 
  images, 
  eventId, 
  onImageDelete,
  isAuthenticated
}: { 
  images: ImageItem[]
  eventId: string
  onImageDelete: (eventId: string, imageId: string) => void
  isAuthenticated: boolean
}) {
  const [selectedImage, setSelectedImage] = useState<ImageItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  if (images.length === 0) return null

  const handleImageClick = (image: ImageItem) => {
    setSelectedImage(image)
    setIsModalOpen(true)
  }

  return (
    <>
      <div className="image-gallery">
        {images.map((image, index) => (
          <motion.div
            key={image.id}
            className="image-item enhanced"
            whileHover={{ scale: 1.05, rotate: 1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              delay: index * 0.1,
              type: "spring",
              stiffness: 300,
              damping: 20
            }}
            onClick={() => handleImageClick(image)}
          >
            <img 
              src={image.src} 
              alt={image.alt} 
              className={`filter-${image.filter}`}
            />
            <div className="image-overlay">
              <div className="overlay-icon">🔍</div>
            </div>
            {isAuthenticated && (
              <div 
                className="image-delete"
                onClick={(e) => {
                  e.stopPropagation()
                  onImageDelete(eventId, image.id)
                }}
              >
                ×
              </div>
            )}
          </motion.div>
        ))}
      </div>
      <ImageModal 
        image={selectedImage}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
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

function TimelineItem({ 
  event,
  onImageAdd,
  onImageDelete,
  isAuthenticated,
  onAuthRequest
}: {
  event: typeof initialEvents[number] & { images: ImageItem[] }
  onImageAdd: (eventId: string, images: ImageItem[]) => void
  onImageDelete: (eventId: string, imageId: string) => void
  isAuthenticated: boolean
  onAuthRequest: () => void
}) {
  const { id, date, title, content, tags, images, isHighlight } = event

  return (
    <motion.div
      className={`timeline-item ${isHighlight ? 'highlight' : ''}`}
      initial={{ opacity: 0, y: 50, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ 
        duration: 0.6, 
        ease: [0.2, 0.7, 0.2, 1],
        scale: { duration: 0.4 }
      }}
    >
      <motion.div
        className="card"
        whileHover={{ 
          y: -8, 
          scale: 1.02,
          transition: { duration: 0.2 }
        }}
      >
        <UploadIconButton 
          eventId={id} 
          onImageAdd={onImageAdd}
          isAuthenticated={isAuthenticated}
          onAuthRequest={onAuthRequest}
        />
        
        <div className="meta">
          <strong>{date}</strong>
          <span>·</span>
          {tags?.map((tag) => (
            <Badge key={tag} text={tag} />
          ))}
          {isHighlight && (
            <motion.span 
              className="badge"
              style={{ 
                background: 'rgba(255, 107, 107, 0.2)', 
                color: '#ff6b6b',
                border: '1px solid rgba(255, 107, 107, 0.3)'
              }}
              animate={{ 
                scale: [1, 1.05, 1],
                opacity: [0.8, 1, 0.8]
              }}
              transition={{ 
                duration: 2, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              ⭐ 重要时刻
            </motion.span>
          )}
        </div>
        <h3 className="title">{title}</h3>
        <p className="content">{content}</p>
        
        <div className="image-section">
          <ImageGallery 
            images={images} 
            eventId={id} 
            onImageDelete={onImageDelete}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function App() {
  const [events, setEvents] = useState(initialEvents)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  const handleImageAdd = (eventId: string, newImages: ImageItem[]) => {
    setEvents(prevEvents => 
      prevEvents.map(event => 
        event.id === eventId 
          ? { ...event, images: [...event.images, ...newImages] }
          : event
      )
    )
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
    setIsAuthenticated(true)
    // 在实际应用中，这里应该设置一个过期时间
    setTimeout(() => {
      setIsAuthenticated(false)
    }, 30 * 60 * 1000) // 30分钟后自动退出
  }

  const handleAuthRequest = () => {
    setShowAuthModal(true)
  }

  return (
    <div className="container">
      <header className="header">
        <motion.div 
          className="brand"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="logo" />
          <h1>我们的欢乐时光</h1>
        </motion.div>
        <motion.p 
          className="subtitle"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
        >
          用一条温柔的时间轴，记录一家人的小确幸与大事件
        </motion.p>
        {isAuthenticated && (
          <motion.div 
            className="auth-status"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            🔓 管理员模式已激活
          </motion.div>
        )}
      </header>

      <section className="timeline-wrapper">
        <motion.div 
          className="timeline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          {events.map((event) => (
            <TimelineItem 
              key={event.id} 
              event={event}
              onImageAdd={handleImageAdd}
              onImageDelete={handleImageDelete}
              isAuthenticated={isAuthenticated}
              onAuthRequest={handleAuthRequest}
            />
          ))}
        </motion.div>
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
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuth={handleAuth}
      />
    </div>
  )
}
