import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, Trash2, UserX, PlusCircle, CreditCard as Edit, Phone, Printer, Share2, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import Header from '../components/Header';
import TransactionItem from '../components/TransactionItem';
import { useAppContext } from '../context/AppContext';
import FloatingActionButton from '../components/FloatingActionButton';
import Button from '../components/ui/Button';

const CustomerProfile: React.FC = () => {
  const { customerId } = useParams<{ customerId: string }>();
  const { getCustomerById, getCustomerTransactions, deleteAllTransactions, deleteCustomer, updateCustomer } = useAppContext();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const customer = getCustomerById(customerId || '');
  const transactions = getCustomerTransactions(customerId || '');

  React.useEffect(() => {
    if (customer) {
      setEditName(customer.name);
      setEditPhone(customer.phone || '');
    }
  }, [customer]);

  const handleDeleteAll = async () => {
    if (window.confirm('Are you sure you want to delete all transactions? This cannot be undone.')) {
      await deleteAllTransactions(customerId || '');
    }
  };

  const handleDeleteCustomer = async () => {
    if (window.confirm('Are you sure you want to delete this customer? This will delete all their transactions and cannot be undone.')) {
      await deleteCustomer(customerId || '');
      navigate('/');
    }
  };

  const handleSaveEdit = async () => {
    if (editName.trim()) {
      await updateCustomer(customerId || '', editName.trim(), editPhone.trim() || undefined);
      setIsEditing(false);
    }
  };

  const handlePrint = () => {
    const amount = customer ? Math.abs(customer.totalDebt) : 0;
    const status = customer && customer.totalDebt > 0 ? 'Amount Due' : 'Fully Paid';
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>KV Satyanarayana</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              color: #000; 
              background: #fff; 
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              margin-bottom: 20px; 
              border-bottom: 2px solid #000; 
              padding-bottom: 12px; 
            }
            .header h1 { 
              margin: 0; 
              font-size: 26px; 
              color: #000; 
            }
            .header h2 { 
              margin: 8px 0 0 0; 
              font-size: 15px; 
              color: #444; 
            }
            .customer-info { 
              margin-bottom: 20px; 
              padding: 14px;
              border: 1px solid #ddd;
              border-radius: 8px;
            }
            .amount { 
              font-size: 28px; 
              font-weight: bold; 
              color: ${customer && customer.totalDebt > 0 ? '#c00' : '#0a0'}; 
              text-align: center;
              margin: 16px 0;
            }
            .info-row { 
              margin: 10px 0; 
              display: flex;
              justify-content: space-between;
              padding: 6px 0;
              border-bottom: 1px dotted #ccc;
            }
            .label { 
              font-weight: bold; 
              color: #333;
            }
            .value {
              color: #666;
            }
            .footer {
              text-align: center;
              margin-top: 30px;
              padding-top: 12px;
              border-top: 1px solid #ddd;
              color: #888;
              font-size: 12px;
            }

            /* print-friendly adjustments */
            @media print {
              body { margin: 10mm; }
              .header { border-bottom-width: 1px; }
              .customer-info { border: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>KV Satyanarayana</h1>
            <h2>Customer Statement</h2>
          </div>
          <div class="customer-info">
            <div class="info-row">
              <span class="label">Customer Name:</span> 
              <span class="value">${customer?.name ?? ''}</span>
            </div>
            ${customer?.phone ? `
            <div class="info-row">
              <span class="label">Phone:</span> 
              <span class="value">${customer.phone}</span>
            </div>` : ''}
            <div class="info-row">
              <span class="label">Date:</span> 
              <span class="value">${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</span>
            </div>
            <div class="info-row">
              <span class="label">Status:</span> 
              <span class="value">${status}</span>
            </div>
            <div class="amount">₹${amount.toLocaleString()}</div>
            <div class="info-row" style="border-bottom:none;">
              <span class="label">Total Bill:</span>
              <span class="value">₹${amount.toLocaleString()}</span>
            </div>
          </div>
          <div class="footer">
            <p>Thank you</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      // Wait a bit for content to render then print (some browsers need it)
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
      }, 250);
    }
  };

  const handleShare = async () => {
    const amount = customer ? Math.abs(customer.totalDebt) : 0;
    const status = customer && customer.totalDebt > 0 ? 'Amount Due' : 'Fully Paid';
    const message = `📋 KV Satyanarayana\n\nCustomer: ${customer?.name ?? ''}\n${customer?.phone ? `Phone: ${customer.phone}\n` : ''}Total Bill: ₹${amount.toLocaleString()}\nStatus: ${status}\nDate: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n\nThank you`;

    // Try native share first
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'KV Satyanarayana',
          text: message,
        });
        return;
      } catch (error) {
        // fallback below
        console.log('Native share failed, falling back to WhatsApp', error);
      }
    }

    // Fallback to WhatsApp web
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleSendBillToWhatsApp = () => {
    if (!customer?.phone) {
      alert('No phone number saved for this customer. Please add a phone number first.');
      return;
    }

    const amount = Math.abs(customer.totalDebt);
    const status = customer.totalDebt > 0 ? 'Amount Due' : 'Fully Paid';
    const currentDate = new Date().toLocaleDateString();

    // Create polite bill message with emojis
    const billMessage = `🏪 *KV Satyanarayana*

Dear ${customer.name},

Your bill details:
💰 *Total Amount: ₹${amount.toLocaleString()}*
📅 Date: ${currentDate}

${status === 'Amount Due' ? '⚠️ Payment pending' : '✅ Payment completed'}

Thank you for your business! 🙏`;

    // Clean phone number (remove spaces, dashes, etc.)
    let cleanPhone = customer.phone.replace(/\D/g, '');
    
    // Add country code if not present
    if (cleanPhone.length === 10 && !cleanPhone.startsWith('91')) {
      cleanPhone = '91' + cleanPhone;
    }

    // Use WhatsApp web URL that works better for new contacts
    const whatsappUrl = `https://web.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(billMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (!customer) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B] text-white">
        <Header title="Customer Not Found" showBack={true} />
        <div className="p-4 text-center">
          <p className="mb-4 text-gray-300">This customer doesn't exist or has been removed.</p>
          <button 
            onClick={() => navigate('/')}
            className="bg-blue-500/20 text-white px-4 py-2 rounded-xl hover:bg-blue-500/30 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0F172A] to-[#1E293B] text-white">
      <Header title={customer.name} showBack={true} />

      <div className="p-4">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-5">
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">Customer Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white mb-2">Phone Number (Optional)</label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={() => setIsEditing(false)}
                  className="flex-1 border border-white/20 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl font-bold text-white">{customer.name}</h2>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-blue-400 hover:bg-blue-400/10 transition-colors p-1 rounded-lg"
                      title="Edit Customer"
                    >
                      <Edit size={18} />
                    </button>
                  </div>
                  {customer.phone && (
                    <div className="flex items-center text-gray-300 mb-2">
                      <Phone className="h-4 w-4 mr-2" />
                      {customer.phone}
                    </div>
                  )}
                  <p className="text-gray-300 mb-1">Total Bill</p>
                  <p className={`text-3xl font-bold ${customer.totalDebt && customer.totalDebt > 0 ? 'text-red-400' : 'text-green-400'}`}>
                    ₹ {typeof customer.totalDebt === 'number' ? customer.totalDebt.toFixed(2) : '0.00'}
                  </p>
                </div>
                <button
                  onClick={handleDeleteCustomer}
                  className="text-red-400 hover:bg-red-400/10 transition-colors p-2 rounded-xl"
                  title="Delete Customer"
                >
                  <UserX size={24} />
                </button>
              </div>
              
              {/* Action Buttons - Vertical Layout */}
              <div className="space-y-3 mt-4">
                <button
                  onClick={() => navigate(`/add-transaction/${customerId}`)}
                  className="w-full bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-3 px-4 rounded-xl transition-colors flex items-center justify-center font-medium"
                >
                  <PlusCircle size={20} className="mr-3" />
                  Add New Transaction
                </button>
                
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={handlePrint}
                    className="bg-gray-500/20 hover:bg-gray-500/30 text-gray-400 py-3 px-4 rounded-xl transition-colors flex items-center justify-center font-medium"
                  >
                    <Printer size={18} className="mr-2" />
                    Print
                  </button>
                  <button
                    onClick={handleShare}
                    className="bg-green-500/20 hover:bg-green-500/30 text-green-400 py-3 px-4 rounded-xl transition-colors flex items-center justify-center font-medium"
                  >
                    <Share2 size={18} className="mr-2" />
                    Share
                  </button>
                  {customer.phone ? (
                    <button
                      onClick={handleSendBillToWhatsApp}
                      className="bg-green-500/20 hover:bg-green-500/30 text-green-400 py-3 px-4 rounded-xl transition-colors flex items-center justify-center font-medium"
                    >
                      <MessageCircle size={18} className="mr-2" />
                      WhatsApp
                    </button>
                  ) : (
                    <button
                      disabled
                      className="bg-gray-500/10 text-gray-500 py-3 px-4 rounded-xl transition-colors flex items-center justify-center font-medium cursor-not-allowed"
                      title="No phone number saved"
                    >
                      <MessageCircle size={18} className="mr-2" />
                      WhatsApp
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden mb-5">
          <div className="px-4 py-3 border-b border-white/10 flex justify-between items-center">
            <h2 className="font-semibold flex items-center text-white">
              <Clock size={18} className="mr-2 text-gray-400" />
              Transaction History
            </h2>
            {transactions.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="flex items-center text-red-400 hover:text-red-300 transition-colors text-sm"
              >
                <Trash2 size={16} className="mr-1" />
                Delete All
              </button>
            )}
          </div>

          <div className="divide-y divide-white/10 px-4">
            {transactions.length === 0 ? (
              <p className="py-6 text-center text-gray-400">No transactions yet</p>
            ) : (
              transactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))
            )}
          </div>
        </div>
      </div>

      <FloatingActionButton
        onClick={() => navigate(`/add-transaction/${customerId}`)}
        icon={<PlusCircle size={24} />}
        label="Add New Transaction"
      />
    </div>
  );
};

export default CustomerProfile;
