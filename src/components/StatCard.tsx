import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Video as LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: 'primary' | 'success' | 'warning';
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, delay = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const duration = 600;
      const increment = value / (duration / 16);
      
      const counter = setInterval(() => {
        start += increment;
        if (start >= value) {
          setDisplayValue(value);
          clearInterval(counter);
        } else {
          setDisplayValue(Math.floor(start));
        }
      }, 16);

      return () => clearInterval(counter);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  const colorClasses = {
    primary: 'from-primary-1 to-primary-2',
    success: 'from-success to-success',
    warning: 'from-warning to-warning',
  };

  const iconColors = {
    primary: 'text-primary-1',
    success: 'text-success',
    warning: 'text-warning',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: delay / 1000, ease: [0.2, 0.9, 0.3, 1] }}
      className="premium-card p-4 relative overflow-hidden"
    >
      {/* Gradient Stripe */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClasses[color]}`} />
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-small text-text-secondary mb-1">{title}</p>
          <motion.p
            key={displayValue}
            className="text-h1 count-up"
          >
            {title.includes('₹') ? `₹${displayValue.toLocaleString()}` : displayValue.toLocaleString()}
          </motion.p>
        </div>
        
        <motion.div
          className={`w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center micro-bounce ${iconColors[color]}`}
          style={{ animationDelay: `${delay + 200}ms` }}
        >
          <Icon size={20} />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default StatCard;