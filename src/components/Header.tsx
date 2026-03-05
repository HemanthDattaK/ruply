import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  title: string;
  showBack?: boolean;
  showAvatar?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, showBack = false, showAvatar = false }) => {
  const navigate = useNavigate();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-header sticky top-0 z-40 px-4 py-4"
    >
      <div className="max-w-mobile mx-auto flex items-center justify-between">
        <div className="flex items-center">
          {showBack ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="touch-target mr-3 rounded-lg hover:bg-black/5 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={24} className="text-text-primary" />
            </motion.button>
          ) : null}
          
          <div>
            {!showBack && (
              <p className="text-small text-text-secondary mb-1">
                {getGreeting()}, Hemanth
              </p>
            )}
            <h1 className="text-h1">{title}</h1>
          </div>
        </div>

        {showAvatar && !showBack && (
          <motion.div
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-1 to-primary-2 flex items-center justify-center cursor-pointer"
          >
            <User size={20} className="text-white" />
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;