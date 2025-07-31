'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface ImageComparisonProps {
  originalSrc: string;
  convertedSrc: string;
  originalAlt: string;
  convertedAlt: string;
  className?: string;
}

export default function ImageComparison({
  originalSrc,
  convertedSrc,
  originalAlt,
  convertedAlt,
  className = '',
}: ImageComparisonProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent | MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;

    setSliderPosition(Math.max(0, Math.min(100, percentage)));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-xl ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseUp}
    >
      {/* Imagen original (fondo) */}
      <div className='relative w-full h-48'>
        <Image
          src={originalSrc}
          alt={originalAlt}
          fill
          className='object-contain'
        />
      </div>

      {/* Imagen convertida (superpuesta) */}
      <div
        className='absolute inset-0 overflow-hidden'
        style={{ width: `${sliderPosition}%` }}
      >
        <div className='relative w-full h-48'>
          <Image
            src={convertedSrc}
            alt={convertedAlt}
            fill
            className='object-contain'
          />
        </div>
      </div>

      {/* Slider */}
      <div
        className='absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize flex items-center justify-center'
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
      >
        <div className='w-6 h-6 bg-white rounded-full shadow-lg flex items-center justify-center'>
          <svg
            className='w-4 h-4 text-gray-600'
            fill='currentColor'
            viewBox='0 0 24 24'
          >
            <path d='M8 5v14l2-2l2 2V5H8zm6 0v14l2-2l2 2V5h-4z' />
          </svg>
        </div>
      </div>

      {/* Labels */}
      <div className='absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded'>
        Original
      </div>
      <div className='absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded'>
        WebP
      </div>
    </div>
  );
}
