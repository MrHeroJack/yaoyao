import { motion, AnimatePresence } from 'framer-motion';
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

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <motion.div 
      className={`
        z-card relative overflow-hidden transition-all duration-300
        ${isExpanded ? 'p-8 ring-4 ring-z-blue/30' : 'p-6 hover:ring-2 hover:ring-z-purple/20'}
      `}
      layout
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, rotate: isExpanded ? 0 : -1 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      onClick={() => !isExpanded && setIsExpanded(true)}
    >
      {/* 装饰性背景元素 - 爪印 */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-z-purple/10 to-z-blue/10 rounded-full blur-2xl pointer-events-none"></div>
      
      {/* 顶部标签 - 像档案袋标签 */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-100 text-3xl flex items-center justify-center border-2 border-orange-200 transform -rotate-6 shadow-sm">
            📂
          </div>
          <div>
            <h3 className="text-2xl font-bold text-slate-800 leading-tight">
              {title}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-600 text-sm font-bold border border-blue-200">
                CASE #{date.replace(/-/g, '')}
              </span>
              <span className="text-slate-400 text-sm font-medium">
                📅 {date}
              </span>
            </div>
          </div>
        </div>
        
        {isAuthenticated && onImageUpload && (
          <motion.button 
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            className="w-10 h-10 rounded-full bg-z-green text-white flex items-center justify-center shadow-lg border-2 border-white z-10"
            onClick={(e) => {
              e.stopPropagation();
              onImageUpload();
            }}
          >
            📸
          </motion.button>
        )}
      </div>

      {/* 内容区域 */}
      <motion.div layout className="relative z-10">
        <p className={`text-slate-600 leading-relaxed ${isExpanded ? 'text-lg' : 'line-clamp-2'}`}>
          {content}
        </p>

        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6"
            >
              {images.length > 0 && (
                <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-inner bg-slate-100 aspect-video group">
                  <motion.img 
                    key={currentImageIndex}
                    src={images[currentImageIndex].src} 
                    alt={images[currentImageIndex].alt}
                    initial={{ opacity: 0, scale: 1.1 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="w-full h-full object-cover"
                  />
                  
                  {images.length > 1 && (
                    <>
                      <button 
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-z-purple shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                        onClick={prevImage}
                      >
                        ◀
                      </button>
                      <button 
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-z-purple shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform hover:scale-110"
                        onClick={nextImage}
                      >
                        ▶
                      </button>
                      
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((_, index) => (
                          <div 
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentImageIndex ? 'w-6 bg-z-purple' : 'bg-white/60'}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
              
              <div className="mt-6 flex justify-center">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-2 rounded-full bg-slate-100 text-slate-500 font-bold hover:bg-slate-200 transition-colors flex items-center gap-2"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(false);
                  }}
                >
                  📁 归档档案 (收起)
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isExpanded && (
          <div className="mt-4 flex justify-center">
            <motion.button 
              whileHover={{ y: 2 }}
              className="text-z-purple font-bold flex items-center gap-1 text-sm opacity-80 hover:opacity-100"
            >
              查看详情 ▼
            </motion.button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default MemoryCapsule;