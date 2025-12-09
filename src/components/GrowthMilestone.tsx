import { motion } from 'framer-motion';

interface GrowthMilestoneProps {
  title: string;
  currentValue: number;
  targetValue: number;
  unit: string;
  color: string;
  icon: string;
}

const GrowthMilestone = ({ 
  title, 
  currentValue, 
  targetValue, 
  unit,
  color,
  icon
}: GrowthMilestoneProps) => {
  const percentage = Math.min(100, (currentValue / targetValue) * 100);
  
  return (
    <motion.div 
      className="z-card p-6 bg-white relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center text-4xl shadow-inner border-4 border-white">
          {icon}
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-800">{title}</h3>
          <div className="text-sm font-bold text-slate-400 uppercase tracking-wider">
            Training Goal
          </div>
        </div>
      </div>
      
      <div className="relative pt-2 pb-6">
        <div className="flex justify-between text-sm font-bold text-slate-500 mb-2">
          <span>当前进度</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
        
        {/* 进度条容器 - 像胡萝卜或者赛道 */}
        <div className="h-6 bg-slate-100 rounded-full overflow-hidden shadow-inner relative">
          {/* 背景刻度 */}
          <div className="absolute inset-0 flex justify-between px-2">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="w-0.5 h-full bg-white/50" />
            ))}
          </div>
          
          <motion.div 
            className="h-full rounded-full relative"
            style={{ 
              backgroundColor: color,
              backgroundImage: 'linear-gradient(45deg, rgba(255,255,255,0.2) 25%, transparent 25%, transparent 50%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.2) 75%, transparent 75%, transparent)',
              backgroundSize: '20px 20px'
            }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            {/* 进度条光效 */}
            <motion.div 
              className="absolute top-0 right-0 bottom-0 w-2 bg-white/50 blur-sm"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1 }}
            />
          </motion.div>
        </div>
        
        <div className="flex justify-between items-center mt-2">
          <span className="text-2xl font-bold text-slate-800">
            {currentValue}
            <span className="text-sm text-slate-400 ml-1">{unit}</span>
          </span>
          <span className="text-sm font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
            目标: {targetValue} {unit}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div className="bg-green-50 rounded-xl p-3 border border-green-100">
          <span className="block text-xs font-bold text-green-600 mb-1">已完成</span>
          <span className="block text-lg font-bold text-green-700">{percentage.toFixed(1)}%</span>
        </div>
        <div className="bg-orange-50 rounded-xl p-3 border border-orange-100">
          <span className="block text-xs font-bold text-orange-600 mb-1">剩余</span>
          <span className="block text-lg font-bold text-orange-700">{(targetValue - currentValue).toFixed(1)} <span className="text-sm">{unit}</span></span>
        </div>
      </div>

      {/* 装饰图标 */}
      {percentage >= 100 && (
        <motion.div 
          className="absolute top-4 right-4 text-4xl transform rotate-12"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 1 }}
        >
          🏆
        </motion.div>
      )}
    </motion.div>
  );
};

export default GrowthMilestone;