import React from 'react';
import { Link } from 'react-router-dom';
import { User, Phone } from 'lucide-react';

interface Customer {
  id: string;
  name: string;
  phone: string;
  total_debt: number;
}

interface CustomerCardProps {
  customer: Customer;
}

export default function CustomerCard({ customer }: CustomerCardProps) {
  const isDebtPositive = customer.total_debt > 0;

  return (
    <Link to={`/customer/${customer.id}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-gray-900 truncate">
                {customer.name}
              </p>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Phone className="h-3 w-3 mr-1" />
                {customer.phone}
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className={`text-sm font-semibold ${
              isDebtPositive ? 'text-red-600' : 'text-green-600'
            }`}>
              {isDebtPositive ? '+' : ''}₹{Math.abs(customer.total_debt).toLocaleString()}
            </p>
            <p className="text-xs text-gray-500">
              {isDebtPositive ? 'Outstanding' : 'Paid'}
            </p>
          </div>
        </div>
      </div>
    </Link>
  );
}