import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Brain,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  Sparkles,
  Flame,
  Award,
  ArrowRight
} from 'lucide-react';
import { usePerformanceMode } from '../context/PerformanceModeContext';
import { useAuth } from '../context/useAuth';
import PerformanceToggle from './PerformanceToggle';
import LanguageSelector from './LanguageSelector';
import { cx } from '../utils/cx';

export const Navbar: React.FC = () => {
  const { highGraphics, t } = usePerformanceMode();
  const { isLoggedIn, user, logout } = useAuth();
  const [mobileMenuState, setMobileMenuState] = useState<{ path: string; open: boolean } | null>(null);
  const [userDropdownState, setUserDropdownState] = useState<{ path: string; open: boolean } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const mobileMenuOpen = mobileMenuState?.path === location.pathname && mobileMenuState.open;
  const userDropdownOpen = userDropdownState?.path === location.pathname && userDropdownState.open;
  const setMobileMenuOpen = (open: boolean) => setMobileMenuState({ path: location.pathname, open });
  const setUserDropdownOpen = (open: boolean) => setUserDropdownState({ path: location.pathname, open });

  // Close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownState({ path: location.pathname, open: false });
      }
    };
    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [location.pathname, userDropdownOpen]);

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const navLinks = [
    { label: t('navHome'), path: '/' },
    { label: t('navFeatures'), path: '/#features' },
    { label: t('navCourses'), path: '/#courses' },
    ...(isLoggedIn ? [{ label: t('navDashboard'), path: '/dashboard' }] : [])
  ];

  return (
    <header
      className={cx(
        'sticky top-0 z-50 w-full transition-all duration-300',
        highGraphics
          ? 'bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-xs shadow-indigo-500/5'
          : 'bg-white border-b border-slate-200'
      )}
    >
      {/* 100% Full Width Edge-to-Edge Container */}
      <div className="w-full px-3 xs:px-4 sm:px-6 md:px-8 lg:px-10 xl:px-14 2xl:px-16">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-3">

          {/* IntellEdu Logo (Left Edge) */}
          <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0 min-w-0">
            <img
              src="/intelledu-logo.png"
              alt=""
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover shrink-0 transition-transform duration-300 group-hover:scale-105"
            />
            <div className="flex flex-col min-w-0">
              <span className="font-extrabold text-base sm:text-xl tracking-tight text-slate-900 leading-none">
                Intell<span className="text-indigo-600">Edu</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-indigo-600/90 leading-tight mt-0.5 block">
                Smart Education
              </span>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-8 xl:gap-10">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={cx(
                    'text-xs lg:text-sm font-semibold transition-colors py-1',
                    isActive
                      ? 'text-indigo-600 font-bold'
                      : 'text-slate-600 hover:text-indigo-600'
                  )}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Bar (Right Edge) */}
          <div className="hidden lg:flex items-center gap-3 xl:gap-4 shrink-0">
            <LanguageSelector />
            <PerformanceToggle />

            {isLoggedIn && user ? (
              <div className="relative" ref={dropdownRef}>
                {/* Luxury Profile Trigger Button */}
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  type="button"
                  aria-expanded={userDropdownOpen}
                  aria-label="User profile menu"
                  className={cx(
                    'group flex items-center gap-2.5 p-1 pl-2 sm:pl-2.5 pr-2.5 sm:pr-3 rounded-full transition-all duration-300 cursor-pointer select-none focus-visible:ring-2 focus-visible:ring-indigo-500',
                    highGraphics
                      ? userDropdownOpen
                        ? 'bg-linear-to-r from-indigo-50 to-violet-50 border border-indigo-300 shadow-md shadow-indigo-500/15 ring-2 ring-indigo-500/20'
                        : 'bg-white hover:bg-slate-50 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-200'
                      : 'bg-white border border-slate-300 hover:bg-slate-100'
                  )}
                >
                  <div className="relative">
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className={cx(
                        'w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover transition-transform duration-300 group-hover:scale-105',
                        highGraphics
                          ? 'border-2 border-indigo-500 shadow-xs'
                          : 'border border-indigo-400'
                      )}
                    />
                    {/* Live Online Dot */}
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white"></span>
                  </div>

                  <div className="flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 max-w-27.5 sm:max-w-32.5 truncate leading-tight">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-indigo-600 font-semibold leading-none">
                      {user.grade || 'Student'}
                    </span>
                  </div>

                  <ChevronDown
                    className={cx(
                      'w-3.5 h-3.5 text-slate-400 transition-transform duration-300',
                      userDropdownOpen ? 'rotate-180 text-indigo-600' : 'group-hover:text-slate-600'
                    )}
                  />
                </button>

                {/* Ultra-Luxury User Profile Dropdown Popup */}
                {userDropdownOpen && (
                  <div
                    className={cx(
                      'absolute right-0 mt-3 w-80 rounded-3xl overflow-hidden z-50 transition-all transform-gpu',
                      highGraphics
                        ? 'bg-white/95 backdrop-blur-2xl border border-white/80 shadow-[0_25px_60px_-15px_rgba(79,70,229,0.25)] ring-1 ring-slate-900/5 animate-in fade-in zoom-in-95 duration-200'
                        : 'bg-white border border-slate-300 shadow-xl'
                    )}
                  >
                    {/* Top Decorative Gradient Accent */}
                    {highGraphics && (
                      <div className="h-1.5 w-full bg-linear-to-r from-indigo-500 via-purple-500 to-pink-500" />
                    )}

                    {/* Profile Header Card */}
                    <div className="p-4 sm:p-5 bg-linear-to-b from-indigo-50/60 to-transparent border-b border-slate-100">
                      <div className="flex items-start gap-3.5">
                        <div className="relative">
                          <img
                            src={user.avatar}
                            alt={user.name}
                            className="w-12 h-12 rounded-2xl object-cover border-2 border-indigo-500 shadow-md shadow-indigo-500/20 shrink-0"
                          />
                          <span className="absolute -bottom-1 -right-1 px-1.5 py-0.2 rounded-full bg-indigo-600 text-white text-[9px] font-black shadow-xs">
                            PRO
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="text-sm font-extrabold text-slate-900 truncate">
                              {user.name}
                            </h4>
                            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          </div>
                          <p className="text-[11px] text-slate-500 truncate font-medium mt-0.5">
                            {user.email}
                          </p>
                          <div className="mt-1.5 flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold">
                              {user.grade}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                              <Flame className="w-3 h-3 fill-amber-500" /> {user.streak || 14}D
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Mini XP & Level Stats Bar */}
                      <div className="mt-3.5 p-2.5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-black text-xs">
                            <Award className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block leading-none">
                              Total XP
                            </span>
                            <span className="text-xs font-black text-slate-900 leading-tight">
                              {(user.points || 2850).toLocaleString()} XP
                            </span>
                          </div>
                        </div>

                        <span className="px-2 py-1 rounded-xl bg-linear-to-r from-indigo-500 to-violet-600 text-white text-[10px] font-extrabold shadow-xs">
                          Level 8 Scholar
                        </span>
                      </div>
                    </div>

                    {/* Menu Actions */}
                    <div className="p-2 space-y-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="group flex items-center justify-between p-2.5 rounded-2xl hover:bg-indigo-50/80 transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-200 shrink-0">
                            <LayoutDashboard className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 block transition-colors">
                              Student Dashboard
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Courses, quizzes & stats
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
                      </Link>

                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="group flex items-center justify-between p-2.5 rounded-2xl hover:bg-purple-50/80 transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors duration-200 shrink-0">
                            <Brain className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-slate-800 group-hover:text-purple-600 block transition-colors">
                              AI Doubt Solver
                            </span>
                            <span className="text-[10px] text-slate-400">
                              24/7 instant homework help
                            </span>
                          </div>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                      </Link>
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-linear-to-r from-transparent via-slate-200 to-transparent mx-3" />

                    {/* Logout Footer */}
                    <div className="p-2">
                      <button
                        onClick={handleLogout}
                        type="button"
                        className="w-full flex items-center justify-between p-2.5 rounded-2xl text-xs font-bold text-rose-600 hover:bg-rose-50/80 transition-colors duration-200 cursor-pointer group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors duration-200 shrink-0">
                            <LogOut className="w-4 h-4" />
                          </div>
                          <span>{t('navLogout')}</span>
                        </div>
                        <span className="text-[10px] text-rose-400 font-medium">End session</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  {t('navLogin')}
                </Link>
                <Link
                  to="/signup"
                  className={cx(
                    'px-4 py-1.5 rounded-xl text-xs font-bold text-white transition-all whitespace-nowrap',
                    highGraphics
                      ? 'bg-linear-to-r from-indigo-600 to-violet-600 shadow-md shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-102'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  )}
                >
                  {t('navSignup')}
                </Link>
              </div>
            )}
          </div>

          {/* Right Mobile / Tablet Controls (< lg) */}
          <div className="flex items-center gap-1.5 sm:gap-2 lg:hidden shrink-0">
            <LanguageSelector compactOnMobile />
            <PerformanceToggle compact />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-1.5 sm:p-2 rounded-xl text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white/95 backdrop-blur-xl px-4 pt-3 pb-6 space-y-3 max-h-[calc(100vh-4rem)] overflow-y-auto shadow-2xl">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-800 hover:bg-indigo-50 hover:text-indigo-600 active:bg-indigo-100"
              >
                <span>{link.label}</span>
              </Link>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2.5">
            {isLoggedIn && user ? (
              <>
                <div className="flex items-center gap-3 px-3 py-2 bg-slate-50 rounded-2xl">
                  <img src={user.avatar} alt="" className="w-9 h-9 rounded-full object-cover border border-indigo-300" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate">{user.name}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user.grade}</p>
                  </div>
                </div>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 flex items-center justify-center gap-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Go to Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  type="button"
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('navLogout')}</span>
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-3 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200"
                >
                  {t('navLogin')}
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm"
                >
                  {t('navSignup')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
