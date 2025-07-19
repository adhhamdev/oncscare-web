'use client';

import type React from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const router = useRouter();
  const { login, resetPassword, user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      router.push('/');
    } catch (error: any) {
      console.error('Login error:', error);

      // Handle specific Firebase Auth errors
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password. Please try again.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        case 'auth/user-disabled':
          setError('This account has been disabled. Please contact support.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later.');
          break;
        case 'auth/network-request-failed':
          setError('Network error. Please check your connection.');
          break;
        default:
          setError(
            'Login failed. Please check your credentials and try again.'
          );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetMessage('');

    if (!resetEmail) {
      setError('Please enter your email address.');
      return;
    }

    try {
      await resetPassword(resetEmail);
      setResetMessage('Password reset email sent! Check your inbox.');
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error: any) {
      console.error('Reset password error:', error);

      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email address.');
          break;
        case 'auth/invalid-email':
          setError('Please enter a valid email address.');
          break;
        default:
          setError('Failed to send reset email. Please try again.');
      }
    }
  };

  if (user) {
    return (
      <div className='min-h-screen flex items-center justify-center bg-gray-50'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto'></div>
          <p className='mt-4 text-gray-600'>Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen flex align-center justify-evenly'>
      {/* Left Side - Login Form */}
      <div className='flex items-center justify-center p-8 md:w-1/3'>
        <div className='w-full max-w-md space-y-8'>
          {/* Logo and Header */}
          <div className='text-center space-y-4 flex flex-col items-center'>
            <div className='text-center flex flex-col items-center'>
              <div>
                <Image
                  src='/logo.png'
                  alt='OncsCare Logo'
                  width={100}
                  height={100}
                />
              </div>
              <h1 className='text-3xl bg-clip-text text-transparent bg-gradient-to-r from-accent to-primary'>
                OncsCare
              </h1>
            </div>
            <p className='text-gray-400 text-lg'>
              {showForgotPassword
                ? 'Enter your email to reset your password'
                : "Let's get started by filling out the form below."}
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Success Message */}
          {resetMessage && (
            <Alert className='border-green-200 bg-green-50 text-green-800'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{resetMessage}</AlertDescription>
            </Alert>
          )}

          {/* Login Form */}
          {!showForgotPassword ? (
            <form onSubmit={handleSubmit} className='space-y-6'>
              <div className='space-y-4'>
                {/* Email Field */}
                <div className='space-y-2'>
                  <Label htmlFor='email' className='sr-only'>
                    Email
                  </Label>
                  <div className='relative'>
                    <Mail className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                    <Input
                      id='email'
                      type='email'
                      placeholder='Email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className='pl-12 h-14 bg-transparent border-2 rounded-full placeholder-gray-400'
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className='space-y-2'>
                  <Label htmlFor='password' className='sr-only'>
                    Password
                  </Label>
                  <div className='relative'>
                    <Lock className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                    <Input
                      id='password'
                      type={showPassword ? 'text' : 'password'}
                      placeholder='Password'
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className='pl-12 pr-12 h-14 border-2 bg-transparent rounded-full placeholder-gray-400'
                      required
                      disabled={isLoading}
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300'
                      disabled={isLoading}>
                      {showPassword ? (
                        <EyeOff className='w-5 h-5' />
                      ) : (
                        <Eye className='w-5 h-5' />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Sign In Button */}
              <Button
                type='submit'
                disabled={isLoading}
                className='w-full h-14 bg-primary hover:bg-primary/80 text-primary-foreground font-semibold rounded-full text-lg transition-colors disabled:opacity-50'>
                {isLoading ? 'Signing In...' : 'Sign In'}
              </Button>

              {/* Forgot Password Link */}
              <div className='text-center'>
                <button
                  type='button'
                  onClick={() => setShowForgotPassword(true)}
                  className='text-gray-400 hover:text-gray-300 transition-colors'
                  disabled={isLoading}>
                  Forgot Password?
                </button>
              </div>
            </form>
          ) : (
            /* Forgot Password Form */
            <form onSubmit={handleForgotPassword} className='space-y-6'>
              <div className='space-y-4'>
                {/* Email Field */}
                <div className='space-y-2'>
                  <Label htmlFor='resetEmail' className='sr-only'>
                    Email
                  </Label>
                  <div className='relative'>
                    <Mail className='absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                    <Input
                      id='resetEmail'
                      type='email'
                      placeholder='Enter your email'
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      className='pl-12 h-14 bg-transparent border-2 rounded-full placeholder-gray-400 focus:border-border'
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Reset Password Button */}
              <Button
                type='submit'
                className='w-full h-14 bg-primary text-primary-foreground font-semibold rounded-full text-lg transition-colors'>
                Send Reset Email
              </Button>

              {/* Back to Login Link */}
              <div className='text-center'>
                <button
                  type='button'
                  onClick={() => {
                    setShowForgotPassword(false);
                    setError('');
                    setResetMessage('');
                  }}
                  className='text-gray-400 hover:text-gray-300 transition-colors'>
                  Back to Login
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Right Side - Illustration */}
      <div className='flex items-center justify-center'>
        <Image
          src='/login-banner.gif'
          alt='Login Illustration'
          width={500}
          height={500}
          className='hidden lg:block'
        />
      </div>
    </div>
  );
}
