import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
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
  X,
  Sparkles,
  Home,
  ArrowRight,
  Users,
  BellRing,
} from 'lucide-react';
import { usePerformanceMode } from '../context/PerformanceModeContext';
import { useAuth } from '../context/useAuth';
import { progressApi } from '../services/api';
import {
  SidebarItem,
  SidebarKey
} from '../types';
import PerformanceToggle from '../components/PerformanceToggle';
import LanguageSelector from '../components/LanguageSelector';
import { cx } from '../utils/cx';

export const Dashboard: React.FC = () => {
  const { highGraphics } = usePerformanceMode();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = (location.pathname.split('/')[2] as SidebarKey | undefined) || 'overview';
  const [bouncingTab, setBouncingTab] = useState<SidebarKey | null>(null);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [profileOpen, setProfileOpen] = useState<boolean>(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const pingedRef = useRef<boolean>(false);

  // Ping streak silently on app load (Asia/Kolkata day calculation)
  useEffect(() => {
    if (pingedRef.current || !user?.id) return;
    pingedRef.current = true;

    progressApi.pingStreak()
      .catch((err) => {
        console.warn('Daily streak ping was deferred.', err);
      });
  }, [user?.id]);

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

  // Close dropdowns on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setNotificationsOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Premium tab switch: bounce the icon then navigate to its page
  const handleTabChange = (key: SidebarKey) => {
    if (key === activeTab) return;
    setBouncingTab(key);
    navigate(key === 'overview' ? '/dashboard' : `/dashboard/${key}`);
    setTimeout(() => setBouncingTab(null), 480);
  };

  const sidebarItems: SidebarItem[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'courses', label: 'My Courses', icon: BookOpen },
    { key: 'doubts', label: 'AI Doubt Solver', icon: Brain },
    { key: 'quizzes', label: 'Quizzes & XP', icon: Trophy },
    { key: 'community', label: 'Leaderboard & Friends', icon: Users },
    { key: 'progress', label: 'Progress & Stats', icon: BarChart3 },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  // Mobile Bottom Bar Primary Tabs
  const bottomNavItems: Array<{ key: SidebarKey; label: string; icon: typeof LayoutDashboard }> = [
    { key: 'overview', label: 'Home', icon: LayoutDashboard },
    { key: 'courses', label: 'Courses', icon: BookOpen },
    { key: 'doubts', label: 'AI', icon: Brain },
    { key: 'quizzes', label: 'Quizzes', icon: Trophy },
    { key: 'community', label: 'Ranks', icon: Users },
    { key: 'progress', label: 'Progress', icon: BarChart3 },
    { key: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row text-slate-900 sidebar-none overflow-x-hidden">

      {/* ─── SIDEBAR ─── Desktop persistent left sidebar (lg+). Hidden on mobile. ── */}
      <aside
        className="hidden lg:flex fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex-col shadow-2xl lg:shadow-none overflow-y-auto overscroll-contain"
      >
        {/* Sidebar Brand Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div
              className={cx(
                'w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 transition-transform group-hover:scale-105',
                highGraphics
                  ? 'bg-linear-to-tr from-indigo-500 to-violet-500 shadow-md shadow-indigo-500/30'
                  : 'bg-indigo-600'
              )}
            >
              <img src="/intelledu-logo.png" alt="" className="w-full h-full rounded-2xl object-cover" />
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
          {/* Page title — no hamburger gap on mobile; left-aligned naturally */}
          <div className="flex items-center min-w-0">
            <h1 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 capitalize truncate">
              {sidebarItems.find((item) => item.key === activeTab)?.label ?? 'Overview'}
            </h1>
          </div>

          {/* Top Bar Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Header XP Balance */}
            <div className="hidden xs:flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-black">
              <Award className="w-3.5 h-3.5 text-indigo-600" />
              <span>{(user?.points ?? 0).toLocaleString()} XP</span>
            </div>

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
                aria-expanded={notificationsOpen}
                aria-haspopup="menu"
              >
                {notificationsOpen
                  ? <BellRing className="w-4 h-4 sm:w-5 sm:h-5" />
                  : <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
                }
              </button>

              {notificationsOpen && (
                <div
                  className={cx(
                    'absolute right-0 mt-3 w-80 rounded-3xl overflow-hidden z-50',
                    // On small screens: constrain to viewport, solid background, scrollable
                    'max-w-[calc(100vw-24px)] max-h-[80vh] overflow-y-auto',
                    highGraphics
                      ? 'bg-white border border-slate-200/80 shadow-[0_20px_60px_-10px_rgba(79,70,229,0.2)] ring-1 ring-slate-900/5'
                      : 'bg-white border border-slate-200 shadow-xl'
                  )}
                >
                  {highGraphics && (
                    <div className="h-1 w-full bg-linear-to-r from-indigo-500 via-violet-500 to-pink-500" />
                  )}

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
                    <button
                      onClick={() => setNotificationsOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="p-6 text-center text-sm text-slate-500">
                    Notifications are not available for this account yet.
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
                aria-expanded={profileOpen}
                aria-haspopup="menu"
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
                </div>
                <span className="hidden sm:block text-xs font-bold text-slate-800 max-w-20 truncate leading-tight">
                  {user?.name?.split(' ')[0]}
                </span>
              </button>

              {profileOpen && (
                <div
                  role="menu"
                  className={cx(
                    // Base layout: right-aligned, full border-radius, clipped
                    'absolute right-0 mt-3 w-80 rounded-3xl overflow-hidden z-50',
                    // Mobile safety: constrain width to viewport, max-height with scroll,
                    // fully opaque background so page content is not visible through it.
                    'max-w-[calc(100vw-24px)] max-h-[85vh] overflow-y-auto',
                    highGraphics
                      ? 'bg-white border border-white/80 shadow-[0_25px_60px_-15px_rgba(79,70,229,0.25)] ring-1 ring-slate-900/5'
                      : 'bg-white border border-slate-200 shadow-xl'
                  )}
                >
                  {highGraphics && (
                    <div className="h-1 w-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500 shrink-0" />
                  )}

                  {/* Profile header */}
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
                          {user?.badge || 'STUDENT'}
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
                            {user?.grade || '—'}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            <Flame className="w-3 h-3 fill-amber-500" />
                            {user?.streak ?? 0} Day Streak
                          </span>
                        </div>
                      </div>
                    </div>

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
                          <span className="text-sm font-black text-slate-900">{(user?.points ?? 0).toLocaleString()} XP</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={cx(
                          'inline-block px-2.5 py-1 rounded-xl text-[10px] font-extrabold',
                          highGraphics
                            ? 'bg-linear-to-r from-indigo-500 to-violet-600 text-white shadow-xs shadow-indigo-500/30'
                            : 'bg-indigo-600 text-white'
                        )}>
                          {user?.badge || 'Student'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="p-2 space-y-1">

                    {/* HOME — navigates to public landing page "/" */}
                    <button
                      role="menuitem"
                      onClick={() => { setProfileOpen(false); navigate('/'); }}
                      className="group w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-emerald-50/80 transition-all duration-200 cursor-pointer min-h-11"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
                          <Home className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-600 block transition-colors">Home</span>
                          <span className="text-[10px] text-slate-400">Back to IntellEdu website</span>
                        </div>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                    </button>

                    {/* DASHBOARD */}
                    <button
                      role="menuitem"
                      onClick={() => { handleTabChange('overview'); setProfileOpen(false); }}
                      className="group w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-indigo-50/80 transition-all duration-200 cursor-pointer min-h-11"
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

                    {/* ACCOUNT SETTINGS */}
                    <button
                      role="menuitem"
                      onClick={() => { handleTabChange('settings'); setProfileOpen(false); }}
                      className="group w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-slate-50/80 transition-all duration-200 cursor-pointer min-h-11"
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

                    {/* AI DOUBT SOLVER */}
                    <button
                      role="menuitem"
                      onClick={() => { handleTabChange('doubts'); setProfileOpen(false); }}
                      className="group w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-violet-50/80 transition-all duration-200 cursor-pointer min-h-11"
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
                      <ArrowRight className="w-3.5 h-3.5 text-violet-600 group-hover:translate-x-0.5 transition-all" />
                    </button>
                  </div>

                  <div className="h-px bg-linear-to-r from-transparent via-slate-200 to-transparent mx-3" />

                  {/* SIGN OUT */}
                  <div className="p-2">
                    <button
                      role="menuitem"
                      onClick={() => { setProfileOpen(false); handleLogout(); }}
                      type="button"
                      className="group w-full flex items-center justify-between p-2.5 rounded-2xl hover:bg-rose-50/80 transition-colors cursor-pointer min-h-11"
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

        {/*
          Main content area.
          - pb-24 on mobile ensures content is never hidden behind the fixed bottom nav bar.
          - env(safe-area-inset-bottom) further adds space for devices with home indicator bars (iPhone notch etc).
          - lg:pb-8 restores normal padding on desktop (no bottom nav).
        */}
        <main
          className="flex-1 p-3.5 sm:p-6 lg:p-8 xl:p-10 w-full animate-fade-slide-up"
          style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}
        >
          <Outlet />
        </main>

      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR (lg:hidden) */}
      <nav
        className={cx(
          'lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-slate-200/60',
          highGraphics
            ? 'bg-white/80 backdrop-blur-2xl shadow-[0_-8px_32px_rgba(99,102,241,0.10)]'
            : 'bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.08)]'
        )}
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      >
        {highGraphics && (
          <div className="absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-indigo-500 via-violet-500 to-indigo-400 pointer-events-none" />
        )}

        <div className="relative px-1">
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
                  <div className="relative flex items-center justify-center">
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

                  <span
                    className={cx(
                      'text-[9px] xs:text-[10px] font-semibold leading-tight transition-colors duration-200 tracking-wide',
                      isActive ? 'text-indigo-600' : 'text-slate-400'
                    )}
                  >
                    {item.label}
                  </span>

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