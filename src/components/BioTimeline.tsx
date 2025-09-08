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
    <div className="bio-timeline">
      {events.map((event, index) => (
        <motion.div
          key={event.id}
          className={`bio-timeline-item ${event.isHighlight ? 'highlight' : ''}`}
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: index * 0.1 }}
        >
          {/* 细胞节点 */}
          <div className="bio-node">
            <div className="cell-outer">
              <div className="cell-inner"></div>
              <div className="cell-nucleus"></div>
            </div>
            {event.isHighlight && (
              <div className="dna-strand">
                <div className="dna-base"></div>
                <div className="dna-base"></div>
                <div className="dna-base"></div>
              </div>
            )}
          </div>
          
          {/* 时间轴卡片 */}
          <motion.div 
            className="bio-card"
            whileHover={{ y: -10, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="card-header">
              <h3 className="card-title">{event.title}</h3>
              <span className="card-date">{event.date}</span>
            </div>
            
            <div className="card-content">
              <p>{event.content}</p>
              
              <div className="card-tags">
                {event.tags.map((tag, tagIndex) => (
                  <span key={tagIndex} className="tag">{tag}</span>
                ))}
                {event.isHighlight && (
                  <motion.span 
                    className="highlight-tag"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      boxShadow: [
                        "0 0 5px rgba(255, 182, 193, 0.5)",
                        "0 0 15px rgba(255, 182, 193, 0.8)",
                        "0 0 5px rgba(255, 182, 193, 0.5)"
                      ]
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
              
              {event.images && event.images.length > 0 && (
                <div className="card-images">
                  <div className="image-grid">
                    {event.images.slice(0, expandedEventId === event.id ? undefined : 3).map((image, imgIndex) => (
                      <motion.div
                        key={image.id}
                        className="image-item"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: imgIndex * 0.1 }}
                      >
                        <img src={image.src} alt={image.alt} />
                        {isAuthenticated && (
                          <button 
                            className="image-delete-btn"
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
                      className="expand-btn"
                      onClick={() => toggleExpand(event.id)}
                    >
                      {expandedEventId === event.id ? '收起图片' : `查看全部 ${event.images.length} 张图片`}
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {isAuthenticated && (
              <div className="card-actions">
                <button className="action-btn edit-btn" onClick={() => onEdit(event)}>
                  编辑
                </button>
                <button className="action-btn delete-btn" onClick={() => onDelete(event.id)}>
                  删除
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