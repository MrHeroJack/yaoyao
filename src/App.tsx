import { motion } from 'framer-motion'
import './index.css'

// 时间轴的核心日期：2024-03-27（女儿出生）
const CENTER_DATE = '2024-03-27'

// 家庭重要时刻
const events = [
  {
    date: '2014-09-30',
    title: '我们牵手了 💕',
    content: '那个秋天，我们决定一起走下去，从此有了彼此的陪伴。',
    side: 'left' as const,
    tags: ['爱情', '开始'],
  },
  {
    date: '2017-11-07',
    title: '领证结婚 💍',
    content: '在民政局，我们正式成为了一家人，从恋人变成了夫妻。',
    side: 'right' as const,
    tags: ['婚姻', '承诺'],
  },
  {
    date: '2018-10-05',
    title: '婚礼庆典 🎉',
    content: '在亲朋好友的见证下，我们举办了温馨的婚礼，许下永恒的誓言。',
    side: 'left' as const,
    tags: ['婚礼', '庆祝'],
  },
  {
    date: '2024-03-27',
    title: '我们的宝贝降临 💜',
    content: '欢迎来到这个世界，小天使！那一刻，我们的世界被温柔点亮。',
    side: 'right' as const,
    tags: ['起点', '诞生'],
  },
]

function Badge({ text }: { text: string }){
  return <span className="badge">{text}</span>
}

function TimelineItem({ date, title, content, side, tags }: typeof events[number]){
  return (
    <li className={`item ${side}`}>
      <motion.div
        className="card fade-in"
        initial={{ opacity: 0, y: 12, scale: 0.98 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.55, ease: [0.2, 0.7, 0.2, 1] }}
      >
        <div className="meta">
          <strong>{date}</strong>
          <span>·</span>
          {tags?.map((t) => (
            <Badge key={t} text={t} />
          ))}
        </div>
        <h3 className="title">{title}</h3>
        <p className="content">{content}</p>
      </motion.div>
    </li>
  )
}

export default function App(){
  return (
    <div className="container">
      <header className="header">
        <div className="brand">
          <div className="logo" aria-hidden/>
          <h1>我们的欢乐时光</h1>
        </div>
        <p className="subtitle">用一条温柔的时间轴，记录一家人的小确幸与大事件</p>
      </header>

      <section className="timeline-wrapper">
        <div className="center-line" />
        <div className="date-pin" aria-label={`中心日期 ${CENTER_DATE}`}>
          <span className="dot"/>
          <span className="text">中心日期：{CENTER_DATE}（女儿出生日）</span>
        </div>

        <ol className="timeline">
          {events.map((e, idx) => (
            <TimelineItem key={idx} {...e} />
          ))}
        </ol>
      </section>

      <footer className="footer">
        记录我们从相遇、相爱到成为一家三口的美好历程。
      </footer>
    </div>
  )
}
