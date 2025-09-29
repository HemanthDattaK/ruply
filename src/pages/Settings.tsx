import React from 'react';
import { Moon, Bell, LogOut } from 'lucide-react';
import Header from '../components/Header';

const Settings: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Settings" />
      
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 flex items-center justify-between border-b">
            <div className="flex items-center">
              <Bell size={20} className="text-gray-500 mr-3" />
              <span>Notifications</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
          
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <Moon size={20} className="text-gray-500 mr-3" />
              <span>Dark Mode</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>

        <button className="w-full bg-red-50 text-red-600 rounded-lg p-4 flex items-center justify-center font-medium hover:bg-red-100 transition-colors">
          <LogOut size={20} className="mr-2" />
          Sign Out
        </button>

        <p className="text-center text-gray-500 text-sm mt-8">
          Version 0.1.0
        </p>
      </div>
    </div>
  );
};

export default Settings;