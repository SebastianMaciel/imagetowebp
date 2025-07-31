'use client';

import { useEffect, useState } from 'react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleTheme = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsDark(!isDark);
      setIsAnimating(false);
    }, 300);
  };

  useEffect(() => {
    // Aplicar tema al documento
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <button
      onClick={toggleTheme}
      className={`relative w-16 h-8 rounded-full transition-all duration-500 ${
        isDark
          ? 'bg-gradient-to-r from-purple-600 to-blue-600'
          : 'bg-gradient-to-r from-yellow-400 to-orange-500'
      } ${isAnimating ? 'scale-110' : 'scale-100'}`}
    >
      {/* Background stars for dark mode */}
      {isDark && (
        <div className='absolute inset-0 overflow-hidden rounded-full'>
          <div className='absolute top-1 left-2 w-1 h-1 bg-white rounded-full opacity-60 animate-pulse' />
          <div className='absolute top-3 right-3 w-0.5 h-0.5 bg-white rounded-full opacity-40 animate-pulse delay-100' />
          <div className='absolute bottom-2 left-4 w-0.5 h-0.5 bg-white rounded-full opacity-50 animate-pulse delay-200' />
        </div>
      )}

      {/* Sun rays for light mode */}
      {!isDark && (
        <div className='absolute inset-0 overflow-hidden rounded-full'>
          <div className='absolute top-0 left-1/2 w-0.5 h-2 bg-white transform -translate-x-1/2 opacity-60' />
          <div className='absolute top-1 right-1 w-1 h-1 bg-white rounded-full opacity-80' />
          <div className='absolute bottom-1 left-1 w-1 h-1 bg-white rounded-full opacity-80' />
        </div>
      )}

      {/* Toggle circle */}
      <div
        className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-500 transform ${
          isDark ? 'translate-x-7' : 'translate-x-1'
        } ${isAnimating ? 'rotate-180' : 'rotate-0'}`}
      >
        {/* Icon inside toggle */}
        <div className='absolute inset-0 flex items-center justify-center'>
          {isDark ? (
            <svg
              className='w-3 h-3 text-purple-600'
              fill='currentColor'
              viewBox='0 0 24 24'
            >
              <path d='M12 3c.132 0 .263 0 .393 0a7.5 7.5 0 0 0 7.92 12.446a9 9 0 1 1 -8.313 -12.454z' />
            </svg>
          ) : (
            <svg
              className='w-3 h-3 text-yellow-500'
              fill='currentColor'
              viewBox='0 0 24 24'
            >
              <path d='M12 2.25a.75.75 0 0 1 .75.75v2.25a.75.75 0 0 1 -1.5 0V3a.75.75 0 0 1 .75 -0.75ZM7.5 12a4.5 4.5 0 1 1 9 0a4.5 4.5 0 0 1 -9 0ZM18.894 6.166a.75.75 0 0 0 -1.06 -1.06l-1.591 1.59a.75.75 0 1 0 1.06 1.061l1.591 -1.59ZM21.75 12a.75.75 0 0 1 -0.75.75h-2.25a.75.75 0 0 1 0 -1.5H21a.75.75 0 0 1 .75.75ZM17.834 18.894a.75.75 0 0 0 1.06 -1.06l-1.59 -1.591a.75.75 0 1 0 -1.061 1.06l1.59 1.591ZM12 18a.75.75 0 0 1 .75.75V21a.75.75 0 0 1 -1.5 0v-2.25A.75.75 0 0 1 12 18ZM7.758 17.303a.75.75 0 0 0 -1.061 -1.06l-1.591 1.59a.75.75 0 0 0 1.06 1.061l1.591 -1.59ZM6 12a.75.75 0 0 1 -0.75.75H3a.75.75 0 0 1 0 -1.5h2.25A.75.75 0 0 1 6 12ZM6.697 7.757a.75.75 0 0 0 1.06 -1.06l-1.59 -1.591a.75.75 0 0 0 -1.061 1.06l1.59 1.591Z' />
            </svg>
          )}
        </div>
      </div>
    </button>
  );
}
