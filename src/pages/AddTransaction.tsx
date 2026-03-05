import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CreditCard, TrendingUp, TrendingDown, User, Package, IndianRupee } from 'lucide-react';
import Header from '../components/Header';
import Toast from '../components/Toast';
import { useAppContext } from '../context/AppContext';

const AddTransaction: React.FC = () => {
  const { customerId } = useParams<{ customerId?: string }>();
  const [selectedCustomerId, setSelectedCustomerId] = useState(customerId || '');
  const [amount, setAmount] = useState('');
  const [items, setItems] = useState('');
  const [transactionType, setTransactionType] = useState<'debt' | 'payment'>('debt');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ customer?: string; amount?: string }>({});
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });
  
  const { customers, addTransaction } = useAppContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (customerId) {
      setSelectedCustomerId(customerId);
    }
  }, [customerId]);

  const validateForm = () => {
    const newErrors: { customer?: string; amount?: string } = {};
    
    if (!selectedCustomerId) {
      newErrors.customer = 'Please select a customer';
    }
    
    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
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
      await addTransaction(
        selectedCustomerId,
        parseFloat(amount),
        items,
        transactionType
      );

      setToast({
        show: true,
        message: `${transactionType === 'debt' ? 'Debt' : 'Payment'} added successfully!`,
        type: 'success'
      });

      setTimeout(() => {
        navigate(`/customer/${selectedCustomerId}`);
      }, 1000);

    } catch (error) {
      console.error('Error adding transaction:', error);
      setToast({
        show: true,
        message: 'Failed to add transaction. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-start to-bg-end">
      <Header title="Add Transaction" showBack={true} />

      <div className="max-w-mobile mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.2, 0.9, 0.3, 1] }}
          className="premium-card p-6"
        >
          {customers.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CreditCard className="w-8 h-8 text-text-muted" />
              </div>
              <h3 className="text-h2 mb-2">No Customers Found</h3>
              <p className="text-body text-text-secondary mb-6">
                You need to add a customer first before creating transactions.
              </p>
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate('/add-customer')}
                className="btn-primary"
              >
                Add Customer
              </motion.button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-h1 mb-2">Record Transaction</h2>
                <p className="text-body text-text-secondary">
                  {selectedCustomer 
                    ? `Adding transaction for ${selectedCustomer.name}` 
                    : 'Add a new debt or payment transaction.'
                  }
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Customer Selection */}
                {!customerId && (
                  <div>
                    <label htmlFor="customer" className="block text-body font-medium text-text-primary mb-2">
                      Customer <span className="text-danger">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary h-5 w-5" />
                      <select
                        id="customer"
                        value={selectedCustomerId}
                        onChange={(e) => {
                          setSelectedCustomerId(e.target.value);
                          if (errors.customer) setErrors({ ...errors, customer: undefined });
                        }}
                        className={`w-full pl-12 pr-4 py-4 bg-surface border rounded-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-1 focus:border-transparent transition-all appearance-none ${
                          errors.customer ? 'border-danger error-shake' : 'border-gray-200'
                        }`}
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
                    {errors.customer && (
                      <p className="text-small text-danger mt-1">{errors.customer}</p>
                    )}
                  </div>
                )}

                {/* Transaction Type */}
                <div>
                  <label className="block text-body font-medium text-text-primary mb-3">
                    Transaction Type <span className="text-danger">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-card border-2 transition-all ${
                        transactionType === 'debt'
                          ? 'border-danger bg-red-50'
                          : 'border-gray-200 hover:border-gray-300 bg-surface'
                      }`}
                      onClick={() => setTransactionType('debt')}
                    >
                      <TrendingUp className={`w-6 h-6 mx-auto mb-2 ${
                        transactionType === 'debt' ? 'text-danger' : 'text-text-muted'
                      }`} />
                      <div className={`font-medium ${
                        transactionType === 'debt' 
                          ? 'text-danger' 
                          : 'text-text-primary'
                      }`}>
                        Debt
                      </div>
                      <div className="text-small text-text-secondary mt-1">
                        Money owed
                      </div>
                    </motion.button>

                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.98 }}
                      className={`p-4 rounded-card border-2 transition-all ${
                        transactionType === 'payment'
                          ? 'border-success bg-green-50'
                          : 'border-gray-200 hover:border-gray-300 bg-surface'
                      }`}
                      onClick={() => setTransactionType('payment')}
                    >
                      <TrendingDown className={`w-6 h-6 mx-auto mb-2 ${
                        transactionType === 'payment' ? 'text-success' : 'text-text-muted'
                      }`} />
                      <div className={`font-medium ${
                        transactionType === 'payment' 
                          ? 'text-success' 
                          : 'text-text-primary'
                      }`}>
                        Payment
                      </div>
                      <div className="text-small text-text-secondary mt-1">
                        Money received
                      </div>
                    </motion.button>
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label htmlFor="amount" className="block text-body font-medium text-text-primary mb-2">
                    Amount <span className="text-danger">*</span>
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary h-5 w-5" />
                    <input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        if (errors.amount) setErrors({ ...errors, amount: undefined });
                      }}
                      placeholder="0.00"
                      className={`w-full pl-12 pr-4 py-4 bg-surface border rounded-card text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-1 focus:border-transparent transition-all ${
                        errors.amount ? 'border-danger error-shake' : 'border-gray-200'
                      }`}
                      required
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-small text-danger mt-1">{errors.amount}</p>
                  )}
                </div>

                {/* Items/Description */}
                <div>
                  <label htmlFor="items" className="block text-body font-medium text-text-primary mb-2">
                    {transactionType === 'debt' ? "Items/Description" : "Payment Details"}
                  </label>
                  <div className="relative">
                    <Package className="absolute left-4 top-4 text-text-secondary h-5 w-5" />
                    <textarea
                      id="items"
                      value={items}
                      onChange={(e) => setItems(e.target.value)}
                      placeholder={transactionType === 'debt' 
                        ? "Item name, e.g., Rice 10kg" 
                        : "Payment method or notes (optional)"
                      }
                      className="w-full pl-12 pr-4 py-4 bg-surface border border-gray-200 rounded-card text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-1 focus:border-transparent transition-all resize-none"
                      rows={3}
                    />
                  </div>
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
                    disabled={loading || !selectedCustomerId || !amount}
                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin-loader mr-2" />
                        Saving...
                      </div>
                    ) : (
                      'Save Transaction'
                    )}
                  </motion.button>
                </div>
              </form>
            </>
          )}
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

export default AddTransaction;