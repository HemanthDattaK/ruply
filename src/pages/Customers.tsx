import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserPlus } from 'lucide-react';
import Header from '../components/Header';
import CustomerCard from '../components/CustomerCard';
import { useAppContext } from '../context/AppContext';
import { motion } from 'framer-motion';

const Customers: React.FC = () => {
  const { customers } = useAppContext();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Customers" />
      
      <div className="p-4">
        <div className="relative mb-4">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <motion.div 
          className="space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {filteredCustomers.map((customer) => (
            <motion.div
              key={customer.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <CustomerCard customer={customer} />
            </motion.div>
          ))}
        </motion.div>

        {filteredCustomers.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">No customers found</p>
            <button
              onClick={() => navigate('/add-customer')}
              className="bg-green-600 text-white px-4 py-2 rounded-lg inline-flex items-center hover:bg-green-700 transition-colors"
            >
              <UserPlus size={18} className="mr-2" />
              <span>Add New Customer</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Customers;