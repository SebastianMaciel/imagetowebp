'use client';

import Image from 'next/image';
import React, { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [imageMetadata, setImageMetadata] = useState<{
    width: number;
    height: number;
    size: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [convertedImageUrl, setConvertedImageUrl] = useState<string | null>(
    null
  );
  const [convertedImageSize, setConvertedImageSize] = useState<string | null>(
    null
  );
  const [previewConvertedSize, setPreviewConvertedSize] = useState<
    string | null
  >(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const processFile = (selectedFile: File) => {
    if (selectedFile && selectedFile.type.includes('png')) {
      setFile(selectedFile);
      setError(null);
      setConvertedImageUrl(null);
      setPreviewConvertedSize(null);

      // Crear preview de la imagen
      const url = URL.createObjectURL(selectedFile);
      setFilePreviewUrl(url);

      // Obtener metadata de la imagen
      const img = document.createElement('img');
      img.onload = () => {
        const sizeInKB = (selectedFile.size / 1024).toFixed(1);
        const sizeInMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
        const size =
          selectedFile.size > 1024 * 1024 ? `${sizeInMB} MB` : `${sizeInKB} KB`;

        setImageMetadata({
          width: img.width,
          height: img.height,
          size: size,
        });

        // Iniciar conversión automática en segundo plano
        convertImageInBackground(selectedFile);
      };
      img.src = url;
    } else {
      setError('Por favor selecciona un archivo PNG válido');
      setFile(null);
      setFilePreviewUrl(null);
      setImageMetadata(null);
      setPreviewConvertedSize(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      const droppedFile = files[0];

      // Validar que sea un archivo PNG
      if (!droppedFile.type.includes('png')) {
        setError('Por favor arrastra un archivo PNG válido');
        return;
      }

      processFile(droppedFile);
    }
  };

  const convertImageInBackground = async (file: File) => {
    setIsConverting(true);
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al convertir la imagen');
      }

      const blob = await response.blob();

      // Calcular el tamaño del archivo convertido
      const sizeInKB = (blob.size / 1024).toFixed(1);
      const sizeInMB = (blob.size / (1024 * 1024)).toFixed(2);
      const convertedSize =
        blob.size > 1024 * 1024 ? `${sizeInMB} MB` : `${sizeInKB} KB`;

      setPreviewConvertedSize(convertedSize);

      // Limpiar el blob ya que solo necesitamos el tamaño
      URL.revokeObjectURL(URL.createObjectURL(blob));
    } catch (err) {
      console.error('Error en conversión automática:', err);
      // No mostrar error al usuario ya que es una conversión en segundo plano
    } finally {
      setIsConverting(false);
    }
  };

  const handleConvert = async () => {
    if (!file) {
      setError('Por favor selecciona un archivo PNG');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al convertir la imagen');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setConvertedImageUrl(url);

      // Calcular el tamaño del archivo convertido
      const sizeInKB = (blob.size / 1024).toFixed(1);
      const sizeInMB = (blob.size / (1024 * 1024)).toFixed(2);
      const convertedSize =
        blob.size > 1024 * 1024 ? `${sizeInMB} MB` : `${sizeInKB} KB`;
      setConvertedImageSize(convertedSize);

      // Ocultar la vista previa del PNG después de la conversión
      setFilePreviewUrl(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (convertedImageUrl) {
      const link = document.createElement('a');
      link.href = convertedImageUrl;
      link.download = 'converted.webp';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleRemoveImage = () => {
    setFile(null);
    setFilePreviewUrl(null);
    setImageMetadata(null);
    setConvertedImageUrl(null);
    setConvertedImageSize(null);
    setPreviewConvertedSize(null);
    setError(null);
  };

  // Cleanup de URLs de objetos
  React.useEffect(() => {
    return () => {
      if (filePreviewUrl) {
        URL.revokeObjectURL(filePreviewUrl);
      }
      if (convertedImageUrl) {
        URL.revokeObjectURL(convertedImageUrl);
      }
    };
  }, [filePreviewUrl, convertedImageUrl]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden'>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>

      {/* Floating elements */}
      <div className='absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse'></div>
      <div className='absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000'></div>

      <div className='relative z-10 min-h-screen flex flex-col py-8 px-4'>
        {/* Nav Header */}
        <div className='w-full max-w-4xl mx-auto mb-8'>
          <div className='flex items-center'>
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
                <h1 className='text-2xl font-bold text-white'>PNG a WebP</h1>
                <p className='text-sm text-gray-300'>
                  Conversor inteligente de imágenes
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className='w-full max-w-4xl mx-auto flex-1 flex items-start justify-center'>
          {/* Main container */}
          <div className='backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 space-y-8'>
            {/* File upload area */}
            {!file && !convertedImageUrl && (
              <div className='text-center'>
                <div
                  className={`border-2 border-dashed rounded-2xl p-12 transition-all duration-300 group ${
                    isDragOver
                      ? 'border-purple-400 bg-purple-500/10 scale-105'
                      : 'border-purple-400/50 hover:border-purple-400/70'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
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
                    Sube tu imagen PNG
                  </h3>
                  <p className='text-gray-300 mb-6'>
                    {isDragOver
                      ? '¡Suelta aquí!'
                      : 'Arrastra y suelta tu archivo PNG aquí, o haz clic para seleccionar'}
                  </p>
                  <label className='inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 cursor-pointer shadow-lg'>
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
                    Seleccionar archivo
                    <input
                      type='file'
                      accept='.png,image/png'
                      onChange={handleFileChange}
                      className='hidden'
                    />
                  </label>
                </div>
              </div>
            )}

            {/* Image preview */}
            {filePreviewUrl && (
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-2xl font-semibold text-white flex items-center'>
                    <svg
                      className='w-6 h-6 mr-2 text-purple-400'
                      fill='none'
                      stroke='currentColor'
                      viewBox='0 0 24 24'
                    >
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                      />
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                      />
                    </svg>
                    Vista previa
                  </h3>
                  <button
                    onClick={handleRemoveImage}
                    className='flex items-center px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-all duration-300'
                    title='Eliminar imagen'
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
                        d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                      />
                    </svg>
                    Eliminar
                  </button>
                </div>
                <div className='bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-400/30 rounded-2xl p-6'>
                  <div className='grid md:grid-cols-2 gap-6'>
                    {/* Image */}
                    <div className='flex justify-center'>
                      <div className='relative group'>
                        <Image
                          src={filePreviewUrl || ''}
                          alt='Vista previa de la imagen PNG'
                          width={400}
                          height={300}
                          className='w-full h-auto rounded-xl max-h-80 object-contain shadow-2xl group-hover:scale-105 transition-transform duration-300'
                        />
                        <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                      </div>
                    </div>

                    {/* Metadata */}
                    {imageMetadata && (
                      <div className='space-y-4'>
                        <h4 className='text-lg font-semibold text-white flex items-center'>
                          <svg
                            className='w-5 h-5 mr-2 text-purple-400'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                            />
                          </svg>
                          Información del archivo
                        </h4>
                        <div className='space-y-3'>
                          <div className='flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10'>
                            <span className='text-gray-300'>Peso:</span>
                            <span className='font-bold text-white text-lg'>
                              {imageMetadata?.size}
                            </span>
                          </div>
                          <div className='flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10'>
                            <span className='text-gray-300'>Dimensiones:</span>
                            <span className='font-medium text-white'>
                              {imageMetadata?.width} × {imageMetadata?.height}px
                            </span>
                          </div>
                          <div className='flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10'>
                            <span className='text-gray-300'>Formato:</span>
                            <span className='font-medium text-purple-300'>
                              PNG
                            </span>
                          </div>
                          {isConverting && !previewConvertedSize && (
                            <div className='flex justify-between items-center p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-400/30'>
                              <span className='text-gray-300'>
                                Estimación de tamaño:
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
                                <span className='text-blue-400 text-sm'>
                                  Analizando imagen...
                                </span>
                              </div>
                            </div>
                          )}
                          {previewConvertedSize && (
                            <div className='space-y-4'>
                              <div className='flex justify-between items-center p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-xl border border-green-400/30'>
                                <span className='text-gray-300 mr-2'>
                                  Tamaño estimado (WebP):
                                </span>
                                <div className='text-right'>
                                  <span className='font-bold text-green-400 text-lg'>
                                    {previewConvertedSize}
                                  </span>
                                  <div className='text-xs text-green-300'>
                                    {(() => {
                                      if (!imageMetadata?.size) return '';
                                      const originalSizeStr =
                                        imageMetadata.size;
                                      const convertedSizeStr =
                                        previewConvertedSize;

                                      const getBytes = (
                                        str: string
                                      ): number => {
                                        const [value, unit] = str.split(' ');
                                        const size = parseFloat(value);
                                        if (unit === 'MB')
                                          return size * 1024 * 1024;
                                        if (unit === 'KB') return size * 1024;
                                        return size;
                                      };

                                      const originalBytes =
                                        getBytes(originalSizeStr);
                                      const convertedBytes =
                                        getBytes(convertedSizeStr);

                                      const percentage =
                                        ((originalBytes - convertedBytes) /
                                          originalBytes) *
                                        100;
                                      const formatted =
                                        percentage >= 10
                                          ? percentage.toFixed(1)
                                          : percentage.toFixed(2);

                                      return `-${formatted}% más pequeño`;
                                    })()}
                                  </div>
                                </div>
                              </div>

                              {/* Convert button */}
                              <button
                                onClick={handleConvert}
                                disabled={isLoading || isConverting}
                                className='w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-lg'
                              >
                                {isLoading ? (
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
                                    Convirtiendo...
                                  </>
                                ) : isConverting ? (
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
                                    Analizando...
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
                                    Convertir a WebP
                                  </>
                                )}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className='bg-red-500/20 border border-red-400/50 rounded-2xl p-6 backdrop-blur-sm'>
                <div className='flex items-center'>
                  <svg
                    className='w-6 h-6 text-red-400 mr-3'
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
                  <p className='text-red-200 text-lg'>{error}</p>
                </div>
              </div>
            )}

            {/* Conversion result - unified design */}
            {convertedImageUrl && (
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='text-2xl font-semibold text-white flex items-center'>
                    <svg
                      className='w-6 h-6 mr-2 text-green-400'
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
                    Conversión completada
                  </h3>
                </div>

                <div className='bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-400/30 rounded-2xl p-6'>
                  <div className='grid md:grid-cols-2 gap-6'>
                    {/* WebP Image */}
                    <div className='flex justify-center'>
                      <div className='relative group'>
                        <Image
                          src={convertedImageUrl || ''}
                          alt='Imagen convertida a WebP'
                          width={400}
                          height={300}
                          className='w-full h-auto rounded-xl max-h-80 object-contain shadow-2xl group-hover:scale-105 transition-transform duration-300'
                        />
                        <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300'></div>
                      </div>
                    </div>

                    {/* Conversion Stats */}
                    <div className='space-y-4'>
                      <h4 className='text-lg font-semibold text-white flex items-center'>
                        <svg
                          className='w-5 h-5 mr-2 text-green-400'
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                          />
                        </svg>
                        Resultado de la conversión
                      </h4>

                      <div className='space-y-3'>
                        <div className='flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10'>
                          <span className='text-gray-300'>
                            Archivo original:
                          </span>
                          <span className='font-bold text-white text-lg'>
                            {imageMetadata?.size}
                          </span>
                        </div>
                        <div className='flex justify-between items-center p-3 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl border border-green-400/30'>
                          <span className='text-gray-300'>Archivo WebP:</span>
                          <span className='font-bold text-green-400 text-lg'>
                            {convertedImageSize}
                          </span>
                        </div>
                        <div className='flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/10'>
                          <span className='text-gray-300'>Reducción:</span>
                          <span className='font-bold text-green-400 text-lg'>
                            {(() => {
                              if (!imageMetadata?.size || !convertedImageSize)
                                return '';
                              const originalSizeStr = imageMetadata.size;
                              const convertedSizeStr = convertedImageSize;

                              const getBytes = (str: string): number => {
                                const [value, unit] = str.split(' ');
                                const size = parseFloat(value);
                                if (unit === 'MB') return size * 1024 * 1024;
                                if (unit === 'KB') return size * 1024;
                                return size;
                              };

                              const originalBytes = getBytes(originalSizeStr);
                              const convertedBytes = getBytes(convertedSizeStr);

                              const percentage =
                                ((originalBytes - convertedBytes) /
                                  originalBytes) *
                                100;
                              const formatted =
                                percentage >= 10
                                  ? percentage.toFixed(1)
                                  : percentage.toFixed(2);

                              return `-${formatted}%`;
                            })()}
                          </span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className='flex flex-col gap-3 pt-4'>
                        <button
                          onClick={handleDownload}
                          className='w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg'
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
                          Descargar WebP
                        </button>

                        <button
                          onClick={handleRemoveImage}
                          className='w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg'
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
                              d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                            />
                          </svg>
                          Convertir otra imagen
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
