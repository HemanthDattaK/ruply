import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, UserPlus, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FloatingActionButton: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
        setIsExpanded(false);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const actions = [
    {
      icon: UserPlus,
      label: 'Add Customer',
      color: 'bg-success',
      action: () => navigate('/add-customer')
    },
    {
      icon: CreditCard,
      label: 'Add Transaction',
      color: 'bg-primary-1',
      action: () => navigate('/add-transaction')
    }
  ];

  const handleMainAction = () => {
    if (isExpanded) {
      setIsExpanded(false);
    } else {
      setIsExpanded(true);
    }
  };

  const handleActionClick = (action: () => void) => {
    action();
    setIsExpanded(false);
  };

  return (
    <div className="fixed bottom-6 right-4 z-50">
      {/* Action Buttons */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-20 right-0 space-y-3"
          >
            {actions.map((action, index) => (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: 0,
                  transition: { delay: index * 0.05 }
                }}
                exit={{ 
                  opacity: 0, 
                  scale: 0.8, 
                  y: 20,
                  transition: { delay: (actions.length - index - 1) * 0.05 }
                }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleActionClick(action.action)}
                className={`flex items-center space-x-3 ${action.color} text-white px-4 py-3 rounded-full shadow-lg`}
              >
                <action.icon size={20} />
                <span className="text-sm font-medium pr-2">{action.label}</span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main FAB */}
      <motion.button
        animate={{
          scale: isVisible ? 1 : 0.8,
          opacity: isVisible ? 1 : 0,
          rotate: isExpanded ? 45 : 0
        }}
        transition={{ duration: 0.16, ease: [0.2, 0.9, 0.3, 1] }}
        whileTap={{ scale: 0.95 }}
        onClick={handleMainAction}
        className={`fab flex items-center justify-center text-white ${
          isVisible ? '' : 'hidden'
        }`}
        aria-label="Add new record"
      >
        <Plus size={24} />
      </motion.button>

      {/* Backdrop */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsExpanded(false)}
            className="fixed inset-0 bg-black/20 -z-10"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingActionButton;