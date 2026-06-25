import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Sidebar from './components/layout/Sidebar';
import Topbar from './components/layout/Topbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Workouts from './pages/Workouts';

function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-dark-900 text-white">Loading...</div>;

  return (
    <Router>
      <div className="flex h-screen bg-dark-900 text-white overflow-hidden">
        {user && <Sidebar />}
        
        <div className="flex-1 flex flex-col overflow-hidden">
          {user && <Topbar />}
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto bg-dark-900/50">
            <Routes>
              <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
              <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
              
              <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" />} />
              <Route path="/workouts" element={user ? <Workouts /> : <Navigate to="/login" />} />
              
              {/* Catch all */}
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
