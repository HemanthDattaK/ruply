import React, { useState, useEffect } from 'react';
import { Plus, Users, IndianRupee, Search, Mic } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import CustomerCard from '../components/CustomerCard';
import Button from '../components/ui/Button';
import FloatingActionButton from '../components/FloatingActionButton';
import Header from '../components/Header';
import VoiceTransactionModal from '../components/VoiceTransactionModal';

interface Customer {
  id: string;
  name: string;
  phone?: string;
  total_debt: number;
}

export default function Dashboard() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalOutstanding, setTotalOutstanding] = useState(0);
  const [activeCustomers, setActiveCustomers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.phone && customer.phone.includes(searchQuery))
    );
    // Sort by total_debt in descending order (highest debt first)
    const sorted = filtered.sort((a, b) => b.total_debt - a.total_debt);
    setFilteredCustomers(sorted);
  }, [customers, searchQuery]);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCustomers(data || []);
      setFilteredCustomers(data || []);
      
      // Calculate totals
      const total = (data || []).reduce((sum, customer) => sum + customer.total_debt, 0);
      const active = (data || []).filter(customer => customer.total_debt > 0).length;
      
      setTotalOutstanding(total);
      setActiveCustomers(active);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B] text-white">
      <Header title="Dashboard" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <IndianRupee className="h-8 w-8 text-red-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Total Outstanding</p>
                <p className="text-2xl font-bold text-white">
                  ₹{totalOutstanding.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-400" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-300">Active Customers</p>
                <p className="text-2xl font-bold text-white">{activeCustomers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/10">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link to="/add-customer">
              <Button className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </Link>
            <Link to="/add-transaction">
              <Button variant="secondary" className="w-full sm:w-auto border-blue-400 text-blue-400 hover:bg-blue-400/10">
                <Plus className="h-4 w-4 mr-2" />
                Add Transaction
              </Button>
            </Link>
            <Button 
              onClick={() => setIsVoiceModalOpen(true)}
              className="w-full sm:w-auto bg-purple-500 hover:bg-purple-600 text-white"
            >
              <Mic className="h-4 w-4 mr-2" />
              Add with Voice
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search customers by name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Customers List */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/10">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">All Customers</h2>
          </div>
          <div className="p-6">
            {filteredCustomers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400 mb-4">
                  {searchQuery ? 'No customers found matching your search' : 'No customers yet'}
                </p>
                <Link to="/add-customer">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                    Add Your First Customer
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCustomers.map((customer) => (
                  <CustomerCard key={customer.id} customer={customer} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <FloatingActionButton
        onClick={() => navigate('/add-transaction')}
        icon={<Plus size={24} />}
        label="Add Transaction"
      />

      <VoiceTransactionModal 
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
      />
    </div>
  );
}