import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Brain,
  Trophy,
  BarChart3,
  Settings,
  LogOut,
  Bell,
  Flame,
  Award,
  Zap,
  ChevronRight,
  Menu,
  X,
  Send,
  Sparkles,
  CheckCircle2,
  Home,
  ArrowRight,
  User,
  Star,
  BellRing,
  Gift,
  CheckCheck
} from 'lucide-react';
import { usePerformanceMode } from '../context/PerformanceModeContext';
import { useAuth } from '../context/AuthContext';
import {
  SidebarItem,
  SidebarKey,
  DashboardStat,
  Course,
  LeaderboardEntry
} from '../types';
import CourseCard from '../components/CourseCard';
import MarkdownViewer from '../components/MarkdownViewer';
import PerformanceToggle from '../components/PerformanceToggle';
import LanguageSelector from '../components/LanguageSelector';
import { cx } from '../utils/cx';

// Raw Markdown import for Today's Lesson Notes
import courseIntroMd from '../content/course-intro.md?raw';

export const Dashboard: React.FC = () => {
  const { highGraphics } = usePerformanceMode();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<SidebarKey>('overview');
  const [bouncingTab, setBouncingTab] = useState<SidebarKey | null>(null);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string }>>([
    { sender: 'ai', text: "Hello! I'm your IntellEdu AI Tutor. Ask me any science, math, or coding doubt!" }
  ]);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileSidebarOpen]);

  // Close popups on outside click
  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Premium tab switch: bounce the icon then change tab
  const handleTabChange = (key: SidebarKey) => {
    if (key === activeTab) return;
    setBouncingTab(key);
    setActiveTab(key);
    setTimeout(() => setBouncingTab(null), 480);
  };

  const sidebarItems: SidebarItem[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'courses', label: 'My Courses', icon: BookOpen },
    { key: 'doubts', label: 'AI Doubt Solver', icon: Brain },
    { key: 'quizzes', label: 'Quizzes & XP', icon: Trophy },
    { key: 'progress', label: 'Progress & Stats', icon: BarChart3 },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  // Mobile Bottom Bar Primary Tabs
  const bottomNavItems: Array<{ key: SidebarKey; label: string; icon: typeof LayoutDashboard }> = [
    { key: 'overview', label: 'Home', icon: LayoutDashboard },
    { key: 'courses', label: 'Courses', icon: BookOpen },
    { key: 'doubts', label: 'AI Doubts', icon: Brain },
    { key: 'quizzes', label: 'Quizzes', icon: Trophy },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  // Typed Mock Dashboard Stats
  const stats: DashboardStat[] = [
    { id: 'ds1', title: 'Courses in Progress', value: 4, label: '2 near completion', icon: BookOpen, color: 'indigo' },
    { id: 'ds2', title: 'Quizzes Completed', value: 28, label: '+4 this week', icon: Trophy, color: 'emerald' },
    { id: 'ds3', title: 'Current Streak', value: `${user?.streak || 14} Days`, label: 'Personal best!', icon: Flame, color: 'amber' },
    { id: 'ds4', title: 'Total XP Points', value: user?.points || 2850, label: 'Level 8 Scholar', icon: Award, color: 'purple' },
  ];

  // Typed Mock Courses
  const courses: Course[] = [
    {
      id: 'c1',
      title: 'Class 10 Science: Chemical Reactions & Equations',
      category: 'Chemistry',
      progressPercent: 75,
      totalLessons: 12,
      completedLessons: 9,
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'c2',
      title: 'Introduction to AI & Python Machine Learning',
      category: 'Computer Science',
      progressPercent: 45,
      totalLessons: 16,
      completedLessons: 7,
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80'
    },
    {
      id: 'c3',
      title: 'Interactive Physics: Electricity & Magnetism',
      category: 'Physics',
      progressPercent: 30,
      totalLessons: 10,
      completedLessons: 3,
      image: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80'
    }
  ];

  // Typed Mock Leaderboard
  const leaderboard: LeaderboardEntry[] = [
    { rank: 1, name: 'Priya Sharma', points: 3420, avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80', badge: '🥇 Master', streak: 21 },
    { rank: 2, name: 'Alex Johnson (You)', points: user?.points || 2850, avatar: user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', badge: '🥈 Diamond', streak: user?.streak || 14 },
    { rank: 3, name: 'Rahul Patel', points: 2610, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80', badge: '🥉 Gold', streak: 12 },
    { rank: 4, name: 'Ananya Gupta', points: 2400, avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80', badge: '⭐ Gold', streak: 9 },
    { rank: 5, name: 'Devansh Mehta', points: 2150, avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80', badge: '⭐ Silver', streak: 7 },
  ];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setChatInput('');

    setTimeout(() => {
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Great question about "${userText}"! Here is the AI step-by-step breakdown: First, break down the core variables, apply the standard formula, and verify units.`
        }
      ]);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-900 sidebar-none overflow-x-hidden">

      {/* MOBILE BACKDROP OVERLAY */}
      {mobileSidebarOpen && (
        <div
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* SIDEBAR (Desktop Left Sidebar / Mobile Drawer) */}
      <aside
        className={cx(
          'fixed inset-y-0 left-0 z-50 w-64 xs:w-72 sm:w-80 lg:w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 shadow-2xl lg:shadow-none overflow-y-auto overscroll-contain',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Sidebar Brand Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div
              className={cx(
                'w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 transition-transform group-hover:scale-105',
                highGraphics
                  ? 'bg-linear-to-tr from-indigo-500 to-violet-500 shadow-md shadow-indigo-500/30'
                  : 'bg-indigo-600'
              )}
            >
              <Brain className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-base sm:text-lg text-white tracking-tight leading-none">
                Intell<span className="text-indigo-400">Edu</span>
              </span>
              <span className="text-[9px] font-semibold uppercase tracking-wider text-slate-400 leading-tight">
                Student Portal
              </span>
            </div>
          </div>

          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 sm:px-4 py-4 sm:py-6 space-y-1.5 overflow-y-auto">
          {sidebarItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  handleTabChange(item.key);
                  setMobileSidebarOpen(false);
                }}
                className={cx(
                  'w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-98',
                  isActive
                    ? highGraphics
                      ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/25'
                      : 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white'
                )}
              >
                <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar User Profile Footer */}
        <div className="p-4 border-t border-slate-800 space-y-3 shrink-0">
          <div className="flex items-center gap-3 px-1">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-9 h-9 rounded-full object-cover border-2 border-indigo-500 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.grade}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => navigate('/')}
              className="w-full py-2 px-2 rounded-xl text-[11px] font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </button>
            <button
              onClick={handleLogout}
              className="w-full py-2 px-2 rounded-xl text-[11px] font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64 overflow-x-hidden">

        {/* TOP BAR (Full Width Edge-to-Edge) */}
        <header
          className={cx(
            'sticky top-0 z-30 h-14 sm:h-16 px-3 sm:px-6 lg:px-8 xl:px-12 w-full flex items-center justify-between border-b transition-all',
            highGraphics
              ? 'bg-white/90 backdrop-blur-xl border-slate-200/70 shadow-xs'
              : 'bg-white border-slate-200'
          )}
        >
        {/* Mobile Sidebar Toggle Button */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 sm:p-2 rounded-xl text-slate-700 hover:bg-slate-100 cursor-pointer active:scale-95"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <h1 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 capitalize truncate">
              {activeTab === 'doubts' ? 'AI Doubt Solver' : activeTab}
            </h1>
          </div>
          {/* Top Bar Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <LanguageSelector compactOnMobile />
            <PerformanceToggle compact />

            {/* ── PREMIUM NOTIFICATION BELL ── */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setNotificationsOpen(!notificationsOpen); setProfileOpen(false); }}
                className={cx(
                  'relative p-2 sm:p-2.5 rounded-xl cursor-pointer transition-all duration-200 active:scale-95',
                  highGraphics
                    ? notificationsOpen
                      ? 'bg-indigo-50 text-indigo-600 shadow-inner'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-indigo-600'
                    : 'text-slate-600 hover:bg-slate-100'
                )}
                aria-label="Notifications"
              >
                {notificationsOpen
                  ? <BellRing className="w-4 h-4 sm:w-5 sm:h-5" />
                  : <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                }
                {/* Animated unread badge */}
                <span className={cx(
                  'absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 border-2 border-white',
                  highGraphics && 'animate-pulse'
                )} />
              </button>

              {notificationsOpen && (
                <div
                  className={cx(
                    'absolute right-0 mt-3 w-80 max-w-[90vw] rounded-3xl overflow-hidden z-50',
                    highGraphics
                      ? 'bg-white/95 backdrop-blur-2xl border border-slate-200/80 shadow-[0_20px_60px_-10px_rgba(79,70,229,0.2)] ring-1 ring-slate-900/5'
                      : 'bg-white border border-slate-200 shadow-xl'
                  )}
                >
                  {/* Top gradient accent */}
                  {highGraphics && (
                    <div className="h-1 w-full bg-linear-to-r from-indigo-500 via-violet-500 to-pink-500" />
                  )}

                  {/* Header */}
                  <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className={cx(
                        'w-7 h-7 rounded-xl flex items-center justify-center',
                        highGraphics ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-100 text-indigo-600'
                      )}>
                        <BellRing className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-extrabold text-slate-900">Notifications</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cx(
                        'px-2 py-0.5 rounded-full text-[10px] font-black',
                        highGraphics
                          ? 'bg-linear-to-r from-rose-500 to-pink-500 text-white shadow-xs'
                          : 'bg-rose-100 text-rose-700'
                      )}>
                        2 New
                      </span>
                      <button
                        onClick={() => setNotificationsOpen(false)}
                        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Notification items */}
                  <div className="p-2.5 space-y-2">
                    {/* Notification 1 — Streak Reward */}
                    <div className={cx(
                      'group flex items-start gap-3 p-3 rounded-2xl transition-all duration-200 cursor-pointer',
                      highGraphics
                        ? 'bg-amber-50/60 hover:bg-amber-50 border border-amber-100/80'
                        : 'bg-amber-50 border border-amber-100'
                    )}>
                      <div className={cx(
                        'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs',
                        highGraphics
                          ? 'bg-linear-to-br from-amber-400 to-orange-500 text-white'
                          : 'bg-amber-400 text-white'
                      )}>
                        <Flame className="w-4 h-4 fill-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-extrabold text-slate-900 leading-tight">Streak Reward!</p>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                          You earned <span className="font-bold text-amber-600">+50 bonus XP</span> for your 14-day streak. Keep it up!
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block font-medium">2 min ago</span>
                      </div>
                      <Gift className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    </div>

                    {/* Notification 2 — New Module */}
                    <div className={cx(
                      'group flex items-start gap-3 p-3 rounded-2xl transition-all duration-200 cursor-pointer',
                      highGraphics
                        ? 'bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100/80'
                        : 'bg-indigo-50 border border-indigo-100'
                    )}>
                      <div className={cx(
                        'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-xs',
                        highGraphics
                          ? 'bg-linear-to-br from-indigo-500 to-violet-600 text-white'
                          : 'bg-indigo-500 text-white'
                      )}>
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-extrabold text-slate-900 leading-tight">New Module Unlocked!</p>
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                          <span className="font-bold text-indigo-600">Chemical Reactions & Equations</span> is now ready to start.
                        </p>
                        <span className="text-[10px] text-slate-400 mt-1 block font-medium">1 hour ago</span>
                      </div>
                      <Star className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between">
                    <button className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer transition-colors">
                      <CheckCheck className="w-3.5 h-3.5" />
                      Mark all read
                    </button>
                    <button className="text-[11px] font-semibold text-slate-500 hover:text-slate-700 cursor-pointer transition-colors">
                      View all
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* ── PREMIUM PROFILE BUTTON + POPUP ── */}
            <div className="relative" ref={profileRef}>
              <button
                onClick={() => { setProfileOpen(!profileOpen); setNotificationsOpen(false); }}
                type="button"
                aria-label="Profile menu"
                className={cx(
                  'flex items-center gap-2 p-1 pr-2.5 rounded-full transition-all duration-300 cursor-pointer select-none',
                  highGraphics
                    ? profileOpen
                      ? 'bg-indigo-50 border border-indigo-300 shadow-md shadow-indigo-500/10 ring-2 ring-indigo-500/15'
                      : 'bg-white border border-slate-200 hover:border-indigo-200 hover:shadow-md shadow-xs'
                    : 'bg-white border border-slate-300 hover:bg-slate-50'
                )}
              >
                <div className="relative">
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className={cx(
                      'w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover transition-transform duration-300',
                      highGraphics ? 'border-2 border-indigo-500 shadow-xs' : 'border border-indigo-400'
                    )}
                  />
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white" />
                </div>
                <span className="hidden sm:block text-xs font-bold text-slate-800 max-w-20 truncate leading-tight">
                  {user?.name?.split(' ')[0]}
                </span>
              </button>

              {profileOpen && (
                <div
                  className={cx(
                    'absolute right-0 mt-3 w-80 max-w-[90vw] rounded-3xl overflow-hidden z-50',
                    highGraphics
                      ? 'bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_25px_60px_-15px_rgba(79,70,229,0.25)] ring-1 ring-slate-900/5'
                      : 'bg-white border border-slate-200 shadow-xl'
                  )}
                >
                  {/* Top gradient */}
                  {highGraphics && (
                    <div className="h-1 w-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500" />
                  )}

                  {/* Profile hero */}
                  <div className={cx(
                    'p-5 border-b border-slate-100',
                    highGraphics && 'bg-linear-to-b from-indigo-50/50 to-transparent'
                  )}>
                    <div className="flex items-start gap-3.5">
                      <div className="relative shrink-0">
                        <img
                          src={user?.avatar}
                          alt={user?.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-indigo-500 shadow-md shadow-indigo-500/20"
                        />
                        <span className="absolute -bottom-1.5 -right-1.5 px-1.5 py-0.5 rounded-full bg-linear-to-r from-indigo-600 to-violet-600 text-white text-[9px] font-black shadow-sm">
                          PRO
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-extrabold text-slate-900 truncate">{user?.name}</h4>
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        </div>
                        <p className="text-[11px] text-slate-500 truncate font-medium mt-0.5">{user?.email}</p>
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                            {user?.grade || 'Grade 10'}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            <Flame className="w-3 h-3 fill-amber-500" />
                            {user?.streak || 14} Day Streak
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                            Online
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* XP Stats bar */}
                    <div className={cx(
                      'mt-4 p-3 rounded-2xl flex items-center justify-between',
                      highGraphics
                        ? 'bg-white/80 border border-slate-200/80 shadow-xs'
                        : 'bg-slate-50 border border-slate-200'
                    )}>
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                          <Award className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block leading-none">Total XP</span>
                          <span className="text-sm font-black text-slate-900">{(user?.points || 2850).toLocaleString()} XP</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={cx(
                          'inline-block px-2.5 py-1 rounded-xl text-[10px] font-extrabold',
                          highGraphics
                            ? 'bg-linear-to-r from-indigo-500 to-violet-600 text-white shadow-xs shadow-indigo-500/30'
                            : 'bg-indigo-600 text-white'
                        )}>
                          Level 8 Scholar
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">Top 5% of class</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu actions */}
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => { setActiveTab('overview'); setProfileOpen(false); }}
                      className="group w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-indigo-50/80 transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
                          <LayoutDashboard className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 block transition-colors">Dashboard</span>
                          <span className="text-[10px] text-slate-400">Courses, quizzes & stats</span>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                    </button>

                    <button
                      onClick={() => { setActiveTab('settings'); setProfileOpen(false); }}
                      className="group w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50/80 transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center group-hover:bg-slate-700 group-hover:text-white transition-colors shrink-0">
                          <Settings className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <span className="text-xs font-bold text-slate-800 block transition-colors">Account Settings</span>
                          <span className="text-[10px] text-slate-400">Privacy, notifications, theme</span>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-all" />
                    </button>

                    <button
                      onClick={() => { setActiveTab('doubts'); setProfileOpen(false); }}
                      className="group w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-violet-50/80 transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-colors shrink-0">
                          <Brain className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <span className="text-xs font-bold text-slate-800 block transition-colors">AI Doubt Solver</span>
                          <span className="text-[10px] text-slate-400">24/7 instant homework help</span>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-linear-to-r from-transparent via-slate-200 to-transparent mx-3" />

                  {/* Logout */}
                  <div className="p-2">
                    <button
                      onClick={() => { setProfileOpen(false); handleLogout(); }}
                      type="button"
                      className="group w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-rose-50/80 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors shrink-0">
                          <LogOut className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-rose-600">Sign Out</span>
                      </div>
                      <span className="text-[10px] text-rose-400 font-medium">End session</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* TAB CONTENTS (Full width responsive container) */}
        <main
          key={activeTab}
          className="flex-1 p-3.5 sm:p-6 lg:p-8 xl:p-10 space-y-6 sm:space-y-8 pb-24 lg:pb-8 w-full animate-fade-slide-up"
        >

          {/* OVERVIEW TAB (DEFAULT) */}
          {activeTab === 'overview' && (
            <>
              {/* Greeting Hero Card */}
              <div
                className={cx(
                  'p-5 sm:p-8 rounded-2xl sm:rounded-3xl text-white relative overflow-hidden transition-all w-full',
                  highGraphics
                    ? 'bg-linear-to-r from-indigo-600 via-indigo-700 to-violet-700 shadow-xl shadow-indigo-500/20'
                    : 'bg-indigo-900'
                )}
              >
                {highGraphics && (
                  <div className="absolute -right-10 -bottom-10 w-48 sm:w-64 h-48 sm:h-64 bg-violet-400/20 rounded-full blur-2xl pointer-events-none"></div>
                )}

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-[10px] sm:text-xs font-bold">
                      <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 shrink-0" />
                      <span>{user?.streak || 14} Day Daily Learning Streak!</span>
                    </div>
                    <h2 className="text-xl xs:text-2xl sm:text-3xl font-black leading-tight">
                      Welcome back, {user?.name || 'Student'}! 👋
                    </h2>
                    <p className="text-xs sm:text-sm text-indigo-100/90 max-w-xl leading-relaxed">
                      You are on track to complete your Chemistry goal. Resume your active lesson below or ask AI any questions.
                    </p>
                  </div>

                  <div className="flex items-center gap-2.5 pt-1 sm:pt-0">
                    <button
                      onClick={() => setActiveTab('doubts')}
                      className={cx(
                        'w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer active:scale-95 text-center shadow-md',
                        highGraphics
                          ? 'bg-white text-indigo-700 hover:bg-indigo-50'
                          : 'bg-white text-indigo-900 hover:bg-slate-100'
                      )}
                    >
                      Ask AI Doubt
                    </button>
                  </div>
                </div>
              </div>

              {/* STAT CARDS ROW */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 w-full">
                {stats.map((stat) => {
                  const StatIcon = stat.icon;
                  return (
                    <div
                      key={stat.id}
                      className={cx(
                        'p-3.5 xs:p-4 sm:p-5 rounded-2xl transition-all flex flex-col justify-between',
                        highGraphics
                          ? 'bg-white/90 backdrop-blur-md border border-slate-100 shadow-md shadow-slate-200/50 hover:-translate-y-0.5'
                          : 'bg-white border border-slate-200'
                      )}
                    >
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <span className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider line-clamp-1">
                          {stat.title}
                        </span>
                        <div
                          className={cx(
                            'w-7 h-7 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0',
                            highGraphics
                              ? stat.color === 'indigo' ? 'bg-indigo-50 text-indigo-600'
                              : stat.color === 'emerald' ? 'bg-emerald-50 text-emerald-600'
                              : stat.color === 'amber' ? 'bg-amber-50 text-amber-600'
                              : 'bg-purple-50 text-purple-600'
                              : 'bg-slate-100 text-slate-700'
                          )}
                        >
                          <StatIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                      </div>
                      <div>
                        <div className="text-xl sm:text-2xl font-black text-slate-900">{stat.value}</div>
                        <div className="text-[10px] sm:text-[11px] font-semibold text-slate-500 mt-0.5 truncate">{stat.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* CONTINUE LEARNING (HORIZONTALLY SCROLLABLE CAROUSEL) */}
              <div className="space-y-3 sm:space-y-4 w-full">
                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900">Continue Learning</h3>
                  <button
                    onClick={() => setActiveTab('courses')}
                    className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div
                  className="grid gap-4 sm:gap-5 w-full"
                  style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}
                >
                  {courses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      onResume={(id) => alert(`Resuming Course: ${course.title}`)}
                    />
                  ))}
                </div>
              </div>

              {/* GRID: TODAY'S LESSON NOTES (MARKDOWN) + LEADERBOARD WIDGET */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 w-full">

                {/* Left: Markdown Lesson Panel */}
                <div
                  className={cx(
                    'lg:col-span-7 p-4 sm:p-7 rounded-2xl sm:rounded-3xl transition-all overflow-hidden',
                    highGraphics
                      ? 'bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-xl shadow-slate-200/50'
                      : 'bg-white border-2 border-slate-300'
                  )}
                >
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 gap-2">
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 truncate">
                      <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600 shrink-0" />
                      <span className="truncate">Today's Lesson Notes</span>
                    </h3>
                    <span className="px-2 sm:px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold whitespace-nowrap">
                      Markdown Engine
                    </span>
                  </div>

                  <MarkdownViewer content={courseIntroMd} compact={!highGraphics} />
                </div>

                {/* Right: Leaderboard Widget */}
                <div
                  className={cx(
                    'lg:col-span-5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl transition-all flex flex-col justify-between space-y-4',
                    highGraphics
                      ? 'bg-white/90 backdrop-blur-xl border border-slate-200/80 shadow-xl shadow-slate-200/50'
                      : 'bg-white border-2 border-slate-300'
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
                        <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 shrink-0" />
                        <span>Class Leaderboard</span>
                      </h3>
                      <span className="text-[11px] sm:text-xs font-bold text-indigo-600">Weekly Top 5</span>
                    </div>

                    <div className="space-y-2.5">
                      {leaderboard.map((entry) => (
                        <div
                          key={entry.rank}
                          className={cx(
                            'p-2.5 sm:p-3 rounded-xl sm:rounded-2xl flex items-center justify-between transition-all gap-2',
                            entry.rank === 2
                              ? highGraphics
                                ? 'bg-indigo-50/80 border border-indigo-200 shadow-xs'
                                : 'bg-indigo-50 border border-indigo-200'
                              : 'bg-slate-50/80 hover:bg-slate-100'
                          )}
                        >
                          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                            <span className="w-5 text-center text-xs font-extrabold text-slate-700 shrink-0">
                              #{entry.rank}
                            </span>
                            <img
                              src={entry.avatar}
                              alt={entry.name}
                              className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-slate-300 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-900 truncate">{entry.name}</p>
                              <span className="text-[10px] font-semibold text-slate-500 truncate block">
                                🔥 {entry.streak}D Streak
                              </span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-xs font-black text-indigo-600">
                              {entry.points.toLocaleString()} XP
                            </div>
                            <span className="text-[10px] font-bold text-amber-600">{entry.badge}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 text-center">
                    <p className="text-[11px] text-slate-500">Complete daily quizzes to gain +50 XP and climb!</p>
                  </div>
                </div>

              </div>
            </>
          )}

          {/* AI DOUBT SOLVER TAB */}
          {activeTab === 'doubts' && (
            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 w-full">
              <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xs w-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                    <Brain className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">AI Instant Doubt Solver</h2>
                    <p className="text-xs text-slate-500">Ask any question in Science, Math, or Coding.</p>
                  </div>
                </div>

                <div className="h-[45vh] sm:h-96 overflow-y-auto p-3 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-3 mb-3 sm:mb-4">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={cx(
                        'flex',
                        msg.sender === 'user' ? 'justify-end' : 'justify-start'
                      )}
                    >
                      <div
                        className={cx(
                          'max-w-[85%] sm:max-w-md p-3 sm:p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed font-medium',
                          msg.sender === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-none shadow-xs'
                            : 'bg-white text-slate-800 border border-slate-200 shadow-xs rounded-bl-none'
                        )}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Type your doubt (e.g. Explain Newton's Law)..."
                    className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs sm:text-sm border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50 min-w-0"
                  />
                  <button
                    type="submit"
                    className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-700 cursor-pointer active:scale-95 shrink-0"
                  >
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* MY COURSES TAB (100% Full-Width Responsive Grid) */}
          {activeTab === 'courses' && (
            <div className="space-y-4 sm:space-y-6 w-full">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">All Enrolled Courses</h2>
                  <p className="text-xs sm:text-sm text-slate-500">Pick up where you left off across your active courses.</p>
                </div>
              </div>

              {/* Responsive Grid: 1 col on mobile (100% full width), 2 col on tablet/small laptop, 3 col on large screens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 w-full">
                {courses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onResume={(id) => alert(`Resuming Course: ${course.title}`)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* QUIZZES TAB */}
          {activeTab === 'quizzes' && (
            <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-slate-200 text-center space-y-4 max-w-xl mx-auto">
              <Trophy className="w-12 h-12 text-amber-500 mx-auto" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Gamified Daily Quizzes</h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Test your knowledge with 5-minute rapid quizzes to earn XP points and unlock achievements.
              </p>
              <button className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 cursor-pointer shadow-md active:scale-95">
                Start Today's Quiz (+100 XP)
              </button>
            </div>
          )}

          {/* PROGRESS TAB */}
          {activeTab === 'progress' && (
            <div className="bg-white p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-slate-200 text-center space-y-4 max-w-xl mx-auto">
              <BarChart3 className="w-12 h-12 text-indigo-600 mx-auto" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Learning Analytics</h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Track your accuracy, total study time, and skill mastery over time.
              </p>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl border border-slate-200 space-y-5 sm:space-y-6 max-w-2xl mx-auto">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">Account & Preferences</h2>

              <div className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 bg-slate-50 rounded-2xl gap-2 sm:gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900">Graphics Performance Mode</h4>
                    <p className="text-slate-500 text-[11px] sm:text-xs">Toggle between ambient gradients and lightweight flat UI.</p>
                  </div>
                  <div className="self-start sm:self-auto">
                    <PerformanceToggle />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 bg-slate-50 rounded-2xl gap-2 sm:gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900">Interface Language</h4>
                    <p className="text-slate-500 text-[11px] sm:text-xs">Choose your preferred language.</p>
                  </div>
                  <div className="self-start sm:self-auto">
                    <LanguageSelector />
                  </div>
                </div>
              </div>
            </div>
          )}

        </main>

      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR (lg:hidden) */}
      {/* ─────────────────────────────────────────────────────
           MOBILE BOTTOM NAVIGATION BAR — Premium Animated
      ───────────────────────────────────────────────────── */}
      <nav
        className={cx(
          'lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-slate-200/60',
          highGraphics
            ? 'bg-white/80 backdrop-blur-2xl shadow-[0_-8px_32px_rgba(99,102,241,0.10)]'
            : 'bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.08)]'
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {/* Gradient top-border accent (High Graphics only) */}
        {highGraphics && (
          <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-indigo-500 via-violet-500 to-indigo-400 pointer-events-none" />
        )}

        {/* Sliding active pill indicator */}
        <div className="relative px-1">
          {/* Pill */}
          <div
            className={cx(
              'absolute top-1 h-[calc(100%-8px)] rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] pointer-events-none',
              highGraphics ? 'bg-indigo-50' : 'bg-indigo-50/80'
            )}
            style={{
              width: `${100 / bottomNavItems.length}%`,
              left: `${(bottomNavItems.findIndex(i => i.key === activeTab) * 100) / bottomNavItems.length}%`,
            }}
          />

          {/* Nav buttons */}
          <div className="flex items-center justify-around py-1.5">
            {bottomNavItems.map((item) => {
              const IconComp = item.icon;
              const isActive = activeTab === item.key;
              const isBouncing = bouncingTab === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => handleTabChange(item.key)}
                  className="relative flex flex-col items-center justify-center py-0.5 px-1 cursor-pointer min-w-13 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl"
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {/* Icon wrapper with bounce + ripple */}
                  <div className="relative flex items-center justify-center">
                    {/* Ripple on tap */}
                    {isBouncing && highGraphics && (
                      <span className="absolute w-8 h-8 rounded-full bg-indigo-400/30 animate-nav-ripple pointer-events-none" />
                    )}
                    <div
                      className={cx(
                        'p-1.5 rounded-xl transition-colors duration-200',
                        isBouncing ? 'animate-nav-bounce' : '',
                        isActive
                          ? highGraphics
                            ? 'text-indigo-600'
                            : 'text-indigo-700'
                          : 'text-slate-400'
                      )}
                    >
                      <IconComp className="w-5 h-5" strokeWidth={isActive ? 2.4 : 1.8} />
                    </div>
                  </div>

                  {/* Label */}
                  <span
                    className={cx(
                      'text-[9px] xs:text-[10px] font-semibold leading-tight transition-colors duration-200 tracking-wide',
                      isActive ? 'text-indigo-600' : 'text-slate-400'
                    )}
                  >
                    {item.label}
                  </span>

                  {/* Active dot */}
                  {isActive && (
                    <span className={cx(
                      'absolute -bottom-0.5 w-1 h-1 rounded-full',
                      highGraphics ? 'bg-indigo-500' : 'bg-indigo-600'
                    )} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </nav>

    </div>
  );
};

export default Dashboard;
