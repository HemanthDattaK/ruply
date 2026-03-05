import React, { useState, useEffect } from 'react';
import { Search, Users, IndianRupee, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CustomerCard from '../components/CustomerCard';
import FloatingActionButton from '../components/FloatingActionButton';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAppContext } from '../context/AppContext';

interface Customer {
  id: string;
  name: string;
  phone?: string;
  totalDebt: number;
}

export default function Dashboard() {
  const { customers, loading, getCustomerTransactions } = useAppContext();
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    totalCustomers: 0,
    totalOutstanding: 0,
    totalCollected: 0
  });

  useEffect(() => {
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchQuery))
    );
    
    // Sort by total debt in descending order (highest debt first)
    const sorted = filtered.sort((a, b) => Math.abs(b.totalDebt) - Math.abs(a.totalDebt));
    setFilteredCustomers(sorted);
    
    // Calculate stats
    let totalOutstanding = 0;
    let totalCollected = 0;
    
    customers.forEach(customer => {
      const transactions = getCustomerTransactions(customer.id);
      const debt = transactions.filter(t => t.type === 'debt').reduce((sum, t) => sum + t.amount, 0);
      const paid = transactions.filter(t => t.type === 'payment').reduce((sum, t) => sum + t.amount, 0);
      const remaining = debt - paid;
      
      if (remaining > 0) {
        totalOutstanding += remaining;
      }
      totalCollected += paid;
    });
    
    setStats({
      totalCustomers: customers.length,
      totalOutstanding,
      totalCollected
    });
  }, [customers, searchQuery, getCustomerTransactions]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg-start to-bg-end">
      <Header title="Dashboard" showAvatar={true} />
      
      <div className="max-w-mobile mx-auto px-4 pb-24">
        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.2, 0.9, 0.3, 1] }}
          className="grid grid-cols-1 gap-3 mb-6"
        >
          <StatCard
            title="Total Customers"
            value={stats.totalCustomers}
            icon={Users}
            color="primary"
            delay={0}
          />
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              title="Total Due"
              value={stats.totalOutstanding}
              icon={TrendingUp}
              color="warning"
              delay={100}
            />
            <StatCard
              title="Collected"
              value={stats.totalCollected}
              icon={IndianRupee}
              color="success"
              delay={200}
            />
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3, ease: [0.2, 0.9, 0.3, 1] }}
          className="relative mb-6"
        >
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-text-secondary h-5 w-5" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-surface border border-gray-100 rounded-card text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary-1 focus:border-transparent shadow-card transition-all"
          />
        </motion.div>

        {/* Customers Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4, ease: [0.2, 0.9, 0.3, 1] }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-h2">All Customers</h2>
            <span className="text-small text-text-secondary">
              {filteredCustomers.length} customers
            </span>
          </div>
          
          {filteredCustomers.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="premium-card p-8 text-center"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-text-muted" />
              </div>
              <h3 className="text-h2 mb-2">
                {searchQuery ? 'No customers found' : 'No customers yet'}
              </h3>
              <p className="text-body text-text-secondary mb-6">
                {searchQuery 
                  ? 'Try adjusting your search terms' 
                  : 'Start by adding your first customer'
                }
              </p>
              {!searchQuery && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {/* Navigate to add customer */}}
                  className="btn-primary"
                >
                  Add Your First Customer
                </motion.button>
              )}
            </motion.div>
          ) : (
            <AnimatePresence>
              <div className="space-y-0">
                {filteredCustomers.map((customer, index) => (
                  <CustomerCard 
                    key={customer.id} 
                    customer={customer} 
                    index={index}
                  />
                ))}
              </div>
            </AnimatePresence>
          )}
        </motion.div>
      </div>

      <FloatingActionButton />
    </div>
  );
}