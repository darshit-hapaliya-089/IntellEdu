import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, GraduationCap, Check } from 'lucide-react';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { usePerformanceMode } from '../context/PerformanceModeContext';
import { useAuth } from '../context/useAuth';
import { SignupFormData } from '../types';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { cx } from '../utils/cx';
import FirebaseAuthOptions from '../components/auth/FirebaseAuthOptions';
import OtpVerificationPanel from '../components/auth/OtpVerificationPanel';
import WhatsAppOtpPanel from '../components/auth/WhatsAppOtpPanel';
import PhoneNumberField from '../components/auth/PhoneNumberField';
import { authApi } from '../services/api';

type SignupErrors = Partial<Record<keyof SignupFormData, string>>;

export const Signup: React.FC = () => {
  const { highGraphics } = usePerformanceMode();
  const { sendOtp, verifyOtp, authenticateFirebase } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState<SignupFormData>({
    fullName: '',
    email: '',
    phone: '',
    grade: 'Class 10 Science',
    password: '',
    confirmPassword: '',
    acceptedTerms: false
  });

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [preferredOtpChannel, setPreferredOtpChannel] = useState<'email' | 'whatsapp' | null>(null);

  useEffect(() => {
    void authApi.health();
  }, []);

  const selectedChannel: 'whatsapp' | 'email' = preferredOtpChannel && (
    preferredOtpChannel === 'whatsapp' ? formData.phone.trim() : formData.email.trim()
  )
    ? preferredOtpChannel
    : formData.phone.trim() ? 'whatsapp' : 'email';

  const validate = (): boolean => {
    const newErrors: SignupErrors = {};
    if (formData.fullName.trim().length < 2) newErrors.fullName = 'Enter your full name.';
    if (formData.phone.trim() && !isValidPhoneNumber(formData.phone.trim())) {
      newErrors.phone = 'Enter a valid local phone number for the selected country.';
    } else if (selectedChannel === 'whatsapp' && !formData.phone.trim()) {
      newErrors.phone = 'Enter a phone number to receive the WhatsApp OTP.';
    }
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Enter a valid email address.';
    } else if (selectedChannel === 'email' && !formData.email.trim()) {
      newErrors.email = 'Enter a valid email address.';
    }
    if (!formData.password) newErrors.password = 'Password is required.';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
    if (!formData.acceptedTerms) newErrors.acceptedTerms = 'You must accept the terms.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const requestSignupOtp = async (channelOverride?: 'whatsapp' | 'email') => {
    if (!validate()) throw new Error('Please fix the highlighted signup details first.');
    const channel = channelOverride || selectedChannel;
    const recipient = channel === 'whatsapp' ? formData.phone.trim() : formData.email.trim().toLowerCase();
    return sendOtp({
      channel,
      flow: 'signup',
      recipient,
      fullName: formData.fullName.trim(),
      email: formData.email.trim() ? formData.email.trim().toLowerCase() : undefined,
      phone: formData.phone.trim() || undefined,
      grade: formData.grade,
    });
  };

  const verifySignupOtp = async (challengeId: string, code: string) => {
    setIsSubmitting(true);
    try {
      await verifyOtp({ challengeId, code, password: formData.password });
      navigate('/dashboard');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFirebaseAuth = async (idToken: string) => {
    setAuthError(null);
    const googleSignupErrors: SignupErrors = {};
    if (formData.fullName.trim().length < 2) googleSignupErrors.fullName = 'Enter your full name.';
    if (!formData.acceptedTerms) googleSignupErrors.acceptedTerms = 'You must accept the terms.';
    if (Object.keys(googleSignupErrors).length) {
      setErrors((current) => ({ ...current, ...googleSignupErrors }));
      const message = 'Enter your name and accept the terms before continuing with Google.';
      setAuthError(message);
      throw new Error(message);
    }

    try {
      await authenticateFirebase(idToken, 'signup', {
        fullName: formData.fullName.trim(),
        grade: formData.grade,
      });
      navigate('/dashboard');
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Verified signup failed.');
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
              <div className="absolute -top-12 -left-12 w-64 h-64 bg-pink-400/20 rounded-full blur-2xl animate-pulse-glow"></div>
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
                <h2 className="text-xl sm:text-2xl font-black leading-tight">Start Your AI Learning Journey Today!</h2>
                <p className="text-xs sm:text-sm text-indigo-100/90 mt-2 leading-relaxed">
                  Join 50,000+ students leveraging AI adaptive tutoring, gamified quizzes, and instant doubt resolution.
                </p>
              </div>
            </div>

            <div className="space-y-2.5 sm:space-y-3 pt-6 lg:pt-8 relative z-10">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-100">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Free 100 XP Welcome Bonus</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-100">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Custom Grade 1–10 Curriculum</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-100">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>No Payment Required</span>
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
            <div className="mb-5 sm:mb-6">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Create Free Student Account</h3>
              <p className="text-xs text-slate-500 mt-1">Fill in your details to set up your IntellEdu profile.</p>
            </div>

            <form onSubmit={(event) => event.preventDefault()} className="space-y-3 sm:space-y-3.5">
              {/* Full Name & Phone Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 shrink-0" />
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      placeholder="e.g. Alex Johnson"
                      className={cx(
                        'w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500',
                        errors.fullName ? 'border-2 border-rose-500 bg-rose-50/30' : 'border border-slate-300 bg-slate-50/50'
                      )}
                    />
                  </div>
                  {errors.fullName && <p className="text-[10px] text-rose-500 mt-0.5">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Phone Number
                  </label>
                  <PhoneNumberField
                    value={formData.phone}
                    onChange={(phone) => setFormData((current) => ({ ...current, phone }))}
                    invalid={Boolean(errors.phone)}
                  />
                  {!!formData.phone.trim() && selectedChannel === 'whatsapp' && (
                    <WhatsAppOtpPanel
                      key={`signup-whatsapp-${formData.phone.trim()}`}
                      recipient={formData.phone.trim()}
                      disabled={isSubmitting || !formData.acceptedTerms}
                      onSend={() => requestSignupOtp('whatsapp')}
                      onVerify={verifySignupOtp}
                    />
                  )}
                  {errors.phone && <p className="text-[10px] text-rose-500 mt-0.5">{errors.phone}</p>}
                </div>
              </div>

              {/* Email & Grade Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address{formData.phone.trim() ? ' (optional)' : ''}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 shrink-0" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="e.g. student@intelledu.org"
                      className={cx(
                        'w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500',
                        errors.email ? 'border-2 border-rose-500 bg-rose-50/30' : 'border border-slate-300 bg-slate-50/50'
                      )}
                    />
                  </div>
                  {!!formData.email.trim() && selectedChannel === 'email' && (
                    <OtpVerificationPanel
                      key={`signup-email-${formData.email.trim()}`}
                      channel="email"
                      recipient={formData.email.trim()}
                      disabled={isSubmitting || !formData.acceptedTerms}
                      onSend={requestSignupOtp}
                      onVerify={verifySignupOtp}
                    />
                  )}
                  {errors.email && <p className="text-[10px] text-rose-500 mt-0.5">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Grade / Goal Path
                  </label>
                  <div className="relative">
                    <GraduationCap className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 shrink-0" />
                    <select
                      value={formData.grade}
                      onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm border border-slate-300 bg-slate-50/50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Class 8 Science">Class 8 Science</option>
                      <option value="Class 9 Science">Class 9 Science</option>
                      <option value="Class 10 Science">Class 10 Science</option>
                      <option value="Class 11 Science">Class 11 Science</option>
                      <option value="Class 12 Science">Class 12 Science</option>
                      <option value="AI & Coding Essentials">AI & Coding Essentials</option>
                    </select>
                  </div>
                </div>
              </div>

              {formData.phone.trim() && formData.email.trim() && (
                <fieldset className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <legend className="px-1 text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    Choose where to receive your OTP
                  </legend>
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-700">
                    <label className="inline-flex cursor-pointer items-center gap-2 font-semibold text-emerald-700">
                      <input
                        type="radio"
                        name="signup-otp-channel"
                        value="whatsapp"
                        checked={selectedChannel === 'whatsapp'}
                        onChange={() => setPreferredOtpChannel('whatsapp')}
                        className="accent-emerald-600"
                      />
                      WhatsApp OTP (Free)
                    </label>
                    <label className="inline-flex cursor-pointer items-center gap-2">
                      <input
                        type="radio"
                        name="signup-otp-channel"
                        value="email"
                        checked={selectedChannel === 'email'}
                        onChange={() => setPreferredOtpChannel('email')}
                        className="accent-indigo-600"
                      />
                      Email address
                    </label>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-500">
                    Only the contact you verify will be marked as verified.
                  </p>
                </fieldset>
              )}

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 shrink-0" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Create password (min 6 chars)"
                      className={cx(
                        'w-full pl-9 pr-8 py-2 rounded-xl text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500',
                        errors.password ? 'border-2 border-rose-500 bg-rose-50/30' : 'border border-slate-300 bg-slate-50/50'
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-[10px] text-rose-500 mt-0.5">{errors.password}</p>}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 shrink-0" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      placeholder="Confirm your password"
                      className={cx(
                        'w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500',
                        errors.confirmPassword ? 'border-2 border-rose-500 bg-rose-50/30' : 'border border-slate-300 bg-slate-50/50'
                      )}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-[10px] text-rose-500 mt-0.5">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700 select-none">
                  <input
                    type="checkbox"
                    checked={formData.acceptedTerms}
                    onChange={(e) => setFormData({ ...formData, acceptedTerms: e.target.checked })}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>I agree to the IntellEdu Terms & Privacy Policy</span>
                </label>
                {errors.acceptedTerms && <p className="text-[10px] text-rose-500 mt-0.5">{errors.acceptedTerms}</p>}
              </div>

              <p className="text-center text-[11px] text-slate-500">
                {selectedChannel === 'whatsapp'
                  ? 'WhatsApp is selected for verification. Any email entered is saved.'
                  : 'The email address is selected for verification. Any phone number entered is saved.'}
                {' '}The 6-digit OTP expires in 60 seconds.
              </p>
            </form>

            {authError && <p role="alert" className="mt-3 text-xs font-semibold text-rose-600">{authError}</p>}
            <FirebaseAuthOptions mode="signup" canAuthenticate={formData.fullName.trim().length >= 2 && formData.acceptedTerms} onAuthenticate={handleFirebaseAuth} />

            <div className="mt-4 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-indigo-600 hover:underline">
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Signup;
