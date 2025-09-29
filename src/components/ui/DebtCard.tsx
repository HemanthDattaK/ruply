import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, TrendingDown, Calendar } from 'lucide-react';

interface DebtCardProps {
  debt: {
    id: string;
    name: string;
    balance: number;
    originalAmount: number;
    interestRate: number;
    minimumPayment: number;
    dueDate: string;
    type: 'credit_card' | 'loan' | 'mortgage' | 'other';
  };
  onClick?: () => void;
}

const DebtCard: React.FC<DebtCardProps> = ({ debt, onClick }) => {
  const progressPercentage = ((debt.originalAmount - debt.balance) / debt.originalAmount) * 100;
  
  const getDebtIcon = (type: string) => {
    switch (type) {
      case 'credit_card':
        return <CreditCard className="w-6 h-6" />;
      case 'loan':
        return <TrendingDown className="w-6 h-6" />;
      default:
        return <CreditCard className="w-6 h-6" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      className="debt-card group"
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-primary-100 dark:bg-primary-500/20 rounded-lg text-primary-500">
            {getDebtIcon(debt.type)}
          </div>
          <div>
            <h3 className="font-semibold text-text-primary-light dark:text-text-primary-dark">
              {debt.name}
            </h3>
            <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
              {debt.interestRate}% APR
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
            {formatCurrency(debt.balance)}
          </p>
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            of {formatCurrency(debt.originalAmount)}
          </p>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark">
            Progress
          </span>
          <span className="text-sm font-semibold text-secondary-500">
            {progressPercentage.toFixed(1)}% paid off
          </span>
        </div>
        <div className="progress-bar">
          <motion.div
            className="progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 1, delay: 0.2 }}
          />
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-1 text-text-secondary-light dark:text-text-secondary-dark">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">Due {formatDate(debt.dueDate)}</span>
        </div>
        <div className="text-right">
          <p className="text-sm text-text-secondary-light dark:text-text-secondary-dark">
            Min. Payment
          </p>
          <p className="font-semibold text-text-primary-light dark:text-text-primary-dark">
            {formatCurrency(debt.minimumPayment)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default DebtCard;