import React from 'react';
import { Link } from 'react-router-dom';
import { User, Phone, Plus, Printer, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Customer {
  id: string;
  name: string;
  phone?: string;
  total_debt: number;
}

interface CustomerCardProps {
  customer: Customer;
}

export default function CustomerCard({ customer }: CustomerCardProps) {
  const navigate = useNavigate();
  const isDebtPositive = customer.total_debt > 0;

  const handleAddTransaction = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/add-transaction/${customer.id}`);
  };

  const handlePrint = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bill - Sai Sri Kirana</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .customer-info { margin-bottom: 20px; }
            .amount { font-size: 24px; font-weight: bold; color: ${isDebtPositive ? '#dc2626' : '#16a34a'}; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Sai Sri Kirana</h1>
            <h2>Bill</h2>
          </div>
          <div class="customer-info">
            ${customer.phone ? `<p><strong>Phone:</strong> ${customer.phone}</p>` : ''}
            <p><strong>Amount:</strong> <span class="amount">₹${Math.abs(customer.total_debt).toLocaleString()}</span></p>
            <p><strong>Status:</strong> ${isDebtPositive ? 'Amount Due' : 'Paid'}</p>
            <p><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const message = `Bill - Sai Sri Kirana\n\nAmount: ₹${Math.abs(customer.total_debt).toLocaleString()}\n${isDebtPositive ? 'Amount Due' : 'Paid'}\nDate: ${new Date().toLocaleDateString()}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Bill - Sai Sri Kirana`,
        text: message,
      });
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-200 cursor-pointer group">
      <Link to={`/customer/${customer.id}`} className="block">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-400" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">
                {customer.name}
              </p>
              {customer.phone && (
                <div className="flex items-center text-xs text-gray-400 mt-1">
                  <Phone className="h-3 w-3 mr-1" />
                  {customer.phone}
                </div>
              )}
            </div>
          </div>
          <div className="text-right">
            <p className={`text-sm font-semibold ${
              isDebtPositive ? 'text-red-400' : 'text-green-400'
            }`}>
              {isDebtPositive ? '+' : ''}₹{Math.abs(customer.total_debt).toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">
              {isDebtPositive ? 'Due' : 'Paid'}
            </p>
          </div>
        </div>
      </Link>
      
      {/* Action Buttons */}
      <div className="flex justify-end space-x-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <button
          onClick={handleAddTransaction}
          className="p-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 transition-colors"
          title="Add Transaction"
        >
          <Plus size={16} />
        </button>
        <button
          onClick={handlePrint}
          className="p-2 bg-gray-500/20 hover:bg-gray-500/30 rounded-lg text-gray-400 transition-colors"
          title="Print Statement"
        >
          <Printer size={16} />
        </button>
        <button
          onClick={handleShare}
          className="p-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-green-400 transition-colors"
          title="Share Statement"
        >
          <Share2 size={16} />
        </button>
      </div>
    </div>
  );
}