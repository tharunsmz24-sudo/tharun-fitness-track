import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Activity, Flame, Droplets, Target, Scale, Zap } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  // Mock data for charts
  const activityData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Calories Burned',
        data: [300, 450, 320, 500, 200, 600, 400],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.4,
      },
    ],
  };

  const waterData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Water Intake (ml)',
        data: [1500, 2000, 1800, 2500, 2200, 3000, 2800],
        backgroundColor: '#0EA5E9',
        borderRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        ticks: { color: '#94A3B8' },
      },
      x: {
        grid: { display: false },
        ticks: { color: '#94A3B8' },
      },
    },
  };

  const StatCard = ({ title, value, icon: Icon, colorClass, subtitle }) => (
    <div className="glass-card p-6 rounded-2xl flex items-start justify-between group hover:-translate-y-1 transition-transform duration-300">
      <div>
        <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${colorClass} bg-opacity-10`}>
        <Icon className={colorClass.replace('bg-', 'text-').replace('/10', '')} size={24} />
      </div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">
            Welcome back, <span className="text-primary-500">{user?.name?.split(' ')[0] || 'User'}</span>! 👋
          </h1>
          <p className="text-gray-400">Here is your daily fitness summary.</p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2">
          <Activity size={16} />
          Log Activity
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Calories Burned" 
          value="1,240 kcal" 
          subtitle="Goal: 2,500 kcal"
          icon={Flame} 
          colorClass="bg-orange-500 text-orange-500" 
        />
        <StatCard 
          title="Water Intake" 
          value="1.8 L" 
          subtitle="Goal: 3.0 L"
          icon={Droplets} 
          colorClass="bg-blue-500 text-blue-500" 
        />
        <StatCard 
          title="Steps Taken" 
          value="8,432" 
          subtitle="Goal: 10,000 steps"
          icon={Target} 
          colorClass="bg-green-500 text-green-500" 
        />
        <StatCard 
          title="Active Duration" 
          value="45 min" 
          subtitle="Workout: Running"
          icon={Zap} 
          colorClass="bg-purple-500 text-purple-500" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="glass-card p-6 rounded-2xl h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Activity Overview</h3>
            <select className="bg-dark-800 border border-dark-700 text-sm rounded-lg px-2 py-1 text-gray-300 outline-none">
              <option>This Week</option>
              <option>Last Week</option>
            </select>
          </div>
          <div className="flex-1 relative">
            <Line data={activityData} options={chartOptions} />
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl h-[400px] flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">Hydration Tracker</h3>
            <button className="text-primary-500 text-sm hover:underline">View All</button>
          </div>
          <div className="flex-1 relative">
            <Bar data={waterData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-6 rounded-2xl">
        <h3 className="text-lg font-bold text-white mb-4">Recent Activities</h3>
        <div className="space-y-4">
          {[
            { name: 'Morning Run', type: 'Running', duration: '30 min', cal: '320 kcal', time: 'Today, 6:30 AM' },
            { name: 'Weight Training', type: 'Strength', duration: '45 min', cal: '210 kcal', time: 'Yesterday, 5:00 PM' },
            { name: 'Yoga Session', type: 'Yoga', duration: '20 min', cal: '100 kcal', time: 'Mon, 7:00 AM' },
          ].map((activity, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-dark-800/50 rounded-xl hover:bg-dark-800 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center">
                  <Activity size={18} className="text-primary-500" />
                </div>
                <div>
                  <h4 className="font-medium text-white">{activity.name}</h4>
                  <p className="text-xs text-gray-400">{activity.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-white">{activity.cal}</p>
                <p className="text-xs text-gray-400">{activity.duration}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
