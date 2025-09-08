import { motion } from 'framer-motion';
import { useState } from 'react';

interface MemoryCapsuleProps {
  title: string;
  date: string;
  content: string;
  images: { id: string; src: string; alt: string }[];
  onImageUpload?: () => void;
  isAuthenticated?: boolean;
}

const MemoryCapsule = ({ 
  title, 
  date, 
  content, 
  images,
  onImageUpload,
  isAuthenticated 
}: MemoryCapsuleProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <motion.div 
      className="memory-capsule"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 300 }}
    >
      {/* 胶囊主体 */}
      <div className="capsule-body">
        {/* 胶囊顶部装饰 */}
        <div className="capsule-top">
          <div className="capsule-highlight"></div>
        </div>
        
        {/* 胶囊内容区域 */}
        <div className="capsule-content">
          <h3 className="capsule-title">{title}</h3>
          <span className="capsule-date">{date}</span>
          
          {isExpanded ? (
            <div className="expanded-content">
              <p>{content}</p>
              {images.length > 0 && (
                <div className="capsule-image-gallery">
                  <div className="main-image">
                    <img src={images[currentImageIndex].src} alt={images[currentImageIndex].alt} />
                    {images.length > 1 && (
                      <>
                        <button className="nav-btn prev" onClick={prevImage}>‹</button>
                        <button className="nav-btn next" onClick={nextImage}>›</button>
                      </>
                    )}
                  </div>
                  <div className="image-indicators">
                    {images.map((_, index) => (
                      <span 
                        key={index} 
                        className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                        onClick={() => setCurrentImageIndex(index)}
                      ></span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="capsule-preview">{content.substring(0, 100)}...</p>
          )}
          
          <button 
            className="toggle-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? '收起' : '展开'}
          </button>
        </div>
        
        {/* 胶囊底部装饰 */}
        <div className="capsule-bottom">
          <div className="capsule-bubble"></div>
          <div className="capsule-bubble"></div>
          <div className="capsule-bubble"></div>
        </div>
      </div>
      
      {/* 粒子效果装饰 */}
      <div className="capsule-particles">
        <div className="particle"></div>
        <div className="particle"></div>
        <div className="particle"></div>
      </div>
      
      {/* 管理员功能 */}
      {isAuthenticated && onImageUpload && (
        <button className="upload-btn" onClick={onImageUpload}>
          上传图片
        </button>
      )}
    </motion.div>
  );
};

export default MemoryCapsule;