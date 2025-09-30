import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, TrendingUp, TrendingDown } from 'lucide-react';
import Header from '../components/Header';
import InputWithVoice from '../components/InputWithVoice';
import Button from '../components/ui/Button';
import { useAppContext } from '../context/AppContext';

const AddTransaction: React.FC = () => {
  const { customerId } = useParams<{ customerId?: string }>();
  const [selectedCustomerId, setSelectedCustomerId] = useState(customerId || '');
  const [amount, setAmount] = useState('');
  const [items, setItems] = useState('');
  const [transactionType, setTransactionType] = useState<'debt' | 'payment'>('debt');
  const [loading, setLoading] = useState(false);
  
  const { customers, addTransaction } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (customerId) {
      setSelectedCustomerId(customerId);
    }
  }, [customerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedCustomerId && amount) {
      setLoading(true);
      try {
        await addTransaction(
          selectedCustomerId,
          parseFloat(amount),
          items,
          transactionType
        );
        navigate(`/customer/${selectedCustomerId}`);
      } catch (error) {
        console.error('Error adding transaction:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B] text-white">
      <Header title="Add New Transaction" showBack={true} />

      <div className="max-w-md mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10"
        >
          {customers.length === 0 ? (
            <div className="text-center py-8">
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mb-2">
                No Customers Found
              </h3>
              <p className="text-text-secondary-light dark:text-text-secondary-dark mb-6">
                You need to add a customer first before creating transactions.
              </p>
              <Button
                variant="primary"
                onClick={() => navigate('/add-customer')}
              >
                Add Customer
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Record Transaction
                </h2>
                <p className="text-gray-300">
                  {selectedCustomer ? `Adding transaction for ${selectedCustomer.name}` : 'Add a new debt or payment transaction.'}
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {!customerId && (
                  <div className="mb-6">
                    <label htmlFor="customer" className="block text-sm font-medium text-white mb-2">
                      Customer <span className="text-red-400">*</span>
                    </label>
                    <select
                      id="customer"
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      required
                    >
                      <option value="">Select Customer</option>
                      {customers.map((customer) => (
                        <option key={customer.id} value={customer.id}>
                          {customer.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-medium text-white mb-3">
                    Transaction Type <span className="text-red-400">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        transactionType === 'debt'
                          ? 'border-red-400 bg-red-500/10'
                          : 'border-white/20 hover:border-white/30'
                      }`}
                      onClick={() => setTransactionType('debt')}
                    >
                      <TrendingUp className={`w-6 h-6 mx-auto mb-2 ${
                        transactionType === 'debt' ? 'text-red-400' : 'text-gray-400'
                      }`} />
                      <div className={`font-medium ${
                        transactionType === 'debt' 
                          ? 'text-red-400' 
                          : 'text-white'
                      }`}>
                        Debt
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Money owed
                      </div>
                    </motion.button>

                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        transactionType === 'payment'
                          ? 'border-green-400 bg-green-500/10'
                          : 'border-white/20 hover:border-white/30'
                      }`}
                      onClick={() => setTransactionType('payment')}
                    >
                      <TrendingDown className={`w-6 h-6 mx-auto mb-2 ${
                        transactionType === 'payment' ? 'text-green-400' : 'text-gray-400'
                      }`} />
                      <div className={`font-medium ${
                        transactionType === 'payment' 
                          ? 'text-green-400' 
                          : 'text-white'
                      }`}>
                        Payment
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        Money received
                      </div>
                    </motion.button>
                  </div>
                </div>

                <InputWithVoice
                  id="amount"
                  label="Amount ($)"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  type="number"
                  step="0.01"
                  min="0"
                  required
                />

                <InputWithVoice
                  id="items"
                  label={transactionType === 'debt' ? "Items/Description" : "Payment Details"}
                  value={items}
                  onChange={(e) => setItems(e.target.value)}
                  placeholder={transactionType === 'debt' ? "What was purchased?" : "Payment method or notes (optional)"}
                  multiline
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
                    disabled={!selectedCustomerId || !amount}
                  >
                    Save Transaction
                  </Button>
                </div>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AddTransaction;