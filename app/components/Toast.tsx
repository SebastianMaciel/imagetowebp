'use client';

import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  type,
  isVisible,
  onClose,
  duration = 5000,
}: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsExiting(false);
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);

  const handleClose = () => {
    setIsExiting(true);
    // Wait for the animation to finish before calling onClose
    setTimeout(() => {
      onClose();
      setIsExiting(false);
    }, 300); // Exit animation duration
  };

  if (!isVisible && !isExiting) return null;

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500/20 border-green-400/50 text-green-200';
      case 'error':
        return 'bg-red-500/20 border-red-400/50 text-red-200';
      case 'warning':
        return 'bg-yellow-500/20 border-yellow-400/50 text-yellow-200';
      case 'info':
        return 'bg-blue-500/20 border-blue-400/50 text-blue-200';
      default:
        return 'bg-gray-500/20 border-gray-400/50 text-gray-200';
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

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isExiting ? 'slide-out-to-right-2' : 'slide-in-from-right-2'
      }`}
    >
      <div
        className={`flex items-center p-4 rounded-xl border backdrop-blur-xl shadow-2xl max-w-md ${getToastStyles()}`}
      >
        <div className='flex-shrink-0 mr-3'>{getIcon()}</div>
        <div className='flex-1'>
          <p className='text-sm font-medium'>{message}</p>
        </div>
        <button
          onClick={handleClose}
          className='flex-shrink-0 ml-3 p-1 rounded-lg hover:bg-white/10 transition-colors duration-200 cursor-pointer'
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
