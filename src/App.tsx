import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AddCustomer from './pages/AddCustomer';
import AddTransaction from './pages/AddTransaction';
import CustomerProfile from './pages/CustomerProfile';
import Settings from './pages/Settings';

function App() {
  return (
    <AppProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/add-customer" element={<AddCustomer />} />
            <Route path="/add-transaction" element={<AddTransaction />} />
            <Route path="/add-transaction/:customerId" element={<AddTransaction />} />
            <Route path="/customer/:customerId" element={<CustomerProfile />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </Router>
    </AppProvider>
  );
}

export default App;