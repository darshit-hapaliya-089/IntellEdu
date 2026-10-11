import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Globe, Code2, Share2, PlayCircle, Heart } from 'lucide-react';
import { usePerformanceMode } from '../context/PerformanceModeContext';
import { cx } from '../utils/cx';

export const Footer: React.FC = () => {
  const { highGraphics, t } = usePerformanceMode();

  return (
    <footer
      className={cx(
        'relative pt-12 sm:pt-16 pb-8 overflow-hidden transition-all',
        highGraphics
          ? 'bg-slate-900 text-slate-300'
          : 'bg-slate-950 text-slate-400 border-t border-slate-800'
      )}
    >
      {/* Background ambient glow effect for High Graphics mode */}
      {highGraphics && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-indigo-600/10 blur-3xl pointer-events-none rounded-full"></div>
      )}

      <div className="max-w-7xl 2xl:max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 pb-10 sm:pb-12 border-b border-slate-800">

          {/* Column 1: Brand */}
          <div className="sm:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <img src="/intelledu-logo.png" alt="" className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl object-cover shrink-0 shadow-md shadow-indigo-500/20" />
              <div className="flex flex-col">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white leading-none">
                  Intell<span className="text-indigo-400">Edu</span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400/90 leading-tight mt-0.5">
                  Smart Education
                </span>
              </div>
            </Link>
            <p className="text-xs sm:text-sm text-slate-400 max-w-sm leading-relaxed">
              {t('footerTagline')} Empowering students worldwide with AI-driven adaptive learning, Markdown notes, and interactive quizzes.
            </p>

            {/* Support CTA Button */}
            <div className="pt-2">
              <a
                href="https://wa.me/917383238087?text=Hello%20IntellEdu%20Support"
                target="_blank"
                rel="noreferrer"
                className={cx(
                  'inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95',
                  highGraphics
                    ? 'bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/30'
                    : 'bg-emerald-700 hover:bg-emerald-600'
                )}
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp Live Support</span>
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 sm:mb-4">
              {t('footerQuickLinks')}
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link to="/" className="hover:text-indigo-400 transition-colors py-0.5 inline-block">Home Page</Link></li>
              <li><a href="#features" className="hover:text-indigo-400 transition-colors py-0.5 inline-block">AI Features</a></li>
              <li><a href="#courses" className="hover:text-indigo-400 transition-colors py-0.5 inline-block">All Courses</a></li>
              <li><a href="#how-it-works" className="hover:text-indigo-400 transition-colors py-0.5 inline-block">How It Works</a></li>
            </ul>
          </div>

          {/* Column 3: Platform & Docs */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 sm:mb-4">
              Resources & Notes
            </h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><a href="#markdown-preview" className="hover:text-indigo-400 transition-colors py-0.5 inline-block">Markdown Lessons</a></li>
              <li><a href="#changelog" className="hover:text-indigo-400 transition-colors py-0.5 inline-block">Changelog & Updates</a></li>
              <li><Link to="/dashboard" className="hover:text-indigo-400 transition-colors py-0.5 inline-block">Student Dashboard</Link></li>
              <li><a href="#privacy" className="hover:text-indigo-400 transition-colors py-0.5 inline-block">Privacy & Terms</a></li>
            </ul>
          </div>

          {/* Column 4: Social Links */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 sm:mb-4">
              Connect With Us
            </h4>
            <div className="flex flex-wrap gap-2.5">
              {[
                { icon: Globe, label: "Global", href: "https://intelledu.org" },
                { icon: Code2, label: "Developer", href: "https://github.com" },
                { icon: Share2, label: "Share", href: "https://twitter.com" },
                { icon: PlayCircle, label: "Video Lessons", href: "https://youtube.com" }
              ].map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <a
                    key={idx}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    title={item.label}
                    className={cx(
                      'w-9 h-9 rounded-xl flex items-center justify-center transition-all',
                      highGraphics
                        ? 'bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white hover:scale-110 shadow-md'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                    )}
                  >
                    <IconComp className="w-4 h-4" />
                  </a>
                );
              })}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3 text-center sm:text-left">
          <p>{t('footerRights')}</p>
          <div className="flex items-center justify-center gap-1 text-slate-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>for students worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
