'use client';

import { useCallback, useEffect, useState } from 'react';

interface EnhancedToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function EnhancedToast({
  message,
  type,
  isVisible,
  onClose,
  duration = 5000,
}: EnhancedToastProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
      setIsExiting(false);
    }, 300);
  }, [onClose]);

  useEffect(() => {
    if (isVisible) {
      setIsExiting(false);
      setProgress(100);

      // Progress bar animation
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(progressInterval);
            return 0;
          }
          return prev - 100 / (duration / 100);
        });
      }, 100);

      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => {
        clearTimeout(timer);
        clearInterval(progressInterval);
      };
    }
  }, [isVisible, duration, handleClose]);

  if (!isVisible && !isExiting) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20',
          border: 'border-green-400/50',
          text: 'text-green-200',
          icon: 'text-green-400',
          progress: 'bg-green-400',
        };
      case 'error':
        return {
          bg: 'bg-gradient-to-r from-red-500/20 to-pink-500/20',
          border: 'border-red-400/50',
          text: 'text-red-200',
          icon: 'text-red-400',
          progress: 'bg-red-400',
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20',
          border: 'border-yellow-400/50',
          text: 'text-yellow-200',
          icon: 'text-yellow-400',
          progress: 'bg-yellow-400',
        };
      case 'info':
        return {
          bg: 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20',
          border: 'border-blue-400/50',
          text: 'text-blue-200',
          icon: 'text-blue-400',
          progress: 'bg-blue-400',
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-500/20 to-slate-500/20',
          border: 'border-gray-400/50',
          text: 'text-gray-200',
          icon: 'text-gray-400',
          progress: 'bg-gray-400',
        };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg
            className='w-5 h-5'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M5 13l4 4L19 7'
            />
          </svg>
        );
      case 'error':
        return (
          <svg
            className='w-5 h-5'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        );
      case 'warning':
        return (
          <svg
            className='w-5 h-5'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z'
            />
          </svg>
        );
      case 'info':
        return (
          <svg
            className='w-5 h-5'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const styles = getToastStyles();

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-500 transform ${
        isExiting
          ? 'translate-x-full opacity-0 scale-95'
          : 'translate-x-0 opacity-100 scale-100'
      }`}
    >
      <div
        className={`relative overflow-hidden flex items-center p-4 rounded-2xl border backdrop-blur-xl shadow-2xl max-w-md ${styles.bg} ${styles.border} ${styles.text} animate-float`}
      >
        {/* Progress bar */}
        <div className='absolute bottom-0 left-0 h-1 bg-white/20 w-full'>
          <div
            className={`h-full transition-all duration-100 ${styles.progress}`}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className='flex-shrink-0 mr-3'>
          <div className={`${styles.icon} animate-pulse-glow`}>{getIcon()}</div>
        </div>

        <div className='flex-1'>
          <p className='text-sm font-medium'>{message}</p>
        </div>

        <button
          onClick={handleClose}
          className='flex-shrink-0 ml-3 p-1 rounded-lg hover:bg-white/10 transition-all duration-200 cursor-pointer hover:scale-110'
        >
          <svg
            className='w-4 h-4'
            fill='none'
            stroke='currentColor'
            viewBox='0 0 24 24'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
