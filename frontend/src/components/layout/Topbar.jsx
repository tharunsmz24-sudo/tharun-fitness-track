import React from 'react';
import { Bell, Menu, Search } from 'lucide-react';

const Topbar = () => {
  return (
    <header className="h-16 glass-card flex items-center justify-between px-6 z-10 sticky top-0 border-x-0 border-t-0">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-gray-400 hover:text-white">
          <Menu size={24} />
        </button>
        
        <div className="relative hidden sm:block">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-dark-900/50 border border-dark-700 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary-500 w-64 transition-colors"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-dark-700/50">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full border-2 border-dark-800"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-4 border-l border-dark-700/50 cursor-pointer">
          <img 
            src="https://ui-avatars.com/api/?name=User&background=3B82F6&color=fff" 
            alt="Profile" 
            className="w-8 h-8 rounded-full ring-2 ring-primary-500/20"
          />
          <div className="hidden sm:block text-sm">
            <p className="font-medium text-white">John Doe</p>
            <p className="text-gray-400 text-xs">Free Plan</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
