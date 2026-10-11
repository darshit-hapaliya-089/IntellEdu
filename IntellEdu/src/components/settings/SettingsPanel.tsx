import React, { useEffect, useState } from 'react';
import {
  Bell,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Flame,
  KeyRound,
  Lock,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  Sparkles,
  User,
  Volume2,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { authApi } from '../../services/api';
import { usePerformanceMode } from '../../context/PerformanceModeContext';
import { cx } from '../../utils/cx';
import PerformanceToggle from '../PerformanceToggle';
import LanguageSelector from '../LanguageSelector';
import { getStoredValue, setStoredValue } from '../../utils/storage';

const AVATAR_OPTIONS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=250&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=250&q=80',
];

const GRADE_OPTIONS = [
  'Class 9',
  'Class 10 Science',
  'Class 10 Commerce',
  'Class 10 Arts',
  'Class 11 Science (PCM)',
  'Class 11 Science (PCB)',
  'Class 11 Commerce',
  'Class 12 Science (PCM)',
  'Class 12 Science (PCB)',
  'Class 12 Commerce',
];

export const SettingsPanel: React.FC = () => {
  const { highGraphics } = usePerformanceMode();
  const { user, updateUser } = useAuth();

  // Form states
  const [fullName, setFullName] = useState<string>(user?.name || 'Alex Johnson');
  const email = user?.email || '';
  const [grade, setGrade] = useState<string>(user?.grade || 'Class 10 Science');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(
    user?.avatar || AVATAR_OPTIONS[0]
  );

  // Password fields
  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Preferences
  const preferenceKey = 'intellEdu_preferences';
  const [studyReminders, setStudyReminders] = useState<boolean>(() =>
    getStoredValue(preferenceKey, { studyReminders: true, soundEffects: true }).studyReminders
  );
  const [soundEffects, setSoundEffects] = useState<boolean>(() =>
    getStoredValue(preferenceKey, { studyReminders: true, soundEffects: true }).soundEffects
  );

  // Status feedback
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setStoredValue(preferenceKey, { studyReminders, soundEffects });
  }, [preferenceKey, studyReminders, soundEffects]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!fullName.trim()) {
      setErrorMessage('Full Name cannot be empty.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }

    // Password validation (only if newPassword is entered)
    if (newPassword.trim()) {
      if (!currentPassword) {
        setErrorMessage('Enter your current password to change it.');
        return;
      }
      if (newPassword.length < 6) {
        setErrorMessage('New password must be at least 6 characters long.');
        return;
      }
      if (newPassword !== confirmPassword) {
        setErrorMessage('New passwords do not match. Please re-enter.');
        return;
      }
    }

    try {
      if (newPassword.trim()) {
        await authApi.updatePassword({ currentPassword, newPassword });
      }
      const result = await authApi.updateProfile({
        fullName: fullName.trim(),
        grade,
        avatarUrl: selectedAvatar,
      });

      updateUser({
        name: result.user.fullName,
        grade: result.user.grade,
        avatar: result.user.avatarUrl || selectedAvatar,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setSuccessMessage('✅ Profile saved to your account.');
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (reason) {
      setErrorMessage(reason instanceof Error ? reason.message : 'Could not save your profile.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 sm:space-y-6 w-full">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900">Account & Profile Settings</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Manage your personal details, select your avatar, change password, and customize learning preferences.
        </p>
      </div>

      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-3 animate-fade-in shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-bold flex items-center gap-3 animate-fade-in shadow-xs">
          <ShieldCheck className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-5 sm:space-y-6">
        {/* Profile Header Preview Card */}
        <div
          className={cx(
            'p-5 sm:p-6 rounded-2xl sm:rounded-3xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4',
            highGraphics
              ? 'bg-linear-to-r from-indigo-50 via-sky-50 to-violet-50 border-indigo-100 shadow-sm'
              : 'bg-white border-slate-200'
          )}
        >
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={selectedAvatar}
                alt={fullName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-3 border-white shadow-md"
              />
              <span className="absolute bottom-0 right-0 p-1 rounded-full bg-emerald-500 border-2 border-white" />
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">{fullName}</h3>
              <p className="text-xs font-semibold text-slate-500">{email}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-lg bg-indigo-100 text-indigo-700 text-[10px] font-black">
                  {grade}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600">
                  <Flame className="w-3.5 h-3.5 fill-amber-400" />
                  {user?.streak || 14} Day Streak
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  {user?.points || 2850} XP
                </span>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className={cx(
              'inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer active:scale-95 shadow-md self-start sm:self-auto shrink-0',
              highGraphics
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            )}
          >
            <Save className="w-4 h-4" />
            <span>Save All Changes</span>
          </button>
        </div>

        {/* SECTION 1: Personal Information */}
        <div
          className={cx(
            'p-5 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-4',
            highGraphics ? 'bg-white/90 border-slate-200/80 shadow-xs' : 'bg-white border-slate-200'
          )}
        >
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <User className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm sm:text-base font-black text-slate-900">Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your Full Name"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-100 font-medium text-slate-500"
                />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={user?.phone || 'Not provided'}
                  readOnly
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-100 font-medium text-slate-500"
                />
              </div>
            </div>

            {/* Grade / Class */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Class / Grade</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium cursor-pointer"
              >
                {GRADE_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: Avatar Selection Gallery */}
        <div
          className={cx(
            'p-5 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-4',
            highGraphics ? 'bg-white/90 border-slate-200/80 shadow-xs' : 'bg-white border-slate-200'
          )}
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm sm:text-base font-black text-slate-900">Choose Profile Avatar</h3>
            </div>
            <span className="text-[11px] text-slate-400 font-bold">Select one</span>
          </div>

          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3 sm:gap-4">
            {AVATAR_OPTIONS.map((avatarUrl, idx) => {
              const isSelected = selectedAvatar === avatarUrl;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedAvatar(avatarUrl)}
                  className={cx(
                    'relative rounded-full aspect-square overflow-hidden border-2 transition-all cursor-pointer p-0.5',
                    isSelected
                      ? 'border-indigo-600 ring-3 ring-indigo-200 scale-105 shadow-md'
                      : 'border-slate-200 hover:border-indigo-300 hover:scale-102'
                  )}
                >
                  <img src={avatarUrl} alt={`Avatar ${idx + 1}`} className="w-full h-full rounded-full object-cover" />
                  {isSelected && (
                    <span className="absolute inset-0 bg-indigo-600/30 flex items-center justify-center rounded-full text-white">
                      <Check className="w-4 h-4 stroke-3" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: Change Password */}
        <div
          className={cx(
            'p-5 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-4',
            highGraphics ? 'bg-white/90 border-slate-200/80 shadow-xs' : 'bg-white border-slate-200'
          )}
        >
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Lock className="w-4 h-4 text-violet-600" />
            <h3 className="text-sm sm:text-base font-black text-slate-900">Password & Security</h3>
          </div>

          <p className="text-xs text-slate-500">
            Leave blank if you do not want to change your password.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Current Password</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Confirm New Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Preferences & Experience */}
        <div
          className={cx(
            'p-5 sm:p-6 rounded-2xl sm:rounded-3xl border space-y-4',
            highGraphics ? 'bg-white/90 border-slate-200/80 shadow-xs' : 'bg-white border-slate-200'
          )}
        >
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm sm:text-base font-black text-slate-900">App Preferences</h3>
          </div>
          <p className="text-xs text-slate-500">These preferences are saved in this browser; account-wide preference sync is not available yet.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Graphics Mode */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Graphics Performance Mode</h4>
                <p className="text-[11px] text-slate-500">Toggle ambient gradients and glassmorphism.</p>
              </div>
              <PerformanceToggle />
            </div>

            {/* Language Selector */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Platform Language</h4>
                <p className="text-[11px] text-slate-500">English, ગુજરાતી, हिन्दी</p>
              </div>
              <LanguageSelector />
            </div>

            {/* Study Reminders */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-indigo-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Daily Study Reminders</h4>
                  <p className="text-[11px] text-slate-500">Get notified to maintain your streak.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={studyReminders}
                onChange={(e) => setStudyReminders(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </div>

            {/* Sound Effects */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-indigo-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Quiz Sound Effects</h4>
                  <p className="text-[11px] text-slate-500">Audio chime on correct quiz answers.</p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={soundEffects}
                onChange={(e) => setSoundEffects(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className={cx(
              'px-6 py-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer active:scale-95 shadow-lg flex items-center gap-2',
              highGraphics
                ? 'bg-linear-to-r from-indigo-600 to-violet-600 text-white hover:shadow-indigo-500/25'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            )}
          >
            <Save className="w-4 h-4" />
            <span>Save All Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPanel;
