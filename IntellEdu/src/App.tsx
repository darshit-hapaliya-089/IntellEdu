import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PerformanceModeProvider } from './context/PerformanceModeContext';
import { AuthProvider } from './context/AuthContext';
import { GamificationProvider } from './context/GamificationContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

export const App: React.FC = () => {
  return (
    <PerformanceModeProvider>
      <AuthProvider>
        <GamificationProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            {/* Catch-all fallback route */}
            <Route path="*" element={<Home />} />
          </Routes>
        </BrowserRouter>
        </GamificationProvider>
      </AuthProvider>
    </PerformanceModeProvider>
  );
};

export default App;
