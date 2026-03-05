import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Phone } from 'lucide-react';
import Header from '../components/Header';
import Toast from '../components/Toast';
import { useAppContext } from '../context/AppContext';

const AddCustomer: React.FC = () => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });
  
  const { addCustomer } = useAppContext();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: { name?: string; phone?: string } = {};
    
    if (!customerName.trim()) {
      newErrors.name = 'Customer name is required';
    }
    
    if (customerPhone && !/^\d{10}$/.test(customerPhone.replace(/\D/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await addCustomer(customerName.trim(), customerPhone.trim() || undefined);
      setToast({
        show: true,
        message: 'Customer added successfully!',
        type: 'success'
      });
      
      setTimeout(() => {
        navigate('/');
      }, 1000);
    } catch (error) {
      console.error('Error adding customer:', error);
      setToast({
        show: true,
        message: 'Failed to add customer. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-start to-bg-end">
      <Header title="Add Customer" showBack={true} />

      <div className="max-w-mobile mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.2, 0.9, 0.3, 1] }}
          className="premium-card p-6"
        >
          <div className="mb-6">
            <h2 className="text-h1 mb-2">Create Customer Profile</h2>
            <p className="text-body text-text-secondary">
              Add a new customer to start tracking their transactions.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Customer Name */}
            <div>
              <label htmlFor="customerName" className="block text-body font-medium text-text-primary mb-2">
                Customer Name <span className="text-danger">*</span>
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary h-5 w-5" />
                <input
                  id="customerName"
                  type="text"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (errors.name) setErrors({ ...errors, name: undefined });
                  }}
                  placeholder="e.g., Ramesh (shop regular)"
                  className={`w-full pl-12 pr-4 py-4 bg-surface border rounded-card text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-1 focus:border-transparent transition-all ${
                    errors.name ? 'border-danger error-shake' : 'border-gray-200'
                  }`}
                  required
                />
              </div>
              {errors.name && (
                <p className="text-small text-danger mt-1">{errors.name}</p>
              )}
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="customerPhone" className="block text-body font-medium text-text-primary mb-2">
                Phone Number (Optional)
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary h-5 w-5" />
                <input
                  id="customerPhone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    if (errors.phone) setErrors({ ...errors, phone: undefined });
                  }}
                  placeholder="Enter 10-digit phone number"
                  className={`w-full pl-12 pr-4 py-4 bg-surface border rounded-card text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-1 focus:border-transparent transition-all ${
                    errors.phone ? 'border-danger error-shake' : 'border-gray-200'
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-small text-danger mt-1">{errors.phone}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <motion.button
                type="button"
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(-1)}
                className="flex-1 py-4 px-6 border border-gray-200 rounded-card text-text-primary font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileTap={{ scale: 0.98 }}
                disabled={loading || !customerName.trim()}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin-loader mr-2" />
                    Saving...
                  </div>
                ) : (
                  'Save Customer'
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ ...toast, show: false })}
      />
    </div>
  );
};

export default AddCustomer;