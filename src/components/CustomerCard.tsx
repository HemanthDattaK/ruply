import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, MoreVertical } from 'lucide-react';
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
  index?: number;
}

export default function CustomerCard({ customer, index = 0 }: CustomerCardProps) {
  const { getCustomerTransactions } = useAppContext();
  const transactions = getCustomerTransactions(customer.id);
  
  // Calculate amounts
  const totalDebt = transactions
    .filter(t => t.type === 'debt')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalPaid = transactions
    .filter(t => t.type === 'payment')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const remainingDue = totalDebt - totalPaid;
  
  // Get recent items
  const recentItems = transactions
    .filter(t => t.type === 'debt' && t.items)
    .slice(0, 2)
    .map(t => t.items)
    .join(', ');

  // Determine status
  const getStatus = () => {
    if (remainingDue <= 0) return { text: 'Paid', class: 'status-paid' };
    if (totalPaid > 0) return { text: 'Partial', class: 'status-partial' };
    return { text: 'Pending', class: 'status-pending' };
  };

  const status = getStatus();

  // Generate initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.36, 
        delay: index * 0.04,
        ease: [0.2, 0.9, 0.3, 1] 
      }}
      className="stagger-entrance"
    >
      <Link to={`/customer/${customer.id}`}>
        <motion.div
          whileTap={{ scale: 0.98 }}
          className="premium-card p-4 mb-3 ripple"
        >
          <div className="flex items-center">
            {/* Avatar */}
            <div className="avatar mr-4">
              {getInitials(customer.name)}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-1">
                <h3 className="text-h2 truncate pr-2">{customer.name}</h3>
                <div className="flex items-center space-x-2">
                  <span className={`status-pill ${status.class}`}>
                    {status.text}
                  </span>
                </div>
              </div>
              
              {recentItems && (
                <p className="text-small text-text-secondary truncate mb-2">
                  {recentItems}
                </p>
              )}

              {/* Amount Summary */}
              <div className="flex items-center justify-between">
                <div className="flex space-x-4">
                  <div>
                    <p className="text-small text-text-secondary">Total</p>
                    <p className="text-body font-semibold">₹{totalDebt.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-small text-text-secondary">Due</p>
                    <p className={`text-body font-semibold ${
                      remainingDue <= 0 ? 'text-success' : 'text-danger'
                    }`}>
                      ₹{Math.max(0, remainingDue).toLocaleString()}
                    </p>
                  </div>
                </div>
                
                <ChevronRight size={20} className="text-text-muted" />
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}