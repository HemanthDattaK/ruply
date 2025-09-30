import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Trash2, UserX, PlusCircle, Edit, Phone } from 'lucide-react';
import Header from '../components/Header';
import TransactionItem from '../components/TransactionItem';
import { useAppContext } from '../context/AppContext';
import FloatingActionButton from '../components/FloatingActionButton';

const CustomerProfile: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const { getCustomerById, getCustomerTransactions, deleteAllTransactions, deleteCustomer, updateCustomer } = useAppContext();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = React.useState(false);
  const [editName, setEditName] = React.useState('');
  const [editPhone, setEditPhone] = React.useState('');

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
    if (editName.trim() && customer) {
      await updateCustomer(customer.id, editName.trim(), editPhone.trim() || undefined);
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    if (customer) {
      setEditName(customer.name);
      setEditPhone(customer.phone || '');
    }
    setIsEditing(false);
  };
  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B] text-white">
        <Header title="Customer Not Found\" showBack={true} />
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
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Customer name"
                  />
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Phone number (optional)"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveEdit}
                      className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">{customer.name}</h2>
                  {customer.phone && (
                    <div className="flex items-center text-gray-300 mb-2">
                      <Phone className="h-4 w-4 mr-1" />
                      {customer.phone}
                    </div>
                  )}
                </div>
              )}
              <p className="text-gray-300 mb-1">Amount Due</p>
              <p className={`text-3xl font-bold ${customer.totalDebt && customer.totalDebt > 0 ? 'text-red-400' : 'text-green-400'}`}>
                ₹ {typeof customer.totalDebt === 'number' ? customer.totalDebt.toFixed(2) : '0.00'}
              </p>
            </div>
            <div className="flex space-x-2">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-400 hover:bg-blue-400/10 transition-colors p-2 rounded-xl"
                  title="Edit Customer"
                >
                  <Edit size={20} />
                </button>
              )}
              <button
                onClick={handleDeleteCustomer}
                className="text-red-400 hover:bg-red-400/10 transition-colors p-2 rounded-xl"
                title="Delete Customer"
              >
                <UserX size={20} />
              </button>
            </div>
          </div>
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