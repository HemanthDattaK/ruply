import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import InputWithVoice from '../components/InputWithVoice';
import Button from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';

const AddCustomer: React.FC = () => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const { addCustomer } = useAppContext();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customerName.trim()) {
      setLoading(true);
      try {
        await addCustomer(customerName.trim(), customerPhone.trim() || undefined);
        navigate('/');
      } catch (error) {
        console.error('Error adding customer:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B] text-white">
      <Header title="Add New Customer" showBack={true} />

      <div className="max-w-md mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Create Customer Profile
            </h2>
            <p className="text-gray-300">
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

            <InputWithVoice
              id="customerPhone"
              label="Phone Number (Optional)"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="Enter phone number"
              type="tel"
            />

            <div className="flex space-x-4">
              <Button
                type="button"
                className="flex-1 border border-white/20 text-white hover:bg-white/10"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                loading={loading}
                disabled={!customerName.trim()}
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