import React from 'react';
import { Transaction } from '../types';
import { ArrowUpCircle, ArrowDownCircle, Trash2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const { deleteTransaction } = useAppContext();
  const date = new Date(transaction.date).toLocaleDateString();
  const isDebt = transaction.type === 'debt';

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await deleteTransaction(
        transaction.id,
        transaction.customer_id,
        transaction.amount,
        transaction.type
      );
    }
  };

  return (
    <div className="py-3">
      <div className="flex justify-between items-center mb-1">
        <div className="flex items-center">
          {isDebt ? (
            <ArrowUpCircle size={20} className="text-red-400 mr-2" />
          ) : (
            <ArrowDownCircle size={20} className="text-green-400 mr-2" />
          )}
          <span className="font-medium text-white">
            {isDebt ? 'Debt' : 'Payment'} - ₹ {transaction.amount.toFixed(2)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-400">{date}</span>
          <button
            onClick={handleDelete}
            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
            aria-label="Delete transaction"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
      {transaction.items && (
        <p className="text-sm text-gray-400 ml-7">{transaction.items}</p>
      )}
    </div>
  );
};

export default TransactionItem;