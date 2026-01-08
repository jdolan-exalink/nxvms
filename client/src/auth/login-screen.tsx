// ============================================================================
// LOGIN SCREEN
// ============================================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, Server, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../core/store';
import { useErrorStore, useLoadingStore } from '../core/store';
import { getApiClient } from '../shared/api-client';
import { getDefaultServerUrl } from '../shared/server-config';
import { useNotificationsStore } from '../core/store';
import { VersionBadge } from '../shared/version-badge';

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const setError = useErrorStore((state) => state.setError);
  const clearError = useErrorStore((state) => state.clearError);
  const error = useErrorStore((state) => state.error);
  const startLoading = useLoadingStore((state) => state.startLoading);
  const stopLoading = useLoadingStore((state) => state.stopLoading);
  const isLoading = useLoadingStore((state) => state.isLoading);
  const addNotification = useNotificationsStore((state) => state.addNotification);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [serverUrl, setServerUrl] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Initialize serverUrl with auto-detected value on component mount
  useEffect(() => {
    const detectedUrl = getDefaultServerUrl();
    setServerUrl(detectedUrl);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!username || !password || !serverUrl) {
      setError('Please fill in all fields');
      return;
    }

    startLoading('Logging in...');

    try {
      console.log('[LoginScreen] Attempting login to:', serverUrl);
      console.log('[LoginScreen] Credentials:', { username, password: '***' });
      
      const apiClient = getApiClient(serverUrl);
      // Only send username and password - don't send serverUrl to server
      const response = await apiClient.login({
        username,
        password,
      });
      });

      console.log('[LoginScreen] Login successful:', response);

      login(
        response.user,
        response.server,
        response.accessToken,
        response.refreshToken
      );

      addNotification({
        title: 'Welcome',
        message: `Logged in as ${response.user.displayName}`,
        type: 'success',
        priority: 'normal',
      });

      navigate('/');
    } catch (err: any) {
      console.error('[LoginScreen] Login error:', err);
      console.error('[LoginScreen] Error response:', err.response?.data);
      console.error('[LoginScreen] Error status:', err.response?.status);
      
      const errorMessage = err.response?.data?.error?.message 
        || err.response?.data?.message 
        || err.message 
        || `Login failed (Status: ${err.response?.status || 'unknown'})`;
      
      setError(errorMessage);
      addNotification({
        title: 'Login Failed',
        message: errorMessage,
        type: 'error',
        priority: 'high',
      });
    } finally {
      stopLoading();
    }
  };

  const handleServerSelect = () => {
    navigate('/servers');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-4">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">NXvms</h1>
          <p className="text-dark-400 mb-3">Video Management System</p>
          <VersionBadge />
        </div>

        {/* Login Form */}
        <div className="bg-dark-800 rounded-2xl shadow-2xl p-8 border border-dark-700">
          <h2 className="text-xl font-semibold text-white mb-6">Sign In</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Server URL */}
            <div>
              <label htmlFor="server" className="block text-sm font-medium text-dark-300 mb-2">
                Server URL
              </label>
              <div className="relative">
                <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  id="server"
                  type="url"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                  placeholder="e.g., http://10.1.1.174:3000/api/v1"
                  className="w-full pl-10 pr-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-dark-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full pl-10 pr-4 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-dark-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-500" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-3 bg-dark-900 border border-dark-700 rounded-lg text-white placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-500 hover:text-dark-300 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-dark-700 bg-dark-900 text-primary-600 focus:ring-primary-500 focus:ring-offset-dark-800"
                disabled={isLoading}
              />
              <label htmlFor="remember" className="ml-2 text-sm text-dark-300">
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 focus:ring-offset-dark-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Server Selection */}
          <div className="mt-6 pt-6 border-t border-dark-700">
            <button
              onClick={handleServerSelect}
              className="w-full py-2 px-4 text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center justify-center gap-2"
            >
              <Server className="w-4 h-4" />
              Browse Servers
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-dark-500">
          NXvms Client v0.1.0 •{' '}
          <a href="#" className="text-primary-400 hover:text-primary-300 transition-colors">
            Help
          </a>
        </p>
      </div>
    </div>
  );
};
