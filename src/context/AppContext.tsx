import React, { createContext, useContext, useState, useEffect } from 'react';
import { Customer, Transaction } from '../types';
import { supabase } from '../lib/supabase';

interface AppContextType {
  customers: Customer[];
  transactions: Transaction[];
  addCustomer: (name: string, phone?: string) => Promise<void>;
  updateCustomer: (id: string, name: string, phone?: string) => Promise<void>;
  addTransaction: (customerId: string, amount: number, items: string, type: 'debt' | 'payment') => Promise<void>;
  deleteTransaction: (transactionId: string, customerId: string, amount: number, type: 'debt' | 'payment') => Promise<void>;
  deleteAllTransactions: (customerId: string) => Promise<void>;
  deleteCustomer: (customerId: string) => Promise<void>;
  getCustomerById: (id: string) => Customer | undefined;
  getCustomerTransactions: (customerId: string) => Transaction[];
  loading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();

    // Subscribe to auth changes to refresh data when auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchData();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchData = async () => {
    try {
      // First check if we're authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        // If not authenticated, sign in anonymously
        await supabase.auth.signInAnonymously();
      }

      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('*');

      if (customersError) throw customersError;

      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*');

      if (transactionsError) throw transactionsError;

      // Map the snake_case properties to camelCase
      const mappedCustomers = customersData.map(customer => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        totalDebt: customer.total_debt,
        createdAt: customer.created_at
      }));

      setCustomers(mappedCustomers);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCustomer = async (name: string, phone?: string) => {
    try {
      // Ensure we're authenticated before adding
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        await supabase.auth.signInAnonymously();
      }

      const { data, error } = await supabase
        .from('customers')
        .insert([{ name, phone, total_debt: 0 }])
        .select()
        .single();

      if (error) throw error;

      // Map the snake_case properties to camelCase
      const mappedCustomer = {
        id: data.id,
        name: data.name,
        phone: data.phone,
        totalDebt: data.total_debt,
        createdAt: data.created_at
      };

      setCustomers([...customers, mappedCustomer]);
    } catch (error) {
      console.error('Error adding customer:', error);
      throw error;
    }
  };

  const updateCustomer = async (id: string, name: string, phone?: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ name, phone })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      setCustomers(customers.map(customer => 
        customer.id === id 
          ? { ...customer, name, phone }
          : customer
      ));
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  };
  const addTransaction = async (customerId: string, amount: number, items: string, type: 'debt' | 'payment') => {
    try {
      // First, get the current customer's total_debt
      const { data: customerData, error: customerFetchError } = await supabase
        .from('customers')
        .select('total_debt')
        .eq('id', customerId)
        .single();

      if (customerFetchError) throw customerFetchError;

      // Calculate the new total_debt
      const currentTotalDebt = customerData.total_debt || 0;
      const amountChange = type === 'debt' ? amount : -amount;
      const newTotalDebt = currentTotalDebt + amountChange;

      // Add the transaction
      const { data: transaction, error: transactionError } = await supabase
        .from('transactions')
        .insert([{
          customer_id: customerId,
          amount,
          items,
          type,
          date: new Date().toISOString()
        }])
        .select()
        .single();

      if (transactionError) throw transactionError;

      // Update the customer's total_debt
      const { error: customerUpdateError } = await supabase
        .from('customers')
        .update({ total_debt: newTotalDebt })
        .eq('id', customerId);

      if (customerUpdateError) throw customerUpdateError;

      await fetchData();
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const deleteTransaction = async (transactionId: string, customerId: string, amount: number, type: 'debt' | 'payment') => {
    try {
      // First, get the current customer's total_debt
      const { data: customerData, error: customerFetchError } = await supabase
        .from('customers')
        .select('total_debt')
        .eq('id', customerId)
        .single();

      if (customerFetchError) throw customerFetchError;

      // Calculate the new total_debt (reverse the original transaction)
      const currentTotalDebt = customerData.total_debt || 0;
      const amountChange = type === 'debt' ? -amount : amount;
      const newTotalDebt = currentTotalDebt + amountChange;

      // Delete the transaction
      const { error: transactionError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

      if (transactionError) throw transactionError;

      // Update the customer's total_debt
      const { error: customerUpdateError } = await supabase
        .from('customers')
        .update({ total_debt: newTotalDebt })
        .eq('id', customerId);

      if (customerUpdateError) throw customerUpdateError;

      await fetchData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  };

  const deleteAllTransactions = async (customerId: string) => {
    try {
      const { error: transactionError } = await supabase
        .from('transactions')
        .delete()
        .eq('customer_id', customerId);

      if (transactionError) throw transactionError;

      const { error: customerError } = await supabase
        .from('customers')
        .update({ total_debt: 0 })
        .eq('id', customerId);

      if (customerError) throw customerError;

      await fetchData();
    } catch (error) {
      console.error('Error deleting all transactions:', error);
      throw error;
    }
  };

  const deleteCustomer = async (customerId: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) throw error;

      setCustomers(customers.filter(customer => customer.id !== customerId));
      setTransactions(transactions.filter(transaction => transaction.customer_id !== customerId));
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  };

  const getCustomerById = (id: string) => {
    return customers.find((customer) => customer.id === id);
  };

  const getCustomerTransactions = (customerId: string) => {
    return transactions
      .filter((transaction) => transaction.customer_id === customerId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  };

  return (
    <AppContext.Provider
      value={{
        customers,
        transactions,
        addCustomer,
        updateCustomer,
        addTransaction,
        deleteTransaction,
        deleteAllTransactions,
        deleteCustomer,
        getCustomerById,
        getCustomerTransactions,
        loading
      }}
    >
      {children}
    </AppContext.Provider>
  );
};