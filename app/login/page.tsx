'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const { user, signInWithMicrosoft } = useAuth();
  // Microsoft sign-in handler
  const handleMicrosoftSignIn = async () => {
    setError('');
    setIsLoading(true);
    try {
      const msresult = await signInWithMicrosoft();
      console.log('Microsoft sign-in result:', msresult);
      router.push('/');
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        setError('Sign in popup closed. Please try again.');
      } else {
        console.error('Microsoft sign-in error:', error);
        setError('Microsoft sign in failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

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
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Microsoft Sign In Button */}
          <Button
            type='button'
            onClick={handleMicrosoftSignIn}
            disabled={isLoading}
            className='w-full h-14 bg-white border-2 border-gray-200 text-gray-700 font-semibold rounded-full text-lg flex items-center justify-center gap-2 shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50'
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <svg
              width='24'
              height='24'
              viewBox='0 0 24 24'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'>
              <rect x='2' y='2' width='9.5' height='9.5' fill='#F35325' />
              <rect x='12.5' y='2' width='9.5' height='9.5' fill='#81BC06' />
              <rect x='2' y='12.5' width='9.5' height='9.5' fill='#05A6F0' />
              <rect x='12.5' y='12.5' width='9.5' height='9.5' fill='#FFBA08' />
            </svg>
            {isLoading
              ? 'Signing in with Microsoft...'
              : 'Sign in with Microsoft'}
          </Button>
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
