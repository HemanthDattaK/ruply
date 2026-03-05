import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-bg-start to-bg-end flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.2, 0.9, 0.3, 1] }}
        className="glass-card rounded-lg p-8 flex flex-col items-center"
      >
        {/* Brand Mark */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-1 to-primary-2 flex items-center justify-center mb-6 micro-bounce">
          <span className="text-white font-bold text-xl">KV</span>
        </div>

        {/* Progress Ring */}
        <div className="relative w-12 h-12 mb-4">
          <svg className="w-12 h-12 loader-ring" viewBox="0 0 50 50">
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="rgba(0, 102, 255, 0.2)"
              strokeWidth="3"
            />
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="url(#gradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="31.416"
              strokeDashoffset="7.854"
              className="progress-ring"
            />
            <defs>
              <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0066FF" />
                <stop offset="100%" stopColor="#3BB6FF" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Loading Text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-small text-text-secondary"
        >
          Loading your data...
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;