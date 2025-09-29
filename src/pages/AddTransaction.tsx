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
    <div className="min-h-screen bg-background-light dark:bg-background-dark transition-colors duration-300">
      <Header title="Add New Transaction" showBack={true} />

      <div className="max-w-md mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-card border border-gray-100 dark:border-gray-700"
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
                <h2 className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
                  Record Transaction
                </h2>
                <p className="text-text-secondary-light dark:text-text-secondary-dark">
                  {selectedCustomer ? `Adding transaction for ${selectedCustomer.name}` : 'Add a new debt or payment transaction.'}
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {!customerId && (
                  <div className="mb-6">
                    <label htmlFor="customer" className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                      Customer <span className="text-error-light dark:text-error-dark">*</span>
                    </label>
                    <select
                      id="customer"
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full px-4 py-3 bg-card-light dark:bg-card-dark border border-gray-300 dark:border-gray-600 rounded-lg text-text-primary-light dark:text-text-primary-dark focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
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
                  <label className="block text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-3">
                    Transaction Type <span className="text-error-light dark:text-error-dark">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        transactionType === 'debt'
                          ? 'border-error-light dark:border-error-dark bg-red-50 dark:bg-red-500/10'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      onClick={() => setTransactionType('debt')}
                    >
                      <TrendingUp className={`w-6 h-6 mx-auto mb-2 ${
                        transactionType === 'debt' ? 'text-error-light dark:text-error-dark' : 'text-gray-400'
                      }`} />
                      <div className={`font-medium ${
                        transactionType === 'debt' 
                          ? 'text-error-light dark:text-error-dark' 
                          : 'text-text-primary-light dark:text-text-primary-dark'
                      }`}>
                        Debt
                      </div>
                      <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
                        Money owed
                      </div>
                    </motion.button>

                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        transactionType === 'payment'
                          ? 'border-success-light dark:border-success-dark bg-green-50 dark:bg-green-500/10'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                      onClick={() => setTransactionType('payment')}
                    >
                      <TrendingDown className={`w-6 h-6 mx-auto mb-2 ${
                        transactionType === 'payment' ? 'text-success-light dark:text-success-dark' : 'text-gray-400'
                      }`} />
                      <div className={`font-medium ${
                        transactionType === 'payment' 
                          ? 'text-success-light dark:text-success-dark' 
                          : 'text-text-primary-light dark:text-text-primary-dark'
                      }`}>
                        Payment
                      </div>
                      <div className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-1">
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
                    disabled={!selectedCustomerId || !amount}
                    className="flex-1"
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