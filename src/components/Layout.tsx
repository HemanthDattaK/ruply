import React from 'react';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2000,
          className: 'bg-white shadow-lg rounded-lg p-4',
          success: {
            iconTheme: {
              primary: '#2CB67D',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#E15B60',
              secondary: 'white',
            },
          },
        }}
      />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
    </div>
  );
}

export default Layout