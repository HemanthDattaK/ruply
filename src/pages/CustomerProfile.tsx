import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Trash2, UserX, PlusCircle } from 'lucide-react';
import Header from '../components/Header';
import TransactionItem from '../components/TransactionItem';
import { useAppContext } from '../context/AppContext';
import FloatingActionButton from '../components/FloatingActionButton';

const CustomerProfile: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const { getCustomerById, getCustomerTransactions, deleteAllTransactions, deleteCustomer } = useAppContext();
  const navigate = useNavigate();

  const customer = getCustomerById(customerId || '');
  const transactions = getCustomerTransactions(customerId || '');

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
          <div className="flex justify-between items-start mb-4">
            <div>
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