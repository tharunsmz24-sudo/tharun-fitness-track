import React, { useState } from 'react';
import { Activity, Plus, Search, Filter, Trash2, Edit2 } from 'lucide-react';

const Workouts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data for initial UI
  const workouts = [
    { id: 1, name: 'Morning Run', category: 'Running', duration: 30, calories: 320, date: '2026-06-23' },
    { id: 2, name: 'Upper Body Strength', category: 'Strength Training', duration: 45, calories: 210, date: '2026-06-22' },
    { id: 3, name: 'Evening Yoga', category: 'Yoga', duration: 20, calories: 100, date: '2026-06-21' },
    { id: 4, name: 'Cycling in Park', category: 'Cycling', duration: 60, calories: 450, date: '2026-06-20' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Workout Log</h1>
          <p className="text-gray-400">Track and manage your fitness activities.</p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
          <Plus size={18} />
          Add Workout
        </button>
      </div>

      <div className="glass-card p-6 rounded-2xl flex flex-col gap-6">
        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input 
              type="text" 
              placeholder="Search workouts..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-dark-800 border border-dark-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-dark-800 border border-dark-700 rounded-xl text-sm font-medium hover:bg-dark-700 transition-colors flex-1 md:flex-none justify-center">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-dark-700">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-dark-800 text-gray-400 text-xs uppercase font-semibold">
              <tr>
                <th className="px-6 py-4 rounded-tl-xl">Exercise</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Duration</th>
                <th className="px-6 py-4">Calories</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 rounded-tr-xl text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700/50">
              {workouts.map((workout) => (
                <tr key={workout.id} className="hover:bg-dark-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-500/10 text-primary-500 flex items-center justify-center">
                      <Activity size={16} />
                    </div>
                    {workout.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-dark-700 rounded-lg text-xs">
                      {workout.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">{workout.duration} min</td>
                  <td className="px-6 py-4 text-orange-400">{workout.calories} kcal</td>
                  <td className="px-6 py-4">{workout.date}</td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-white p-2 transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button className="text-red-400 hover:text-red-300 p-2 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {workouts.length === 0 && (
          <div className="text-center py-12">
            <Activity className="mx-auto text-gray-600 mb-3" size={48} />
            <p className="text-gray-400">No workouts found. Start by adding one!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Workouts;
