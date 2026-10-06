import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Brain, Eye, EyeOff, Lock, Mail, User, Phone, GraduationCap, ArrowRight, Check } from 'lucide-react';
import { usePerformanceMode } from '../context/PerformanceModeContext';
import { useAuth } from '../context/AuthContext';
import { SignupFormData } from '../types';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { cx } from '../utils/cx';

type SignupErrors = Partial<Record<keyof SignupFormData, string>>;

export const Signup: React.FC = () => {
  const { highGraphics } = usePerformanceMode();
  const { signup } = useAuth();
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

  const validate = (): boolean => {
    const newErrors: SignupErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required.';
    if (!formData.email.trim() || !formData.email.includes('@')) newErrors.email = 'Valid email is required.';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required.';
    if (!formData.password) newErrors.password = 'Password is required.';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters.';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
    if (!formData.acceptedTerms) newErrors.acceptedTerms = 'You must accept the terms.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await signup(formData);
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup error:', err);
    } finally {
      setIsSubmitting(false);
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
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300">
                  <Brain className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-xl sm:text-2xl tracking-tight leading-none">IntellEdu</span>
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

            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-3.5">
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
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 shrink-0" />
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 9876543210"
                      className={cx(
                        'w-full pl-9 pr-3 py-2 rounded-xl text-xs sm:text-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500',
                        errors.phone ? 'border-2 border-rose-500 bg-rose-50/30' : 'border border-slate-300 bg-slate-50/50'
                      )}
                    />
                  </div>
                  {errors.phone && <p className="text-[10px] text-rose-500 mt-0.5">{errors.phone}</p>}
                </div>
              </div>

              {/* Email & Grade Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Email Address
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

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={cx(
                  'w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold text-white flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98 shadow-md mt-2',
                  highGraphics
                    ? 'bg-linear-to-r from-indigo-600 to-violet-600 shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-101'
                    : 'bg-indigo-600 hover:bg-indigo-700'
                )}
              >
                {isSubmitting ? (
                  <span>Creating Account...</span>
                ) : (
                  <>
                    <span>Create Free Account</span>
                    <ArrowRight className="w-4 h-4 shrink-0" />
                  </>
                )}
              </button>
            </form>

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
