import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingDown, Target, Calendar, DollarSign } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: React.ReactNode;
  delay?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon, 
  delay = 0 
}) => {
  const [displayValue, setDisplayValue] = useState('0');
  
  useEffect(() => {
    // Animate number counting
    const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ''));
    if (!isNaN(numericValue)) {
      let start = 0;
      const duration = 1000;
      const increment = numericValue / (duration / 16);
      
      const timer = setInterval(() => {
        start += increment;
        if (start >= numericValue) {
          setDisplayValue(value);
          clearInterval(timer);
        } else {
          const formattedValue = value.includes('$') 
            ? `$${Math.floor(start).toLocaleString()}`
            : Math.floor(start).toString();
          setDisplayValue(formattedValue);
        }
      }, 16);
      
      return () => clearInterval(timer);
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  const changeColorClass = {
    positive: 'text-success-light dark:text-success-dark',
    negative: 'text-error-light dark:text-error-dark',
    neutral: 'text-text-secondary-light dark:text-text-secondary-dark'
  };

  return (
    <motion.div
      className="dashboard-card bg-card-light dark:bg-card-dark rounded-xl p-6 shadow-card border border-gray-100 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-text-secondary-light dark:text-text-secondary-dark mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark counter">
            {displayValue}
          </p>
          {change && (
            <p className={`text-sm mt-1 ${changeColorClass[changeType]}`}>
              {change}
            </p>
          )}
        </div>
        <div className="p-3 bg-primary-100 dark:bg-primary-500/20 rounded-lg text-primary-500">
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

interface DashboardStatsProps {
  totalDebt: number;
  monthlyPayment: number;
  debtFreeDate: string;
  totalPaid: number;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
  totalDebt,
  monthlyPayment,
  debtFreeDate,
  totalPaid
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatsCard
        title="Total Debt Remaining"
        value={formatCurrency(totalDebt)}
        change="-$2,400 this month"
        changeType="positive"
        icon={<TrendingDown className="w-6 h-6" />}
        delay={0}
      />
      <StatsCard
        title="Monthly Payment"
        value={formatCurrency(monthlyPayment)}
        icon={<DollarSign className="w-6 h-6" />}
        delay={0.05}
      />
      <StatsCard
        title="Debt-Free Date"
        value={formatDate(debtFreeDate)}
        change="3 months ahead"
        changeType="positive"
        icon={<Target className="w-6 h-6" />}
        delay={0.1}
      />
      <StatsCard
        title="Total Paid Off"
        value={formatCurrency(totalPaid)}
        change="+$1,200 this month"
        changeType="positive"
        icon={<Calendar className="w-6 h-6" />}
        delay={0.15}
      />
    </div>
  );
};

export default DashboardStats;