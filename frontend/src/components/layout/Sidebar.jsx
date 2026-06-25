import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Activity, 
  Utensils, 
  Droplets, 
  Target, 
  BarChart2, 
  User, 
  LogOut 
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: Home, path: '/' },
    { name: 'Workouts', icon: Activity, path: '/workouts' },
    { name: 'Nutrition', icon: Utensils, path: '/nutrition' },
    { name: 'Water', icon: Droplets, path: '/water' },
    { name: 'Goals', icon: Target, path: '/goals' },
    { name: 'Analytics', icon: BarChart2, path: '/analytics' },
    { name: 'Profile', icon: User, path: '/profile' },
  ];

  return (
    <div className="w-64 glass-card h-screen flex flex-col hidden md:flex border-r-0 border-y-0 border-l-0">
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
          <Activity size={20} className="text-white" />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary-500 to-blue-400 bg-clip-text text-transparent">
          FitTrack Pro
        </h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-primary-500/10 text-primary-500 border border-primary-500/20 shadow-sm shadow-primary-500/10'
                  : 'text-gray-400 hover:text-white hover:bg-dark-700/50'
              }`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 mt-auto border-t border-dark-700/50">
        <button className="flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-all w-full">
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
