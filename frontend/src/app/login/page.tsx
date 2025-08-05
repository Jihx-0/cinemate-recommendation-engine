'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, Key } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordData, setForgotPasswordData] = useState({
    username: '',
    email: '',
  });
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');
  const [isForgotPasswordLoading, setIsForgotPasswordLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  
  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!formData.username.trim()) {
      setError('Please enter your username');
      setIsLoading(false);
      return;
    }

    if (!formData.password.trim()) {
      setError('Please enter your password');
      setIsLoading(false);
      return;
    }

    try {
      await login(formData.username, formData.password);
      router.push('/recommendations');
    } catch (error: any) {
      // Handle different types of errors
      if (error.response?.status === 401) {
        setError('Invalid username or password. Please check your credentials and try again.');
      } else if (error.response?.status === 404) {
        setError('User not found. Please check your username or create a new account.');
      } else if (error.response?.status >= 500) {
        setError('Server error. Please try again later.');
      } else if (error.message?.includes('Network')) {
        setError('Connection error. Please check your internet connection and try again.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsForgotPasswordLoading(true);
    setForgotPasswordError('');
    setForgotPasswordSuccess('');
    setResetToken('');

    try {
      const response = await fetch('/api/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(forgotPasswordData),
      });

      const data = await response.json();

      if (response.ok) {
        setForgotPasswordSuccess(data.message || 'Password reset instructions sent!');
        setResetToken(data.token || '');
        setForgotPasswordData({ username: '', email: '' });
      } else {
        setForgotPasswordError(data.error || 'Failed to send reset instructions');
      }
    } catch (error) {
      setForgotPasswordError('Network error. Please try again.');
    } finally {
      setIsForgotPasswordLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Navigation />
      
      <div className="flex items-center justify-center min-h-screen px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
              <CardDescription>
                Sign in to your Cinemate account to get personalized movie recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!showForgotPassword ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                      {error}
                    </div>
                  )}
                  
                  <div>
                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        id="username"
                        type="text"
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter your username"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-primary hover:text-primary/90 underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                  
                  <div className="text-center">
                    <p className="text-sm text-gray-600">
                      Don't have an account?{' '}
                      <Link href="/register" className="text-primary hover:text-primary/90 underline">
                        Sign up
                      </Link>
                    </p>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  {forgotPasswordError && (
                    <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                      {forgotPasswordError}
                    </div>
                  )}
                  {forgotPasswordSuccess && (
                    <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                      {forgotPasswordSuccess}
                    </div>
                  )}
                  
                  {resetToken && (
                    <div className="p-3 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="font-medium mb-2">Your reset token:</p>
                      <p className="font-mono text-xs break-all bg-white p-2 rounded border">
                        {resetToken}
                      </p>
                      <p className="mt-2 text-xs">
                        Copy this token and use it on the reset password page.
                      </p>
                      <Link 
                        href={`/reset-password?token=${resetToken}`}
                        className="inline-block mt-2 text-xs text-blue-700 hover:text-blue-900 underline"
                      >
                        Go to Reset Password Page →
                      </Link>
                    </div>
                  )}
                  
                  <div className="text-center mb-4">
                    <Key className="h-8 w-8 text-primary mx-auto mb-2" />
                    <h3 className="text-lg font-semibold">Reset Your Password</h3>
                    <p className="text-sm text-gray-600">
                      Enter your username and email to receive password reset instructions.
                    </p>
                  </div>
                  
                  <div>
                    <label htmlFor="reset-username" className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        id="reset-username"
                        type="text"
                        value={forgotPasswordData.username}
                        onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, username: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter your username"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        id="reset-email"
                        type="email"
                        value={forgotPasswordData.email}
                        onChange={(e) => setForgotPasswordData({ ...forgotPasswordData, email: e.target.value })}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={isForgotPasswordLoading}
                      className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {isForgotPasswordLoading ? 'Sending...' : 'Send Reset Instructions'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForgotPassword(false)}
                      className="flex-1"
                    >
                      Back to Login
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
} 