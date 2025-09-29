import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Users, PlusCircle, Settings } from 'lucide-react';
import { motion } from 'framer-motion';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/add-transaction', icon: PlusCircle, label: 'Add' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-lg border-t border-white/10 px-4 py-2 z-50">
      <div className="flex justify-around items-center">
        {navItems.map(({ path, icon: Icon, label }) => {
          const isActive = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className="relative flex flex-col items-center p-2 group"
            >
              <Icon
                size={24}
                className={`transition-colors duration-200 ${
                  isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-400'
                }`}
              />
              <span
                className={`text-xs mt-1 transition-colors duration-200 ${
                  isActive ? 'text-blue-400' : 'text-gray-400 group-hover:text-blue-400'
                }`}
              >
                {label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="bottomNav"
                  className="absolute -bottom-2 left-2 right-2 h-0.5 bg-blue-400 rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;