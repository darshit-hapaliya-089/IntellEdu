import React from 'react';
import { useNavigate } from 'react-router-dom';
import AiTutorPanel from '../components/ai/AiTutorPanel';

const AiDoubtSolver: React.FC = () => {
  const navigate = useNavigate();
  return <AiTutorPanel onOpenQuizzes={() => navigate('/dashboard/quizzes')} />;
};

export default AiDoubtSolver;