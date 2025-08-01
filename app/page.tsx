'use client';

import Image from 'next/image';
import React, { useState } from 'react';
import CircularProgress from './components/CircularProgress';
import EnhancedToast from './components/EnhancedToast';

import ParticleSystem from './components/ParticleSystem';
import StatsCard from './components/StatsCard';

import { useMultipleFiles } from './hooks/useMultipleFiles';

export default function Home() {
  const {
    files,
    addFiles,
    convertFile,
    convertAllFiles,
    removeFile,
    downloadFile,
    downloadAll,
    isConvertingAll,
    isProcessingFiles,
    canConvertAll,
    allConverted,
  } = useMultipleFiles();

  const [isDragOver, setIsDragOver] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'info',
    isVisible: false,
  });

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info'
  ) => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, isVisible: false }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      try {
        const result = await addFiles(selectedFiles);
        if (!result.success) {
          showToast(result.message, 'warning');
        } else {
          showToast(result.message, 'success');
        }
      } catch (error) {
        showToast('Error processing files. Please try again.', 'error');
      }
    }
  };

  const handleDragOver = (
    e: React.DragEvent<HTMLLabelElement | HTMLDivElement>
  ) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (
    e: React.DragEvent<HTMLLabelElement | HTMLDivElement>
  ) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = async (
    e: React.DragEvent<HTMLLabelElement | HTMLDivElement>
  ) => {
    e.preventDefault();
    setIsDragOver(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      try {
        const result = await addFiles(droppedFiles);
        if (!result.success) {
          showToast(result.message, 'warning');
        } else {
          showToast(result.message, 'success');
        }
      } catch (error) {
        showToast('Error processing files. Please try again.', 'error');
      }
    }
  };

  const handleConvertAll = async () => {
    if (canConvertAll) {
      await convertAllFiles();
      showToast('All images have been successfully converted', 'success');
    }
  };

  const handleDownloadAll = () => {
    downloadAll();
    showToast('Download started for all images', 'success');
  };

  const getReductionPercentage = (
    originalSize: string,
    convertedSize: string
  ) => {
    const getBytes = (str: string): number => {
      const [value, unit] = str.split(' ');
      const size = parseFloat(value);
      if (unit === 'MB') return size * 1024 * 1024;
      if (unit === 'KB') return size * 1024;
      return size;
    };

    const originalBytes = getBytes(originalSize);
    const convertedBytes = getBytes(convertedSize);

    const percentage = ((originalBytes - convertedBytes) / originalBytes) * 100;
    const formatted =
      percentage >= 10 ? percentage.toFixed(1) : percentage.toFixed(2);

    return `-${formatted}%`;
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden flex flex-col'>
      {/* Particle System */}
      <ParticleSystem />

      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

      {/* Floating elements */}
      <div className='absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse'></div>
      <div className='absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000'></div>

      <div className='relative z-10 flex-1 flex flex-col py-8 px-4'>
        {/* Nav Header */}
        <div className='w-full max-w-6xl mx-auto mb-8'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center space-x-4'>
              <div className='w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg'>
                <svg
                  className='w-6 h-6 text-white'
                  fill='none'
                  stroke='currentColor'
                  viewBox='0 0 24 24'
                >
                  <path
                    strokeLinecap='round'
                    strokeLinejoin='round'
                    strokeWidth={2}
                    d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                  />
                </svg>
              </div>
              <div>
                <h1 className='text-2xl font-bold text-white'>Image to WebP</h1>
                <p className='text-sm text-gray-300'>Smart image converter</p>
              </div>
            </div>
          </div>
        </div>

        <div className='w-full max-w-6xl mx-auto flex-1 flex flex-col'>
          {/* File upload area */}
          {files.length === 0 && !isProcessingFiles && (
            <label
              className={`backdrop-blur-xl border-2 border-dashed rounded-3xl shadow-2xl p-8 flex-1 flex items-center justify-center transition-all duration-300 group cursor-pointer ${
                isDragOver
                  ? 'border-purple-400 bg-purple-500/10 scale-105'
                  : 'bg-white/10 border-purple-400/50 hover:border-purple-400/70'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className='text-center'>
                <div className='w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                  {isDragOver ? (
                    <svg
                      className='w-12 h-12 text-purple-400 animate-bounce'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                      />
                    </svg>
                  ) : (
                    <svg
                      className='w-12 h-12 text-purple-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                      />
                    </svg>
                  )}
                </div>
                <h3 className='text-2xl font-semibold text-white mb-2'>
                  Upload your images
                </h3>
                <p className='text-gray-300 mb-6'>
                  {isDragOver
                    ? 'Drop here!'
                    : 'Drag and drop your PNG, JPG, or JPEG files here, or click to select (max 10 files)'}
                </p>
                <div className='inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg'>
                  <svg
                    className='w-5 h-5 mr-2'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                    />
                  </svg>
                  Select files
                </div>
                <input
                  type='file'
                  accept='.png,.jpg,.jpeg,image/png,image/jpeg,image/jpg'
                  multiple
                  onChange={handleFileChange}
                  className='hidden'
                />
              </div>
            </label>
          )}

          {/* Processing indicator */}
          {isProcessingFiles && files.length === 0 && (
            <div className='backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-12 flex-1 flex items-center justify-center'>
              <div className='text-center'>
                <div className='w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center'>
                  <svg
                    className='animate-spin w-12 h-12 text-purple-400'
                    xmlns='http://www.w3.org/2000/svg'
                    fill='none'
                    viewBox='0 0 24 24'
                  >
                    <circle
                      className='opacity-25'
                      cx='12'
                      cy='12'
                      r='10'
                      stroke='currentColor'
                      strokeWidth='4'
                    ></circle>
                    <path
                      className='opacity-75'
                      fill='currentColor'
                      d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                    ></path>
                  </svg>
                </div>
                <h3 className='text-2xl font-semibold text-white mb-2'>
                  Processing images...
                </h3>
                <p className='text-gray-300'>
                  Compressing and analyzing your files
                </p>
              </div>
            </div>
          )}

          {/* Files list */}
          {files.length > 0 && (
            <div className='space-y-6'>
              {/* Stats Cards */}
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
                <StatsCard
                  title='Total Files'
                  value={files.length}
                  subtitle='Images uploaded'
                  icon={
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
                        d='M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
                      />
                    </svg>
                  }
                  color='purple'
                />
                <StatsCard
                  title='Converted'
                  value={files.filter((f) => f.convertedUrl).length}
                  subtitle='Successfully processed'
                  icon={
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
                  }
                  color='green'
                />
                <StatsCard
                  title='Pending'
                  value={
                    files.filter((f) => !f.convertedUrl && !f.error).length
                  }
                  subtitle='Awaiting conversion'
                  icon={
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
                        d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                      />
                    </svg>
                  }
                  color='blue'
                />
              </div>

              {/* Bulk actions */}
              <div className='backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6'>
                <div className='flex flex-wrap items-center justify-between gap-4'>
                  <div className='flex items-center space-x-4'>
                    <h3 className='text-xl font-semibold text-white'>
                      Bulk actions
                    </h3>
                    <span className='text-sm text-gray-300'>
                      {files.filter((f) => !f.convertedUrl && !f.error).length}{' '}
                      pending
                    </span>
                  </div>
                  <div className='flex items-center flex-wrap gap-y-2 space-x-3'>
                    {canConvertAll && (
                      <button
                        onClick={handleConvertAll}
                        disabled={isConvertingAll}
                        className='inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg cursor-pointer'
                      >
                        {isConvertingAll ? (
                          <>
                            <svg
                              className='animate-spin -ml-1 mr-3 h-5 w-5 text-white'
                              xmlns='http://www.w3.org/2000/svg'
                              fill='none'
                              viewBox='0 0 24 24'
                            >
                              <circle
                                className='opacity-25'
                                cx='12'
                                cy='12'
                                r='10'
                                stroke='currentColor'
                                strokeWidth='4'
                              ></circle>
                              <path
                                className='opacity-75'
                                fill='currentColor'
                                d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                              ></path>
                            </svg>
                            Converting...
                          </>
                        ) : (
                          <>
                            <svg
                              className='w-5 h-5 mr-2'
                              fill='none'
                              stroke='currentColor'
                              viewBox='0 0 24 24'
                            >
                              <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M13 10V3L4 14h7v7l9-11h-7z'
                              />
                            </svg>
                            Convert all
                          </>
                        )}
                      </button>
                    )}
                    {allConverted && (
                      <div className='flex items-center flex-wrap gap-y-2 space-x-3'>
                        <button
                          onClick={handleDownloadAll}
                          className='inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg cursor-pointer'
                        >
                          <svg
                            className='w-5 h-5 mr-2'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                            />
                          </svg>
                          Download all
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Files grid */}
              <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
                {files.map((fileWithMeta) => (
                  <div
                    key={fileWithMeta.id}
                    className='backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 space-y-4 overflow-hidden'
                  >
                    {/* File header */}
                    <div className='flex items-center justify-between'>
                      <div className='flex items-center space-x-3 flex-1 min-w-0'>
                        {/* Format badge */}
                        <div className='flex-shrink-0'>
                          <span className='inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-400/30 rounded-lg'>
                            {fileWithMeta.file.type.includes('png')
                              ? 'PNG'
                              : fileWithMeta.file.type.includes('jpeg')
                              ? 'JPEG'
                              : 'JPG'}
                          </span>
                        </div>
                        <h4 className='text-lg font-semibold text-white truncate'>
                          {fileWithMeta.file.name}
                        </h4>
                      </div>
                      <button
                        onClick={() => removeFile(fileWithMeta.id)}
                        className='flex-shrink-0 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-all duration-300 cursor-pointer'
                        title='Remove file'
                      >
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
                            d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                          />
                        </svg>
                      </button>
                    </div>

                    {/* Error display */}
                    {fileWithMeta.error && (
                      <div className='bg-red-500/20 border border-red-400/50 rounded-xl p-4'>
                        <div className='flex items-center'>
                          <svg
                            className='w-5 h-5 text-red-400 mr-2'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
                            />
                          </svg>
                          <p className='text-red-200 text-sm'>
                            {fileWithMeta.error}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Image preview */}
                    {fileWithMeta.previewUrl && (
                      <div className='flex justify-center'>
                        <div className='relative group'>
                          <Image
                            src={fileWithMeta.previewUrl}
                            alt={`Preview of ${fileWithMeta.file.name}`}
                            width={300}
                            height={200}
                            className='w-full h-auto rounded-xl max-h-40 object-contain shadow-lg group-hover:scale-105 transition-transform duration-300'
                          />
                          {/* Show conversion status badge */}
                          {fileWithMeta.isConverting && (
                            <div className='absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full animate-pulse'>
                              Converting...
                            </div>
                          )}
                          {fileWithMeta.isAnalyzing && (
                            <div className='absolute top-2 right-2 bg-purple-500 text-white text-xs px-2 py-1 rounded-full animate-pulse'>
                              Analyzing...
                            </div>
                          )}
                          {/* Show success badge when converted */}
                          {fileWithMeta.convertedUrl && (
                            <div className='absolute top-2 right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full'>
                              ✓ WebP
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* File metadata */}
                    {fileWithMeta.metadata && (
                      <div className='space-y-2'>
                        <div className='flex justify-between items-center text-sm'>
                          <span className='text-gray-300'>Original size:</span>
                          <span className='font-medium text-white'>
                            {fileWithMeta.metadata.size}
                          </span>
                        </div>
                        <div className='flex justify-between items-center text-sm'>
                          <span className='text-gray-300'>Dimensions:</span>
                          <span className='font-medium text-white'>
                            {fileWithMeta.metadata.width} ×{' '}
                            {fileWithMeta.metadata.height}px
                          </span>
                        </div>

                        {/* Estimated WebP size */}
                        {fileWithMeta.isAnalyzing && (
                          <div className='flex justify-between items-center text-sm'>
                            <span className='text-gray-300'>
                              Estimated size:
                            </span>
                            <div className='flex items-center'>
                              <svg
                                className='animate-spin h-4 w-4 text-blue-400 mr-2'
                                xmlns='http://www.w3.org/2000/svg'
                                fill='none'
                                viewBox='0 0 24 24'
                              >
                                <circle
                                  className='opacity-25'
                                  cx='12'
                                  cy='12'
                                  r='10'
                                  stroke='currentColor'
                                  strokeWidth='4'
                                ></circle>
                                <path
                                  className='opacity-75'
                                  fill='currentColor'
                                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                                ></path>
                              </svg>
                              <span className='text-blue-400 text-xs'>
                                Analyzing...
                              </span>
                            </div>
                          </div>
                        )}

                        {fileWithMeta.estimatedWebPSize &&
                          !fileWithMeta.convertedUrl && (
                            <div className='flex justify-between items-center text-sm'>
                              <span className='text-gray-300'>
                                Estimated size:
                              </span>
                              <div className='text-right'>
                                <span className='font-medium text-green-400'>
                                  {fileWithMeta.estimatedWebPSize}
                                </span>
                                <div className='text-xs text-green-300'>
                                  {getReductionPercentage(
                                    fileWithMeta.metadata.size,
                                    fileWithMeta.estimatedWebPSize
                                  )}{' '}
                                  smaller
                                </div>
                              </div>
                            </div>
                          )}

                        {/* Converted size */}
                        {fileWithMeta.convertedSize && (
                          <div className='flex justify-between items-center text-sm'>
                            <span className='text-gray-300'>WebP size:</span>
                            <div className='text-right'>
                              <span className='font-medium text-green-400'>
                                {fileWithMeta.convertedSize}
                              </span>
                              <div className='text-xs text-green-300'>
                                {getReductionPercentage(
                                  fileWithMeta.metadata.size,
                                  fileWithMeta.convertedSize
                                )}{' '}
                                smaller
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className='flex flex-col gap-2'>
                      {!fileWithMeta.convertedUrl && !fileWithMeta.error && (
                        <button
                          onClick={() => convertFile(fileWithMeta.id)}
                          disabled={
                            fileWithMeta.isConverting ||
                            fileWithMeta.isAnalyzing
                          }
                          className='w-full inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg text-sm cursor-pointer'
                        >
                          {fileWithMeta.isConverting ? (
                            <>
                              <CircularProgress
                                progress={75}
                                size={20}
                                strokeWidth={2}
                              />
                              <span className='ml-2'>Converting...</span>
                            </>
                          ) : fileWithMeta.isAnalyzing ? (
                            <>
                              <CircularProgress
                                progress={50}
                                size={20}
                                strokeWidth={2}
                                color='#3b82f6'
                              />
                              <span className='ml-2'>Analyzing...</span>
                            </>
                          ) : (
                            <>
                              <svg
                                className='w-4 h-4 mr-2'
                                fill='none'
                                stroke='currentColor'
                                viewBox='0 0 24 24'
                              >
                                <path
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  strokeWidth={2}
                                  d='M13 10V3L4 14h7v7l9-11h-7z'
                                />
                              </svg>
                              Convert
                            </>
                          )}
                        </button>
                      )}

                      {fileWithMeta.convertedUrl && (
                        <button
                          onClick={() => downloadFile(fileWithMeta.id)}
                          className='w-full inline-flex items-center justify-center px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-700 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-sm cursor-pointer'
                        >
                          <svg
                            className='w-4 h-4 mr-2'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                            />
                          </svg>
                          Download
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add more placeholder - only show when there are 1-9 files */}
                {files.length > 0 && files.length < 10 && (
                  <label
                    className={`backdrop-blur-xl border border-dashed rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 transition-all duration-300 group cursor-pointer ${
                      isDragOver
                        ? 'bg-purple-500/20 border-purple-400 scale-105'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className='w-16 h-16 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
                      {isDragOver ? (
                        <svg
                          className='w-8 h-8 text-purple-400 animate-bounce'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12'
                          />
                        </svg>
                      ) : (
                        <svg
                          className='w-8 h-8 text-purple-400 group-hover:text-purple-300 transition-colors duration-300'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                          />
                        </svg>
                      )}
                    </div>
                    <div className='text-center'>
                      <h4 className='text-lg font-semibold text-white mb-1'>
                        {isDragOver ? 'Drop here!' : 'Add more images'}
                      </h4>
                      <p className='text-sm text-gray-300'>
                        {isDragOver
                          ? 'Release to add images'
                          : `${10 - files.length} space${
                              10 - files.length === 1 ? '' : 's'
                            } available`}
                      </p>
                    </div>
                    <div className='inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-sm'>
                      <svg
                        className='w-4 h-4 mr-2'
                        fill='none'
                        stroke='currentColor'
                        viewBox='0 0 24 24'
                      >
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                        />
                      </svg>
                      Select files
                    </div>
                    <input
                      type='file'
                      accept='.png,.jpg,.jpeg,image/png,image/jpeg,image/jpg'
                      multiple
                      onChange={handleFileChange}
                      className='hidden'
                    />
                  </label>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className='relative z-10 py-8 px-4'>
        <div className='w-full max-w-6xl mx-auto'>
          <div className='text-center'>
            <p className='text-gray-400 text-sm flex items-center justify-center space-x-2'>
              <span>Made with</span>
              <span className='text-red-400 animate-pulse'>❤️</span>
              <span>by</span>
              <a
                href='https://github.com/sebastianmaciel'
                target='_blank'
                rel='noopener noreferrer'
                className='text-purple-400 hover:text-purple-300 transition-colors duration-300 font-semibold hover:underline'
              >
                Sebastián Maciel
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Enhanced Toast notification */}
      <EnhancedToast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}
