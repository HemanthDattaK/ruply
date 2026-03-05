import React from 'react';
import { Transaction } from '../types';
import { ArrowUpCircle, ArrowDownCircle, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const { deleteTransaction } = useAppContext();
  const date = new Date(transaction.date).toLocaleDateString();
  const time = new Date(transaction.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const isDebt = transaction.type === 'debt';

  const handleDelete = async () => {
    if (window.confirm('Delete this transaction? This cannot be undone.')) {
      await deleteTransaction(
        transaction.id,
        transaction.customer_id,
        transaction.amount,
        transaction.type
      );
    }
  };

  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start">
        <div className="flex items-start flex-1">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
            isDebt ? 'bg-red-50' : 'bg-green-50'
          }`}>
            {isDebt ? (
              <ArrowUpCircle size={20} className="text-danger" />
            ) : (
              <ArrowDownCircle size={20} className="text-success" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-body font-medium">
                {isDebt ? 'Debt' : 'Payment'} - ₹{transaction.amount.toLocaleString()}
              </span>
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-small text-text-secondary">{date}</div>
                  <div className="text-small text-text-muted">{time}</div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDelete}
                  className="touch-target text-text-muted hover:text-danger transition-colors rounded-lg"
                  aria-label="Delete transaction"
                >
                  <Trash2 size={16} />
                </motion.button>
              </div>
            </div>
            {transaction.items && (
              <p className="text-small text-text-secondary truncate">
                {transaction.items}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;