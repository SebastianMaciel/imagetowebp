'use client';

import { useEffect, useState } from 'react';

interface CircularProgressProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
}

export default function CircularProgress({
  progress,
  size = 40,
  strokeWidth = 4,
  color = '#8b5cf6',
  className = '',
}: CircularProgressProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset =
    circumference - (animatedProgress / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);

    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className={`relative ${className}`}>
      <svg
        width={size}
        height={size}
        className='transform -rotate-90'
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke='rgba(139, 92, 246, 0.2)'
          strokeWidth={strokeWidth}
          fill='none'
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill='none'
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap='round'
          className='transition-all duration-1000 ease-out'
        />
      </svg>

      {/* Center content */}
      <div className='absolute inset-0 flex items-center justify-center'>
        <span className='text-xs font-semibold text-white'>
          {Math.round(animatedProgress)}%
        </span>
      </div>
    </div>
  );
}
