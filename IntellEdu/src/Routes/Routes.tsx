import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import Dashboard from '../pages/Dashboard';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import WhatsAppConnect from '../pages/WhatsAppConnect';
import Overview from '../pages/Overview';
import MyCourses from '../pages/My-Courses';
import AiDoubtSolver from '../pages/AI-DoubtSolver';
import Quizzes from '../pages/Quizzes';
import LeaderBoard from '../pages/LeaderBoard';
import ProgressStats from '../pages/ProgressStats';
import Settings from '../pages/Settings';

export const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/whatsapp-connect" element={<WhatsAppConnect />} />
    <Route
      path="/dashboard"
      element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      }
    >
      <Route index element={<Overview />} />
      <Route path="courses" element={<MyCourses />} />
      <Route path="doubts" element={<AiDoubtSolver />} />
      <Route path="quizzes" element={<Quizzes />} />
      <Route path="community" element={<LeaderBoard />} />
      <Route path="progress" element={<ProgressStats />} />
      <Route path="settings" element={<Settings />} />
    </Route>
    <Route path="*" element={<Home />} />
  </Routes>
);

export default AppRoutes;
