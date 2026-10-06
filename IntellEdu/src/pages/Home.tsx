import React from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Target,
  Trophy,
  BarChart3,
  UserPlus,
  BookOpen,
  Award,
  Users,
  Globe,
  Star,
  Zap,
  Play
} from 'lucide-react';
import { usePerformanceMode } from '../context/PerformanceModeContext';
import { FeatureItem, StepItem, StatItem } from '../types';
import FeatureCard from '../components/FeatureCard';
import StepCard from '../components/StepCard';
import StatCounter from '../components/StatCounter';
import MarkdownViewer from '../components/MarkdownViewer';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { cx } from '../utils/cx';

// Raw Markdown file import
import aboutMd from '../content/about.md?raw';

export const Home: React.FC = () => {
  const { highGraphics, t } = usePerformanceMode();

  // Typed Features array
  const features: FeatureItem[] = [
    {
      id: 'f1',
      title: 'AI-Powered Doubt Solver',
      description: 'Get instant 24/7 step-by-step solutions and conceptual explanations for complex math, science, and coding questions.',
      icon: Brain,
      color: 'indigo',
      badge: 'AI 2.0'
    },
    {
      id: 'f2',
      title: 'Personalized Learning Paths',
      description: 'Adaptive study schedules dynamically tailored to your learning velocity, class grade, and specific exam goals.',
      icon: Target,
      color: 'emerald',
      badge: 'Adaptive'
    },
    {
      id: 'f3',
      title: 'Gamified Quizzes & Leaderboards',
      description: 'Earn XP badges, build daily streaks, and compete with peers on live student leaderboards for exciting rewards.',
      icon: Trophy,
      color: 'amber',
      badge: 'Gamified'
    },
    {
      id: 'f4',
      title: 'Progress Analytics Dashboard',
      description: 'Gain real-time insights into your subject mastery, study time, quiz accuracy, and areas needing quick revision.',
      icon: BarChart3,
      color: 'sky',
      badge: 'Analytics'
    }
  ];

  // Typed Steps array
  const steps: StepItem[] = [
    {
      stepNumber: 1,
      title: 'Sign Up & Set Goals',
      description: 'Choose your class or skill path to immediately personalize your AI study companion.',
      icon: UserPlus
    },
    {
      stepNumber: 2,
      title: 'Learn with AI & Notes',
      description: 'Study rich Markdown lesson notes, practice code blocks, and ask AI doubts on the fly.',
      icon: BookOpen
    },
    {
      stepNumber: 3,
      title: 'Track Growth & Win Rewards',
      description: 'Complete quizzes, build daily streaks, climb the leaderboard, and unlock certified badges.',
      icon: Award
    }
  ];

  // Typed Stats array
  const stats: StatItem[] = [
    { id: 's1', value: 50000, suffix: '+', label: t('statsStudents'), icon: Users },
    { id: 's2', value: 120, suffix: '+', label: t('statsCourses'), icon: BookOpen },
    { id: 's3', value: 3, suffix: '+', label: t('statsLanguages'), icon: Globe },
    { id: 's4', value: 98, suffix: '%', label: t('statsSuccess'), icon: Star }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="grow">
        {/* HERO SECTION */}
        <section className="relative overflow-hidden pt-8 pb-14 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28">
          {/* Ambient Background Blur for High Graphics */}
          {highGraphics && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none -z-10 overflow-hidden">
              <div className="absolute -top-10 left-1/4 w-48 sm:w-72 h-48 sm:h-72 bg-indigo-500/20 rounded-full blur-3xl animate-pulse-glow"></div>
              <div className="absolute top-20 right-1/4 w-56 sm:w-80 h-56 sm:h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }}></div>
            </div>
          )}

          <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">

              {/* Left Column: Hero Text */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
                <div
                  className={cx(
                    'inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all',
                    highGraphics
                      ? 'bg-linear-to-r from-indigo-50 to-violet-50 text-indigo-700 border border-indigo-200/80 shadow-xs'
                      : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                  )}
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-spin-slow shrink-0" />
                  <span className="truncate">Next-Gen Smart Education Platform</span>
                </div>

                <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl 2xl:text-7xl font-black text-slate-900 tracking-tight leading-tight">
                  {t('heroTitle')}{' '}
                  <span
                    className={cx(
                      'block sm:inline',
                      highGraphics
                        ? 'bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent'
                        : 'text-indigo-600'
                    )}
                  >
                    {t('heroSub')}
                  </span>
                </h1>

                <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                  {t('heroDesc')}
                </p>

                {/* Hero CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-1 sm:pt-2">
                  <Link
                    to="/signup"
                    className={cx(
                      'w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-2.5 transition-all cursor-pointer active:scale-95 shadow-md',
                      highGraphics
                        ? 'bg-linear-to-r from-indigo-600 via-indigo-700 to-violet-600 shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:scale-102'
                        : 'bg-indigo-600 hover:bg-indigo-700'
                    )}
                  >
                    <span>{t('getStarted')}</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </Link>

                  <a
                    href="#features"
                    className={cx(
                      'w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95',
                      highGraphics
                        ? 'bg-white text-slate-700 border border-slate-200 shadow-sm hover:bg-slate-50'
                        : 'bg-white text-slate-800 border border-slate-300 hover:bg-slate-100'
                    )}
                  >
                    <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-indigo-600 text-indigo-600 shrink-0" />
                    <span>{t('exploreCourses')}</span>
                  </a>
                </div>

                {/* Trust Badges */}
                <div className="pt-4 sm:pt-6 flex flex-wrap items-center justify-center lg:justify-start gap-3 sm:gap-6 text-[11px] sm:text-xs text-slate-500 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
                    <span>24/7 AI Doubt Answers</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
                    <span>Interactive Markdown Lessons</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
                    <span>100% Free Signup</span>
                  </div>
                </div>
              </div>

              {/* Right Column: Hero Illustration */}
              <div className="lg:col-span-5 flex justify-center w-full">
                {highGraphics ? (
                  <div className="relative w-full max-w-sm sm:max-w-md animate-float">
                    {/* Glowing Blob */}
                    <div className="absolute inset-0 bg-linear-to-tr from-indigo-500 to-pink-500 rounded-3xl blur-2xl opacity-40 animate-pulse-glow"></div>

                    {/* Interactive Graphic Card */}
                    <div className="relative bg-white/95 backdrop-blur-xl border border-white/80 p-4 sm:p-6 rounded-3xl shadow-2xl space-y-4 sm:space-y-5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shrink-0">
                            <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">AI Student Assistant</h4>
                            <p className="text-[10px] sm:text-[11px] text-emerald-600 font-semibold truncate">● Live Session Active</p>
                          </div>
                        </div>
                        <span className="px-2 sm:px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] sm:text-xs font-bold flex items-center gap-1 shrink-0">
                          <Zap className="w-3 h-3 fill-amber-500 shrink-0" /> 14D Streak
                        </span>
                      </div>

                      <div className="p-3 sm:p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                        <p className="text-[11px] sm:text-xs text-slate-600 font-medium">"How do I balance chemical equations using AI?"</p>
                        <div className="p-2 sm:p-2.5 bg-indigo-50 rounded-xl border border-indigo-100 text-[11px] sm:text-xs text-indigo-900 font-semibold">
                          💡 Step 1: Count atoms on reactants vs products side...
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        <div className="p-2.5 sm:p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 text-center">
                          <div className="text-base sm:text-lg font-black text-indigo-700">98.4%</div>
                          <div className="text-[9px] sm:text-[10px] font-bold text-slate-500">Quiz Accuracy</div>
                        </div>
                        <div className="p-2.5 sm:p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-center">
                          <div className="text-base sm:text-lg font-black text-emerald-700">+350 XP</div>
                          <div className="text-[9px] sm:text-[10px] font-bold text-slate-500">Earned Today</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Normal Mode Fallback: Clean Flat Badge */
                  <div className="w-full max-w-sm bg-white border-2 border-indigo-200 p-5 sm:p-6 rounded-2xl shadow-xs text-center space-y-3 sm:space-y-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-indigo-100 text-indigo-700 mx-auto flex items-center justify-center">
                      <Brain className="w-6 h-6 sm:w-8 sm:h-8" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">IntellEdu Smart Workspace</h3>
                    <p className="text-xs text-slate-600">Low-bandwidth optimized mode active. Maximum speed, zero distractions.</p>
                    <div className="inline-block px-3 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold">
                      ⚡ Normal Mode Active
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID SECTION */}
        <section id="features" className="py-12 sm:py-16 bg-white border-y border-slate-100">
          <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 space-y-2 sm:space-y-3">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                {t('featuresTitle')}
              </h2>
              <p className="text-xs sm:text-base text-slate-600 font-medium">
                {t('featuresSub')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {features.map((feature) => (
                <FeatureCard key={feature.id} item={feature} />
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS 3-STEP SECTION */}
        <section id="how-it-works" className="py-12 sm:py-16 bg-slate-50">
          <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12 space-y-2 sm:space-y-3">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight">
                {t('howItWorksTitle')}
              </h2>
              <p className="text-xs sm:text-base text-slate-600 font-medium">
                Get started in less than 2 minutes and experience personalized AI tutoring.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8">
              {steps.map((step) => (
                <StepCard key={step.stepNumber} item={step} />
              ))}
            </div>
          </div>
        </section>

        {/* STATS / IMPACT BAND */}
        <section className="py-10 sm:py-16 bg-white border-y border-slate-200">
          <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-3 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {stats.map((stat) => (
                <StatCounter key={stat.id} item={stat} />
              ))}
            </div>
          </div>
        </section>

        {/* FEATURED LESSONS (MARKDOWN PIPELINE DEMO) */}
        <section id="markdown-preview" className="relative py-14 sm:py-20 bg-linear-to-b from-slate-50 via-indigo-50/20 to-slate-50 overflow-hidden">
          {/* Ambient Glow */}
          {highGraphics && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
          )}

          <div className="max-w-5xl 2xl:max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8 sm:mb-12 space-y-2.5 sm:space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-100 text-indigo-800 text-[11px] sm:text-xs font-bold border border-indigo-200/70 shadow-2xs">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                <span>Rich Markdown Learning Pipeline</span>
              </div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                {t('featuredLessonTitle')}
              </h2>
              <p className="text-xs sm:text-sm md:text-base text-slate-600 max-w-xl mx-auto font-medium">
                {t('featuredLessonSub')}
              </p>
            </div>

            {/* Luxury Showcase Card */}
            <div
              className={cx(
                'rounded-3xl transition-all duration-300 overflow-hidden',
                highGraphics
                  ? 'bg-white/95 backdrop-blur-2xl border border-slate-200/90 shadow-[0_25px_60px_-15px_rgba(79,70,229,0.15)] ring-1 ring-slate-900/5'
                  : 'bg-white border-2 border-slate-300 shadow-md'
              )}
            >
              {/* Top Card Showcase Bar */}
              <div className="flex items-center justify-between px-5 sm:px-8 py-3.5 sm:py-4 bg-linear-to-r from-indigo-50/80 via-slate-50 to-purple-50/50 border-b border-slate-100">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-3 h-3 rounded-full bg-rose-400"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                  <span className="hidden xs:inline-block text-xs font-bold text-slate-700 ml-2">
                    about-intelledu.md
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] sm:text-xs font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Live Rendered
                  </span>
                </div>
              </div>

              {/* Main Markdown Body */}
              <div className="p-5 sm:p-8 lg:p-12">
                <MarkdownViewer content={aboutMd} />
              </div>

              {/* Bottom Quick Start CTA Bar */}
              <div className="px-5 sm:px-8 py-4 sm:py-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs sm:text-sm font-semibold text-slate-600 text-center sm:text-left">
                  Experience interactive Markdown lessons with AI doubt solving right inside IntellEdu.
                </p>
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <Link
                    to="/signup"
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-indigo-500/20 transition-all cursor-pointer active:scale-95"
                  >
                    <span>Start Learning Free</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;
