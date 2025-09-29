import React from 'react';
import { motion } from 'framer-motion';

interface FloatingActionButtonProps {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onClick,
  icon,
  label,
}) => {
  return (
    <motion.button
      onClick={onClick}
      className="fixed bottom-6 right-6 bg-blue-500 text-white rounded-full p-4 shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors active:scale-95 transform duration-200"
      aria-label={label}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {icon}
    </motion.button>
  );
};

export default FloatingActionButton;