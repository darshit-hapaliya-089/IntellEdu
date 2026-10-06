import {
  Calculator,
  FlaskConical,
  Globe2,
  BookText,
  Cpu,
  Lightbulb,
} from 'lucide-react';
import { QuizSubject, SubjectId } from '../types/quiz';

/** The full catalogue of quiz subjects shown on the Quizzes hub. */
export const QUIZ_SUBJECTS: QuizSubject[] = [
  {
    id: 'maths',
    name: 'Mathematics',
    tagline: 'Numbers, algebra & geometry',
    description: 'Sharpen problem-solving across arithmetic, algebra and geometry.',
    icon: Calculator,
    accent: 'indigo',
  },
  {
    id: 'science',
    name: 'Science',
    tagline: 'Physics, chemistry & biology',
    description: 'Motion, reactions and life processes — the building blocks of the world.',
    icon: FlaskConical,
    accent: 'emerald',
  },
  {
    id: 'social-science',
    name: 'Social Science',
    tagline: 'History, civics & geography',
    description: 'Understand societies, movements, resources and the maps that shape us.',
    icon: Globe2,
    accent: 'amber',
  },
  {
    id: 'english',
    name: 'English',
    tagline: 'Grammar & vocabulary',
    description: 'Master grammar rules, reading comprehension and word power.',
    icon: BookText,
    accent: 'rose',
  },
  {
    id: 'computer',
    name: 'Computer Science',
    tagline: 'Coding & fundamentals',
    description: 'Logic, programming basics and how computers really work.',
    icon: Cpu,
    accent: 'sky',
  },
  {
    id: 'gk',
    name: 'General Knowledge',
    tagline: 'India & the world',
    description: 'Current affairs, landmarks and everyday general awareness.',
    icon: Lightbulb,
    accent: 'violet',
  },
];

export const SUBJECT_BY_ID: Record<SubjectId, QuizSubject> = QUIZ_SUBJECTS.reduce(
  (acc, subject) => {
    acc[subject.id] = subject;
    return acc;
  },
  {} as Record<SubjectId, QuizSubject>
);
