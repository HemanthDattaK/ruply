import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import InputWithVoice from '../components/InputWithVoice';
import Button from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';

const AddCustomer: React.FC = () => {
  const [customerName, setCustomerName] = useState('');
  const [loading, setLoading] = useState(false);
  const { addCustomer } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customerName.trim()) {
      setLoading(true);
      try {
        await addCustomer(customerName.trim());
        navigate('/');
      } catch (error) {
        console.error('Error adding customer:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      <Header title="Add New Customer" showBack={true} />

      <div className="max-w-md mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-card border border-gray-100 dark:border-gray-700"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
              Create Customer Profile
            </h2>
            <p className="text-text-secondary-light dark:text-text-secondary-dark">
              Add a new customer to start tracking their debt and payments.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <InputWithVoice
              id="customerName"
              label="Customer Name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              required
            />

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={!customerName.trim()}
                className="flex-1"
              >
                Save Customer
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default AddCustomer;