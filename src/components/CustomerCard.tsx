import React from 'react';
import { Link } from 'react-router-dom';
import { User, Phone, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

interface Customer {
  id: string;
  name: string;
  phone?: string;
  totalDebt: number;
}

interface CustomerCardProps {
  customer: Customer;
}

export default function CustomerCard({ customer }: CustomerCardProps) {
  const { getCustomerTransactions } = useAppContext();
  const transactions = getCustomerTransactions(customer.id);
  
  // Calculate paid amount and remaining due
  const totalDebt = transactions
    .filter(t => t.type === 'debt')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalPaid = transactions
    .filter(t => t.type === 'payment')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const remainingDue = totalDebt - totalPaid;
  
  // Get recent items
  const recentDebtTransactions = transactions
    .filter(t => t.type === 'debt')
    .slice(0, 2);
  
  // Determine status and color
  const getStatusColor = () => {
    if (remainingDue <= 0) return 'green';
    if (totalPaid > 0) return 'orange';
    return 'red';
  };
  
  const statusColor = getStatusColor();
  const statusColors = {
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-700',
      dot: 'bg-green-500'
    },
    orange: {
      bg: 'bg-orange-50',
      border: 'border-orange-200', 
      text: 'text-orange-700',
      dot: 'bg-orange-500'
    },
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-700',
      dot: 'bg-red-500'
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
    >
      <Link to={`/customer/${customer.id}`} className="block">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{customer.name}</h3>
                {customer.phone && (
                  <div className="flex items-center text-xs text-gray-500 mt-0.5">
                    <Phone className="h-3 w-3 mr-1" />
                    {customer.phone}
                  </div>
                )}
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>

          {/* Items */}
          {recentDebtTransactions.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-gray-500 mb-1">Recent Items:</p>
              <div className="space-y-1">
                {recentDebtTransactions.map((transaction, index) => (
                  <p key={index} className="text-xs text-gray-700 truncate">
                    • {transaction.items || 'No description'}
                  </p>
                ))}
                {transactions.filter(t => t.type === 'debt').length > 2 && (
                  <p className="text-xs text-gray-500">
                    +{transactions.filter(t => t.type === 'debt').length - 2} more items
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Status Bar */}
          <div className={`${statusColors[statusColor].bg} ${statusColors[statusColor].border} border rounded-xl p-3`}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 ${statusColors[statusColor].dot} rounded-full`} />
                <span className={`text-xs font-medium ${statusColors[statusColor].text}`}>
                  {remainingDue <= 0 ? 'Fully Paid' : totalPaid > 0 ? 'Partial Payment' : 'Pending'}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-gray-500">Total</p>
                <p className="font-semibold text-gray-900">₹{totalDebt.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Paid</p>
                <p className="font-semibold text-green-600">₹{totalPaid.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-gray-500">Due</p>
                <p className={`font-semibold ${remainingDue <= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{Math.max(0, remainingDue).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}