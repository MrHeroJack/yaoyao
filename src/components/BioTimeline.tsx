import { motion } from 'framer-motion';
import { useState } from 'react';
import { TimelineEvent } from '../App';

interface BioTimelineProps {
  events: TimelineEvent[];
  isAuthenticated: boolean;
  onImageDelete: (eventId: string, imageId: string) => void;
  onEdit: (event: TimelineEvent) => void;
  onDelete: (eventId: string) => void;
}

const BioTimeline = ({ 
  events, 
  isAuthenticated, 
  onImageDelete, 
  onEdit, 
  onDelete 
}: BioTimelineProps) => {
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);

  const toggleExpand = (eventId: string) => {
    setExpandedEventId(expandedEventId === eventId ? null : eventId);
  };

  return (
    <div className="relative p-4 md:p-8 space-y-12">
      {/* 背景装饰 - 植物叶片 */}
      <div className="fixed top-20 right-0 opacity-10 pointer-events-none z-0">
         <span style={{ fontSize: '15rem' }}>🌿</span>
      </div>
      <div className="fixed bottom-20 left-0 opacity-10 pointer-events-none z-0">
         <span style={{ fontSize: '15rem' }}>🍃</span>
      </div>

      {events.map((event, index) => (
        <motion.div
          key={event.id}
          className={`relative z-10 ${event.isHighlight ? 'scale-105' : ''}`}
          initial={{ opacity: 0, y: 50, rotate: index % 2 === 0 ? -2 : 2 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ 
            type: "spring",
            bounce: 0.4,
            duration: 0.8,
            delay: index * 0.1 
          }}
        >
          {/* 装饰性连接线 */}
          {index < events.length - 1 && (
            <div className="absolute left-1/2 bottom-[-50px] w-1 h-[60px] bg-gradient-to-b from-orange-400 to-purple-500 rounded-full opacity-50 -z-10 transform -translate-x-1/2 border-dashed border-2 border-white/50" />
          )}

          {/* 卡片容器 */}
          <motion.div 
            className={`
              z-card p-6 md:p-8 
              ${event.isHighlight ? 'border-4 border-yellow-300 bg-gradient-to-br from-white to-orange-50' : 'bg-white'}
            `}
            whileHover={{ y: -8, scale: 1.02, rotate: index % 2 === 0 ? 1 : -1 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            {/* 徽章/图标装饰 */}
            <div className="absolute -top-6 -right-4 text-5xl filter drop-shadow-md transform rotate-12">
              {event.isHighlight ? '🌟' : '🍩'}
            </div>

            {/* 头部 */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b-2 border-dashed border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-z-orange to-z-purple flex items-center justify-center text-2xl shadow-inner text-white font-bold border-4 border-white">
                  {index + 1}
                </div>
                <h3 className="text-3xl font-bold text-slate-800 tracking-wide" style={{ color: 'var(--z-purple)' }}>
                  {event.title}
                </h3>
              </div>
              <div className="px-4 py-1 rounded-full bg-orange-100 text-orange-600 font-bold border-2 border-orange-200 shadow-sm transform -rotate-2">
                📅 {event.date}
              </div>
            </div>
            
            {/* 内容 */}
            <div className="space-y-6">
              <p className="text-xl text-slate-600 leading-relaxed font-medium">
                {event.content}
              </p>
              
              {/* 标签 */}
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, tagIndex) => (
                  <span 
                    key={tagIndex} 
                    className="px-3 py-1 rounded-xl bg-green-100 text-green-700 font-bold border-2 border-green-200 text-lg shadow-sm hover:scale-110 transition-transform cursor-default"
                  >
                    🥕 {tag}
                  </span>
                ))}
              </div>
              
              {/* 图片网格 */}
              {event.images && event.images.length > 0 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {event.images.slice(0, expandedEventId === event.id ? undefined : 3).map((image, imgIndex) => (
                      <motion.div
                        key={image.id}
                        className="relative aspect-square rounded-2xl overflow-hidden border-4 border-white shadow-lg rotate-1 hover:rotate-0 transition-transform duration-300 group"
                        whileHover={{ scale: 1.05, rotate: 0, zIndex: 10 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: imgIndex * 0.1 }}
                      >
                        <img src={image.src} alt={image.alt} className="w-full h-full object-cover" />
                        {isAuthenticated && (
                          <button 
                            className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center font-bold shadow-md hover:bg-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              onImageDelete(event.id, image.id);
                            }}
                          >
                            ×
                          </button>
                        )}
                      </motion.div>
                    ))}
                  </div>
                  {event.images.length > 3 && (
                    <button 
                      className="w-full py-3 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors border-2 border-slate-200 border-dashed text-xl"
                      onClick={() => toggleExpand(event.id)}
                    >
                      {expandedEventId === event.id ? '⬆️ 收起相册' : `📸 查看全部 ${event.images.length} 张照片`}
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* 操作按钮 */}
            {isAuthenticated && (
              <div className="mt-6 flex gap-3 justify-end border-t-2 border-dashed border-slate-200 pt-4">
                <button 
                  className="z-btn px-6 py-2 bg-blue-100 text-blue-600 hover:bg-blue-200"
                  onClick={() => onEdit(event)}
                >
                  ✏️ 编辑
                </button>
                <button 
                  className="z-btn px-6 py-2 bg-red-100 text-red-600 hover:bg-red-200"
                  onClick={() => onDelete(event.id)}
                >
                  🗑️ 删除
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      ))}
    </div>
  );
};

export default BioTimeline;
