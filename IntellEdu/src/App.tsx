import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { PerformanceModeProvider } from './context/PerformanceModeContext';
import { AuthProvider } from './context/AuthContext';
import AppRoutes from './Routes/Routes';

export const App: React.FC = () => {
  return (
    <PerformanceModeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </PerformanceModeProvider>
  );
};

export default App;
