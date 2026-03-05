import React, { useState, useEffect } from 'react';
import { Plus, Users, IndianRupee, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import CustomerCard from '../components/CustomerCard';
import Button from '../components/ui/Button';
import FloatingActionButton from '../components/FloatingActionButton';
import Header from '../components/Header';
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
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [activeCustomers, setActiveCustomers] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchQuery))
    );
    
    // Sort by total debt in descending order (highest debt first)
    const sorted = filtered.sort((a, b) => Math.abs(b.totalDebt) - Math.abs(a.totalDebt));
    setFilteredCustomers(sorted);
    
    // Calculate totals
    const total = customers.reduce((sum, customer) => sum + Math.abs(customer.totalDebt), 0);
    const active = customers.filter(customer => customer.totalDebt !== 0).length;
    
    setTotalOutstanding(total);
    setActiveCustomers(active);
  }, [customers, searchQuery]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Dashboard" />
      
      <div className="px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <IndianRupee className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Total Outstanding</p>
                <p className="text-lg font-bold text-gray-900">
                  ₹{totalOutstanding.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Active Customers</p>
                <p className="text-lg font-bold text-gray-900">{activeCustomers}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
        >
          <h2 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link to="/add-customer">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm py-3">
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </Link>
            <Link to="/add-transaction">
              <Button variant="secondary" className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 text-sm py-3">
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          className="relative"
        >
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
        </motion.div>

        {/* Customers List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">All Customers</h2>
            <span className="text-sm text-gray-500">{filteredCustomers.length} customers</span>
          </div>
          
          {filteredCustomers.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">
                {searchQuery ? 'No customers found matching your search' : 'No customers yet'}
              </p>
              <Link to="/add-customer">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Add Your First Customer
                </Button>
              </Link>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-3">
                {filteredCustomers.map((customer, index) => (
                  <motion.div
                    key={customer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <CustomerCard customer={customer} />
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </motion.div>
      </div>

      <FloatingActionButton
        onClick={() => navigate('/add-transaction')}
        icon={<Plus size={24} />}
        label="Add Transaction"
      />
    </div>
  );
}