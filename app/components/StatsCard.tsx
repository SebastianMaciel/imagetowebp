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
    purple: 'from-purple-500/20 to-purple-600/20 border-purple-400/30',
    blue: 'from-blue-500/20 to-blue-600/20 border-blue-400/30',
    green: 'from-green-500/20 to-green-600/20 border-green-400/30',
    orange: 'from-orange-500/20 to-orange-600/20 border-orange-400/30',
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
      className={`backdrop-blur-xl bg-gradient-to-br ${
        colorClasses[color]
      } border rounded-2xl p-6 transition-all duration-700 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      } ${className}`}
    >
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-lg font-semibold text-white'>{title}</h3>
        {icon && (
          <div
            className={`w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center ${iconColorClasses[color]}`}
          >
            {icon}
          </div>
        )}
      </div>

      <div className='space-y-2'>
        <div className='text-3xl font-bold text-white'>
          {typeof animatedValue === 'number'
            ? animatedValue.toLocaleString()
            : animatedValue}
        </div>
        {subtitle && <p className='text-sm text-gray-300'>{subtitle}</p>}
      </div>

      {/* Animated background glow */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color]} rounded-2xl opacity-0 transition-opacity duration-500 hover:opacity-20 pointer-events-none`}
      />
    </div>
  );
}
