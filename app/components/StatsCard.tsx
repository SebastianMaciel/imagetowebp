'use client';

import { useEffect, useState } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  color?: 'purple' | 'blue' | 'green' | 'orange';
  className?: string;
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  color = 'purple',
  className = '',
}: StatsCardProps) {
  const [animatedValue, setAnimatedValue] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const colorClasses = {
    purple: 'border-purple-500/30 bg-purple-500/5',
    blue: 'border-blue-500/30 bg-blue-500/5',
    green: 'border-green-500/30 bg-green-500/5',
    orange: 'border-orange-500/30 bg-orange-500/5',
  };

  const iconColorClasses = {
    purple: 'text-purple-400',
    blue: 'text-blue-400',
    green: 'text-green-400',
    orange: 'text-orange-400',
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.querySelector(`[data-stats-card="${title}"]`);
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, [title]);

  useEffect(() => {
    if (isVisible && typeof value === 'number') {
      const duration = 1000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        if (current >= value) {
          setAnimatedValue(value);
          clearInterval(timer);
        } else {
          setAnimatedValue(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(timer);
    } else if (isVisible) {
      setAnimatedValue(value);
    }
  }, [isVisible, value]);

  return (
    <div
      data-stats-card={title}
      className={`border rounded-xl p-4 ${
        colorClasses[color]
      } transition-all duration-700 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      } ${className} relative group hover:scale-105`}
    >
      <div className='flex items-center justify-between mb-3'>
        <h3 className='text-sm font-medium text-gray-300 uppercase tracking-wide'>
          {title}
        </h3>
        {icon && <div className={iconColorClasses[color]}>{icon}</div>}
      </div>

      <div className='space-y-1'>
        <div className='text-2xl font-semibold text-white'>
          {typeof animatedValue === 'number'
            ? animatedValue.toLocaleString()
            : animatedValue}
        </div>
        {subtitle && <p className='text-xs text-gray-400'>{subtitle}</p>}
      </div>

      {/* Animated background glow on hover */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-20 pointer-events-none`}
      />
    </div>
  );
}
