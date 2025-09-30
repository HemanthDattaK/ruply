import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Trash2, UserX, PlusCircle, CreditCard as Edit, Phone, Printer, Share2 } from 'lucide-react';
import { useState } from 'react';
import Header from '../components/Header';
import TransactionItem from '../components/TransactionItem';
import { useAppContext } from '../context/AppContext';
import FloatingActionButton from '../components/FloatingActionButton';
import Button from '../components/ui/Button';

const CustomerProfile: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const { getCustomerById, getCustomerTransactions, deleteAllTransactions, deleteCustomer, updateCustomer } = useAppContext();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const customer = getCustomerById(customerId || '');
  const transactions = getCustomerTransactions(customerId || '');

  React.useEffect(() => {
    if (customer) {
      setEditName(customer.name);
      setEditPhone(customer.phone || '');
    }
  }, [customer]);

  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to delete all transactions? This cannot be undone.')) {
      await deleteAllTransactions(customerId || '');
    }
  };

  const handleDeleteCustomer = async () => {
    if (window.confirm('Are you sure you want to delete this customer? This will delete all their transactions and cannot be undone.')) {
      await deleteCustomer(customerId || '');
      navigate('/');
    }
  };

  const handleSaveEdit = async () => {
    if (editName.trim()) {
      await updateCustomer(customerId || '', editName.trim(), editPhone.trim() || undefined);
      setIsEditing(false);
    }
  };

  const handlePrint = () => {
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill - Ruply</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; color: #000; background: #fff; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 20px; }
            .customer-info { margin-bottom: 20px; }
            .amount { font-size: 24px; font-weight: bold; color: ${customer && customer.totalDebt > 0 ? '#dc2626' : '#16a34a'}; }
            .info-row { margin: 10px 0; }
            .label { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Ruply</h1>
            <h2>Customer Statement</h2>
          </div>
          <div class="customer-info">
            <div class="info-row"><span class="label">Customer:</span> ${customer?.name}</div>
            ${customer?.phone ? `<div class="info-row"><span class="label">Phone:</span> ${customer.phone}</div>` : ''}
            <div class="info-row"><span class="label">Amount:</span> <span class="amount">₹${customer ? Math.abs(customer.totalDebt).toLocaleString() : '0'}</span></div>
            <div class="info-row"><span class="label">Status:</span> ${customer && customer.totalDebt > 0 ? 'Amount Due' : 'Paid'}</div>
            <div class="info-row"><span class="label">Date:</span> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</div>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleShare = () => {
    const message = `Bill - Ruply\n\nCustomer: ${customer?.name}\n${customer?.phone ? `Phone: ${customer.phone}\n` : ''}Amount: ₹${customer ? Math.abs(customer.totalDebt).toLocaleString() : '0'}\n${customer && customer.totalDebt > 0 ? 'Amount Due' : 'Paid'}\nDate: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Bill - Ruply`,
        text: message,
      });
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };
  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B] text-white">
        <Header title="Customer Not Found" showBack={true} />
        <div className="p-4 text-center">
          <p className="mb-4 text-gray-300">This customer doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-blue-500/20 text-white px-4 py-2 rounded-xl hover:bg-blue-500/30 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B] text-white">
      <Header title={customer.name} showBack={true} />

      <div className="p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-5">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Customer Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 border border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-bold text-white">{customer.name}</h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-blue-400 hover:bg-blue-400/10 transition-colors p-1 rounded-lg"
                      title="Edit Customer"
                    >
                      <Edit size={18} />
                    </button>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center text-gray-300 mb-2">
                      <Phone className="h-4 w-4 mr-2" />
                      {customer.phone}
                    </div>
                  )}
                  <p className="text-gray-300 mb-1">Total Outstanding</p>
                  <p className={`text-3xl font-bold ${customer.totalDebt && customer.totalDebt > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    ₹ {typeof customer.totalDebt === 'number' ? customer.totalDebt.toFixed(2) : '0.00'}
                  </p>
                </div>
                <button
                  onClick={handleDeleteCustomer}
                  className="text-red-400 hover:bg-red-400/10 transition-colors p-2 rounded-xl"
                  title="Delete Customer"
                >
                  <UserX size={24} />
                </button>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-3 mt-4">
                <button
                  onClick={() => navigate(`/add-transaction/${customerId}`)}
                  className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-2 px-4 rounded-xl transition-colors flex items-center justify-center"
                >
                  <PlusCircle size={18} className="mr-2" />
                  Add Transaction
                </button>
                <button
                  onClick={handlePrint}
                  className="flex-1 bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 py-2 px-4 rounded-xl transition-colors flex items-center justify-center"
                >
                  <Printer size={18} className="mr-2" />
                  Print
                </button>
                <button
                  onClick={handleShare}
                  className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 px-4 rounded-xl transition-colors flex items-center justify-center"
                >
                  <Share2 size={18} className="mr-2" />
                  Share
                </button>
              </div>
            </>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden mb-5">
          <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
            <h2 className="font-semibold flex items-center text-white">
              <Clock size={18} className="mr-2 text-gray-400" />
              Transaction History
            </h2>
            {transactions.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="flex items-center text-red-400 hover:text-red-300 transition-colors text-sm"
              >
                <Trash2 size={16} className="mr-1" />
                Delete All
              </button>
            )}
          </div>

          <div className="divide-y divide-white/10 px-4">
            {transactions.length === 0 ? (
              <p className="py-6 text-center text-gray-400">No transactions yet</p>
            ) : (
              transactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))
            )}
          </div>
        </div>
      </div>

      <FloatingActionButton
        onClick={() => navigate(`/add-transaction/${customerId}`)}
        icon={<PlusCircle size={24} />}
        label="Add New Transaction"
      />
    </div>
  );
};

export default CustomerProfile;