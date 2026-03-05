import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
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
  
const { customers, addTransaction, getCustomerById } = useAppContext();
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
        // 1. Save the transaction
        await addTransaction(
          selectedCustomerId,
          parseFloat(amount),
          items,
          transactionType
        );

        // 2. Show an immediate success message
        toast.success(`${transactionType === 'debt' ? 'Debt' : 'Payment'} added successfully!`);

        // 3. Navigate back to the customer profile
        navigate(`/customer/${selectedCustomerId}`);

      } catch (error) {
        console.error('Error adding transaction:', error);
        toast.error('Failed to add transaction. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Add New Transaction" showBack={true} />

      <div className="max-w-md mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          {customers.length === 0 ? (
            <div className="text-center py-8">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No Customers Found
              </h3>
              <p className="text-gray-600 mb-6">
                You need to add a customer first before creating transactions.
              </p>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => navigate('/add-customer')}
              >
                Add Customer
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Record Transaction
                </h2>
                <p className="text-gray-600">
                  {selectedCustomer ? `Adding transaction for ${selectedCustomer.name}` : 'Add a new debt or payment transaction.'}
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {!customerId && (
                  <div className="mb-6">
                    <label htmlFor="customer" className="block text-sm font-medium text-gray-900 mb-2">
                      Customer <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="customer"
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                      className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
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
                  <label className="block text-sm font-medium text-gray-900 mb-3">
                    Transaction Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        transactionType === 'debt'
                          ? 'border-red-300 bg-red-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      onClick={() => setTransactionType('debt')}
                    >
                      <TrendingUp className={`w-6 h-6 mx-auto mb-2 ${
                        transactionType === 'debt' ? 'text-red-600' : 'text-gray-500'
                      }`} />
                      <div className={`font-medium ${
                        transactionType === 'debt' 
                          ? 'text-red-600' 
                          : 'text-gray-900'
                      }`}>
                        Debt
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Money owed
                      </div>
                    </motion.button>

                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        transactionType === 'payment'
                          ? 'border-green-300 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                      onClick={() => setTransactionType('payment')}
                    >
                      <TrendingDown className={`w-6 h-6 mx-auto mb-2 ${
                        transactionType === 'payment' ? 'text-green-600' : 'text-gray-500'
                      }`} />
                      <div className={`font-medium ${
                        transactionType === 'payment' 
                          ? 'text-green-600' 
                          : 'text-gray-900'
                      }`}>
                        Payment
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Money received
                      </div>
                    </motion.button>
                  </div>
                </div>

                <InputWithVoice
                  id="amount"
                  label="Amount (₹)"
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
                    className="flex-1"
                    onClick={() => navigate(-1)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
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