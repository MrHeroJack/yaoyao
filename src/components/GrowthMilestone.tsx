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
      className="growth-milestone"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <div className="milestone-header">
        <span className="milestone-icon">{icon}</span>
        <h3 className="milestone-title">{title}</h3>
      </div>
      
      <div className="milestone-progress">
        <div className="progress-bar">
          <motion.div 
            className="progress-fill"
            style={{ backgroundColor: color }}
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, delay: 0.5 }}
          ></motion.div>
        </div>
        <div className="progress-text">
          <span className="current-value">{currentValue}</span>
          <span className="target-value">/{targetValue} {unit}</span>
        </div>
      </div>
      
      <div className="milestone-stats">
        <div className="stat">
          <span className="stat-label">已完成</span>
          <span className="stat-value">{percentage.toFixed(1)}%</span>
        </div>
        <div className="stat">
          <span className="stat-label">剩余</span>
          <span className="stat-value">{(targetValue - currentValue).toFixed(1)} {unit}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default GrowthMilestone;