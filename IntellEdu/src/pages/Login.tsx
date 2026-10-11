import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ArrowRight, Check } from 'lucide-react';
import { usePerformanceMode } from '../context/PerformanceModeContext';
import { useAuth } from '../context/useAuth';
import { LoginFormData } from '../types';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { cx } from '../utils/cx';
import FirebaseAuthOptions from '../components/auth/FirebaseAuthOptions';
import OtpVerificationPanel from '../components/auth/OtpVerificationPanel';
import FirebasePhoneOtpPanel from '../components/auth/FirebasePhoneOtpPanel';
import WhatsAppOtpPanel from '../components/auth/WhatsAppOtpPanel';

type FormErrors = Partial<Record<keyof LoginFormData, string>>;

export const Login: React.FC = () => {
  const { highGraphics } = usePerformanceMode();
  const { login, sendOtp, verifyOtp, authenticateFirebase } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<LoginFormData>({
    emailOrPhone: '',
    password: '',
    rememberMe: false
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [authError, setAuthError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.emailOrPhone.trim()) {
      newErrors.emailOrPhone = 'Email or phone number is required.';
    } else if (!formData.emailOrPhone.includes('@')) {
      newErrors.emailOrPhone = 'Password sign-in uses email. For phone sign-in, use the SMS OTP below.';
    }
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const requestLoginOtp = (channelOverride?: 'whatsapp' | 'email') => {
    const recipient = formData.emailOrPhone.trim();
    if (!recipient) throw new Error('Enter the email address or phone number for your account.');
    const channel = channelOverride || (recipient.includes('@') ? 'email' : 'whatsapp');
    return sendOtp({
      channel,
      flow: 'login',
      recipient: channel === 'email' ? recipient.toLowerCase() : recipient,
    });
  };

  const verifyLoginOtp = async (challengeId: string, code: string) => {
    await verifyOtp({ challengeId, code });
    navigate('/dashboard');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setAuthError(null);
    try {
      await login(formData.emailOrPhone, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Sign in failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFirebaseAuth = async (idToken: string) => {
    setAuthError(null);
    try {
      await authenticateFirebase(idToken, 'login');
      navigate('/dashboard');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Verified sign in failed.');
      throw err;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="grow flex items-center justify-center p-3 sm:p-6 lg:p-8">
        <div
          className={cx(
            'w-full max-w-4xl 2xl:max-w-5xl rounded-2xl sm:rounded-3xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 transition-all',
            highGraphics
              ? 'bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-2xl shadow-indigo-500/10'
              : 'bg-white border-2 border-slate-300'
          )}
        >
          {/* Left Branding Panel */}
          <div
            className={cx(
              'lg:col-span-5 p-6 sm:p-8 lg:p-10 flex flex-col justify-between text-white relative overflow-hidden',
              highGraphics
                ? 'bg-linear-to-br from-indigo-600 via-indigo-700 to-violet-800'
                : 'bg-indigo-900'
            )}
          >
            {highGraphics && (
              <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-violet-400/20 rounded-full blur-2xl animate-pulse-glow"></div>
            )}

            <div className="space-y-4 sm:space-y-6 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl overflow-hidden shadow-md shadow-indigo-500/25">
                  <img src="/intelledu-logo.png" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-2xl sm:text-3xl tracking-tight leading-none">IntellEdu</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-200/90 leading-tight mt-0.5">
                    Smart Education
                  </span>
                </div>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-black leading-tight">Welcome Back to Smart Learning!</h2>
                <p className="text-xs sm:text-sm text-indigo-100/90 mt-2 leading-relaxed">
                  Log in to access your personalized AI tutoring modules, resume active courses, and maintain your study streak.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 sm:space-y-3 pt-6 lg:pt-8 relative z-10">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-100">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>24/7 AI Doubt Solver Access</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-100">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Gamified Leaderboards & Badges</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-100">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Interactive Markdown Notes</span>
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
            <div className="mb-5 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Sign In to Your Account</h3>
              <p className="text-xs text-slate-500 mt-1">Enter your credentials to continue your learning journey.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
              {/* Email / Phone Field */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email or phone number
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 shrink-0" />
                  <input
                    type="text"
                    autoComplete="username"
                    value={formData.emailOrPhone}
                    onChange={(e) => setFormData({ ...formData, emailOrPhone: e.target.value })}
                    placeholder="Email or phone in international format (+919876543210)"
                    className={cx(
                      'w-full pl-10 pr-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500',
                      errors.emailOrPhone
                        ? 'border-2 border-rose-500 bg-rose-50/30'
                        : 'border border-slate-300 bg-slate-50/50 focus:bg-white'
                    )}
                  />
                </div>
                {errors.emailOrPhone && (
                  <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.emailOrPhone}</p>
                )}
                {formData.emailOrPhone.trim() && (
                  formData.emailOrPhone.includes('@') ? (
                    <OtpVerificationPanel
                      key={`login-email-${formData.emailOrPhone.trim()}`}
                      channel="email"
                      recipient={formData.emailOrPhone.trim()}
                      onSend={() => requestLoginOtp('email')}
                      onVerify={verifyLoginOtp}
                    />
                  ) : (
                    <WhatsAppOtpPanel
                      key={`login-whatsapp-${formData.emailOrPhone.trim()}`}
                      recipient={formData.emailOrPhone.trim()}
                      disabled={isSubmitting}
                      onSend={() => requestLoginOtp('whatsapp')}
                      onVerify={verifyLoginOtp}
                    />
                  )
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-[11px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter your password"
                    className={cx(
                      'w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500',
                      errors.password
                        ? 'border-2 border-rose-500 bg-rose-50/30'
                        : 'border border-slate-300 bg-slate-50/50 focus:bg-white'
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] font-semibold text-rose-500 mt-1">{errors.password}</p>
                )}
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Remember me</span>
                </label>
                <a href="#forgot" className="font-semibold text-indigo-600 hover:underline">
                  Forgot Password?
                </a>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={cx(
                  'w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold text-white flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 shadow-md',
                  highGraphics
                    ? 'bg-linear-to-r from-indigo-600 to-violet-600 shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-101'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                )}
              >
                {isSubmitting ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Log In</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </>
                )}
              </button>
            </form>

            {authError && <p role="alert" className="mt-3 text-xs font-semibold text-rose-600">{authError}</p>}
            <FirebaseAuthOptions mode="login" onAuthenticate={handleFirebaseAuth} />

            <div className="mt-5 text-center text-xs text-slate-500">
              Don't have an IntellEdu account?{' '}
              <Link to="/signup" className="font-bold text-indigo-600 hover:underline">
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Login;
