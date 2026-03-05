import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Trash2, UserX, PlusCircle, CreditCard as Edit3, Phone, Printer, Share2, MessageCircle, MoreVertical } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '../components/Header';
import TransactionItem from '../components/TransactionItem';
import Toast from '../components/Toast';
import { useAppContext } from '../context/AppContext';

const CustomerProfile: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const { getCustomerById, getCustomerTransactions, deleteAllTransactions, deleteCustomer, updateCustomer } = useAppContext();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' }>({
    show: false,
    message: '',
    type: 'success'
  });

  const customer = getCustomerById(customerId || '');
  const transactions = getCustomerTransactions(customerId || '');

  React.useEffect(() => {
    if (customer) {
      setEditName(customer.name);
      setEditPhone(customer.phone || '');
    }
  }, [customer]);

  // Calculate amounts
  const totalDebt = transactions
    .filter(t => t.type === 'debt')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalPaid = transactions
    .filter(t => t.type === 'payment')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const remainingDue = totalDebt - totalPaid;
  const paymentProgress = totalDebt > 0 ? (totalPaid / totalDebt) * 100 : 0;

  const handleDeleteAll = async () => {
    if (window.confirm('Delete all transactions? This cannot be undone.')) {
      try {
        await deleteAllTransactions(customerId || '');
        setToast({
          show: true,
          message: 'All transactions deleted',
          type: 'success'
        });
      } catch (error) {
        setToast({
          show: true,
          message: 'Failed to delete transactions',
          type: 'error'
        });
      }
    }
  };

  const handleDeleteCustomer = async () => {
    if (window.confirm('Delete customer? This will delete all their transactions and cannot be undone.')) {
      try {
        await deleteCustomer(customerId || '');
        navigate('/');
      } catch (error) {
        setToast({
          show: true,
          message: 'Failed to delete customer',
          type: 'error'
        });
      }
    }
  };

  const handleSaveEdit = async () => {
    if (editName.trim()) {
      try {
        await updateCustomer(customerId || '', editName.trim(), editPhone.trim() || undefined);
        setIsEditing(false);
        setToast({
          show: true,
          message: 'Customer updated successfully',
          type: 'success'
        });
      } catch (error) {
        setToast({
          show: true,
          message: 'Failed to update customer',
          type: 'error'
        });
      }
    }
  };

  const handlePrint = () => {
    const amount = Math.abs(remainingDue);
    const status = remainingDue > 0 ? 'Amount Due' : 'Fully Paid';
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>KV Satyanarayana</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #000; 
              background: #fff; 
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px; 
              border-bottom: 2px solid #000; 
              padding-bottom: 12px; 
            }
            .header h1 { 
              margin: 0; 
              font-size: 26px; 
              color: #000; 
            }
            .customer-info { 
              margin-bottom: 20px; 
              padding: 14px;
              border: 1px solid #ddd;
              border-radius: 8px;
            }
            .amount { 
              font-size: 28px; 
              font-weight: bold; 
              color: ${remainingDue > 0 ? '#c00' : '#0a0'}; 
              text-align: center;
              margin: 16px 0;
            }
            .info-row { 
              margin: 10px 0; 
              display: flex;
              justify-content: space-between;
              padding: 6px 0;
              border-bottom: 1px dotted #ccc;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>KV Satyanarayana</h1>
            <h2>Customer Statement</h2>
          </div>
          <div class="customer-info">
            <div class="info-row">
              <span>Customer Name:</span> 
              <span>${customer?.name ?? ''}</span>
            </div>
            ${customer?.phone ? `
            <div class="info-row">
              <span>Phone:</span> 
              <span>${customer.phone}</span>
            </div>` : ''}
            <div class="info-row">
              <span>Date:</span> 
              <span>${new Date().toLocaleDateString()}</span>
            </div>
            <div class="info-row">
              <span>Status:</span> 
              <span>${status}</span>
            </div>
            <div class="amount">₹${amount.toLocaleString()}</div>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 250);
    }
  };

  const handleShare = async () => {
    const amount = Math.abs(remainingDue);
    const status = remainingDue > 0 ? 'Amount Due' : 'Fully Paid';
    const message = `📋 KV Satyanarayana\n\nCustomer: ${customer?.name ?? ''}\n${customer?.phone ? `Phone: ${customer.phone}\n` : ''}Total Bill: ₹${amount.toLocaleString()}\nStatus: ${status}\nDate: ${new Date().toLocaleDateString()}\n\nThank you`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'KV Satyanarayana',
          text: message,
        });
        return;
      } catch (error) {
        console.log('Native share failed, falling back to WhatsApp', error);
      }
    }

    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSendBillToWhatsApp = () => {
    if (!customer?.phone) {
      setToast({
        show: true,
        message: 'No phone number saved for this customer',
        type: 'error'
      });
      return;
    }

    const amount = Math.abs(remainingDue);
    const status = remainingDue > 0 ? 'Amount Due' : 'Fully Paid';
    const billMessage = `🏪 *KV Satyanarayana Kirana, Kallakuru*\n\nRespected Customer,\n\nYour bill details:\n💰 *Total Amount: ₹${amount.toLocaleString()}*\n📅 Date: ${new Date().toLocaleDateString()}\n\n${status === 'Amount Due' ? '⚠️ Payment pending' : '✅ Payment completed'}\n\nThank you 🙏`;

    let cleanPhone = customer.phone.replace(/\D/g, '');
    if (cleanPhone.length === 10 && !cleanPhone.startsWith('91')) {
      cleanPhone = '91' + cleanPhone;
    }

    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(billMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-bg-start to-bg-end">
        <Header title="Customer Not Found" showBack={true} />
        <div className="max-w-mobile mx-auto px-4 py-6">
          <div className="premium-card p-8 text-center">
            <h3 className="text-h2 mb-2">Customer Not Found</h3>
            <p className="text-body text-text-secondary mb-6">
              This customer doesn't exist or has been removed.
            </p>
            <motion.button 
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/')}
              className="btn-primary"
            >
              Back to Dashboard
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-start to-bg-end">
      <Header title={customer.name} showBack={true} />

      <div className="max-w-mobile mx-auto px-4 pb-24">
        {/* Customer Summary Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.2, 0.9, 0.3, 1] }}
          className="premium-card p-6 mb-6"
        >
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-body font-medium text-text-primary mb-2">Customer Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-gray-200 rounded-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-1 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-body font-medium text-text-primary mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-surface border border-gray-200 rounded-card text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-1 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsEditing(false)}
                  className="flex-1 py-3 px-4 border border-gray-200 rounded-card text-text-primary font-medium"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveEdit}
                  className="flex-1 btn-primary"
                >
                  Save
                </motion.button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-h1">{customer.name}</h2>
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsEditing(true)}
                      className="touch-target text-primary-1 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Customer"
                    >
                      <Edit3 size={18} />
                    </motion.button>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center text-text-secondary mb-3">
                      <Phone className="h-4 w-4 mr-2" />
                      <span className="text-body">{customer.phone}</span>
                    </div>
                  )}
                </div>
                
                <div className="relative">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowActions(!showActions)}
                    className="touch-target text-text-secondary hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <MoreVertical size={20} />
                  </motion.button>
                  
                  <AnimatePresence>
                    {showActions && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute right-0 top-12 bg-surface rounded-card shadow-card border border-gray-100 py-2 min-w-48 z-10"
                      >
                        <button
                          onClick={() => {
                            handleDeleteAll();
                            setShowActions(false);
                          }}
                          className="w-full px-4 py-2 text-left text-body text-text-primary hover:bg-gray-50 transition-colors"
                        >
                          Delete All Transactions
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteCustomer();
                            setShowActions(false);
                          }}
                          className="w-full px-4 py-2 text-left text-body text-danger hover:bg-red-50 transition-colors"
                        >
                          Delete Customer
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Payment Progress */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-small text-text-secondary">Payment Progress</span>
                  <span className="text-small text-text-secondary">{Math.round(paymentProgress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${paymentProgress}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="bg-gradient-to-r from-primary-1 to-primary-2 h-2 rounded-full"
                  />
                </div>
              </div>

              {/* Amount Summary */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center">
                  <p className="text-small text-text-secondary mb-1">Total</p>
                  <p className="text-h2">₹{totalDebt.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-small text-text-secondary mb-1">Paid</p>
                  <p className="text-h2 text-success">₹{totalPaid.toLocaleString()}</p>
                </div>
                <div className="text-center">
                  <p className="text-small text-text-secondary mb-1">Due</p>
                  <p className={`text-h2 ${remainingDue <= 0 ? 'text-success' : 'text-danger'}`}>
                    ₹{Math.max(0, remainingDue).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(`/add-transaction/${customerId}`)}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  <PlusCircle size={20} className="mr-2" />
                  Add New Transaction
                </motion.button>
                
                <div className="grid grid-cols-3 gap-3">
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handlePrint}
                    className="py-3 px-4 bg-gray-100 text-text-primary rounded-card font-medium hover:bg-gray-200 transition-colors flex items-center justify-center"
                  >
                    <Printer size={16} className="mr-1" />
                    Print
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={handleShare}
                    className="py-3 px-4 bg-green-100 text-success rounded-card font-medium hover:bg-green-200 transition-colors flex items-center justify-center"
                  >
                    <Share2 size={16} className="mr-1" />
                    Share
                  </motion.button>
                  {customer.phone ? (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handleSendBillToWhatsApp}
                      className="py-3 px-4 bg-green-100 text-success rounded-card font-medium hover:bg-green-200 transition-colors flex items-center justify-center"
                    >
                      <MessageCircle size={16} className="mr-1" />
                      WhatsApp
                    </motion.button>
                  ) : (
                    <button
                      disabled
                      className="py-3 px-4 bg-gray-50 text-text-muted rounded-card font-medium cursor-not-allowed flex items-center justify-center"
                      title="No phone number saved"
                    >
                      <MessageCircle size={16} className="mr-1" />
                      WhatsApp
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Transaction History */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.2, 0.9, 0.3, 1] }}
          className="premium-card overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-h2 flex items-center">
              <Clock size={18} className="mr-2 text-text-secondary" />
              Transaction History
            </h2>
            <span className="text-small text-text-secondary">
              {transactions.length} transactions
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {transactions.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-body text-text-secondary">No transactions yet</p>
              </div>
            ) : (
              transactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <TransactionItem transaction={transaction} />
                </motion.div>
              ))
            )}
          </div>
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

export default CustomerProfile;