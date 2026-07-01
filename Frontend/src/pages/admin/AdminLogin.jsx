import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, LogIn } from 'lucide-react';
import { API_BASE_URL } from '../../config';

export default function AdminLogin({ onLoginSuccess }) {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('login_failed'));
        setLoading(false);
        return;
      }

      // Save token to localStorage
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.admin));

      // Call success callback
      onLoginSuccess(data.token, data.admin);
    } catch (err) {
      setError(t('connection_error'));
      console.error('Login error:', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1c] relative overflow-hidden px-4">
      {/* Background Effects */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-teal-500/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4 shadow-[0_0_30px_rgba(245,158,11,0.15)]">
            <LogIn className="w-8 h-8 text-amber-400" />
          </div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2">
            {t('admin_portal')}
          </h1>
          <p className="text-slate-500 font-medium tracking-wide text-sm">{t('secure_access')}</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-800/60 shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username */}
            <div className="space-y-2">
              <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                {t('username')}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t('enter_username')}
                className="w-full px-4 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                {t('password')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('enter_password')}
                className="w-full px-4 py-3.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 focus:outline-none focus:border-amber-500/50 focus:ring-4 focus:ring-amber-500/10 transition-all font-medium"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3.5 bg-rose-950/40 border border-rose-500/30 rounded-xl text-rose-400 animate-shake">
                <AlertCircle size={18} />
                <span className="text-sm font-semibold">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 disabled:bg-slate-700 disabled:text-slate-500 disabled:border-slate-700 disabled:shadow-none text-slate-950 font-black py-3.5 px-4 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={18} />
                  <span>{t('sign_in')}</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/60 text-center">
            <p className="text-xs text-slate-500 font-medium">
              {t('testing_credentials')} <span className="text-slate-300 font-bold bg-slate-700 px-2 py-0.5 rounded">admin</span> / <span className="text-slate-300 font-bold bg-slate-700 px-2 py-0.5 rounded">admin</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
