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
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-200 cursor-pointer">
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
    </div>
  );
}