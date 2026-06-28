import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, LogIn } from 'lucide-react';
import { API_BASE_URL } from '../config';

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
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      // Save token to localStorage
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.admin));

      // Call success callback
      onLoginSuccess(data.token, data.admin);
    } catch (err) {
      setError('Connection error. Please try again.');
      console.error('Login error:', err);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-slate-400">Sign in to manage your restaurant</p>
        </div>

        {/* Login Card */}
        <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700 p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400">
                <AlertCircle size={18} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              <LogIn size={18} />
              {loading ? 'Logging in...' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Default credentials for testing: admin / admin
          </p>
        </div>
      </div>
    </div>
  );
}
