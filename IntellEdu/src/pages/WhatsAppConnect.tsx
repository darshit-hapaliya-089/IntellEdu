import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, LoaderCircle, MessageSquare, QrCode, RefreshCw, ArrowLeft, ShieldCheck } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface WhatsAppStatus {
  isConnected: boolean;
  hasQr: boolean;
  qrDataUrl: string | null;
}

export const WhatsAppConnect: React.FC = () => {
  const [status, setStatus] = useState<WhatsAppStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch('http://localhost:3333/api/v1/auth/whatsapp/status');
      if (!res.ok) throw new Error('Could not reach backend');
      const data: WhatsAppStatus = await res.json();
      setStatus(data);
      setError(null);
    } catch {
      setError('Could not connect to the backend server. Make sure it is running on port 3333.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = window.setInterval(fetchStatus, 2500);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="grow flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900">IntellEdu WhatsApp Bot</h1>
                <p className="text-xs text-slate-500">100% Free Direct OTP Delivery</p>
              </div>
            </div>
            <Link
              to="/signup"
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Link>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500">
              <LoaderCircle className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-xs font-semibold">Checking WhatsApp Bot connection...</p>
            </div>
          ) : error ? (
            <div className="py-8 text-center space-y-3">
              <p className="text-xs font-bold text-rose-600">{error}</p>
              <button
                type="button"
                onClick={fetchStatus}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </button>
            </div>
          ) : status?.isConnected ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-lg font-black text-emerald-800">WhatsApp Bot is Connected!</h2>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                  Direct WhatsApp OTPs are fully active. Whenever a student signs up or logs in, OTPs are sent directly to their WhatsApp inbox!
                </p>
              </div>

              <div className="pt-4 flex justify-center gap-3">
                <Link
                  to="/signup"
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-extrabold text-xs shadow-md hover:bg-emerald-700 cursor-pointer"
                >
                  Test on Signup Page
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 cursor-pointer"
                >
                  Test on Login Page
                </Link>
              </div>
            </div>
          ) : status?.qrDataUrl ? (
            <div className="space-y-5">
              <div className="text-center">
                <p className="text-xs text-slate-600">
                  Scan this QR code with WhatsApp to link your IntellEdu bot number.
                </p>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <img
                  src={status.qrDataUrl}
                  alt="WhatsApp QR Code"
                  className="w-56 h-56 rounded-xl shadow-xs border border-white"
                />
                <span className="text-[10px] text-slate-500 mt-2 flex items-center gap-1">
                  <RefreshCw className="w-3 h-3 animate-spin text-emerald-600" />
                  Auto-refreshes every few seconds
                </span>
              </div>

              {/* Steps */}
              <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 space-y-2">
                <p className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-emerald-600" /> How to scan:
                </p>
                <ol className="text-xs text-emerald-800 space-y-1 list-decimal list-inside font-medium">
                  <li>Open <strong>WhatsApp</strong> on your phone.</li>
                  <li>Tap <strong>Settings</strong> (or 3 dots on top right) ➜ <strong>Linked devices</strong>.</li>
                  <li>Tap <strong>Link a device</strong> and point your camera at this QR code.</li>
                </ol>
              </div>
            </div>
          ) : (
            <div className="py-10 text-center space-y-3">
              <LoaderCircle className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
              <p className="text-xs font-bold text-slate-700">Generating WhatsApp QR Code...</p>
              <p className="text-[11px] text-slate-500">Wait a few seconds while Baileys initializes.</p>
            </div>
          )}

          {/* Footer badge */}
          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> End-to-end Encrypted
            </span>
            <span>IntellEdu Auth v1.0</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default WhatsAppConnect;

