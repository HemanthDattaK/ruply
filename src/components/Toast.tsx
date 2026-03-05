import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
  showUndo?: boolean;
  onUndo?: () => void;
}

const Toast: React.FC<ToastProps> = ({
  message,
  type,
  isVisible,
  onClose,
  duration = 3500,
  showUndo = false,
  onUndo
}) => {
  useEffect(() => {
    if (isVisible && !showUndo) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose, showUndo]);

  const icons = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertCircle,
  };

  const colors = {
    success: 'bg-success text-white',
    error: 'bg-danger text-white',
    warning: 'bg-warning text-white',
  };

  const Icon = icons[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.95 }}
          transition={{ duration: 0.26, ease: [0.2, 0.9, 0.3, 1] }}
          className="fixed bottom-20 left-4 right-4 z-50 max-w-mobile mx-auto"
        >
          <div className={`${colors[type]} rounded-lg p-4 shadow-lg flex items-center justify-between`}>
            <div className="flex items-center space-x-3">
              <Icon size={20} />
              <span className="text-body font-medium">{message}</span>
            </div>
            
            <div className="flex items-center space-x-2">
              {showUndo && onUndo && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={onUndo}
                  className="text-sm font-semibold underline"
                >
                  Undo
                </motion.button>
              )}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="touch-target"
              >
                <X size={18} />
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Toast;