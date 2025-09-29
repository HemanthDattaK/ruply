import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

interface HeaderProps {
  title: string;
  showBack?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, showBack = false }) => {
  const navigate = useNavigate();

  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white shadow-sm"
    >
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center">
          {showBack ? (
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="mr-4 p-2 rounded-xl hover:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={24} className="text-gray-900" />
            </motion.button>
          ) : (
            <div className="p-2 bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-lg mr-3">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            {!showBack && <p className="text-sm text-gray-500">Ruply</p>}
          </div>
        </div>
        {!showBack && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/settings')}
            className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
        )}
      </div>
    </motion.header>
  );
};

export default Header;