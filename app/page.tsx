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
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.includes('png')) {
      setFile(selectedFile);
      setError(null);
      setConvertedImageUrl(null);

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
      };
      img.src = url;
    } else {
      setError('Por favor selecciona un archivo PNG válido');
      setFile(null);
      setFilePreviewUrl(null);
      setImageMetadata(null);
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
      // NO limpiar imageMetadata para mantener la comparación de tamaños
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

      <div className='relative z-10 min-h-screen flex items-center justify-center py-12 px-4'>
        <div className='w-full max-w-4xl mx-auto'>
          {/* Header */}
          <div className='text-center mb-12'>
            <div className='inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mb-6 shadow-2xl'>
              <svg
                className='w-10 h-10 text-white'
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
            <h1 className='text-5xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-4'>
              PNG a WebP
            </h1>
            <p className='text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed'>
              Convierte tus imágenes PNG a formato WebP con compresión
              inteligente y máxima calidad
            </p>
          </div>

          {/* Main container */}
          <div className='backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl p-8 space-y-8'>
            {/* File upload area */}
            {!file && !convertedImageUrl ? (
              <div className='text-center'>
                <div className='border-2 border-dashed border-purple-400/50 rounded-2xl p-12 hover:border-purple-400/70 transition-all duration-300 group'>
                  <div className='w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300'>
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
                  </div>
                  <h3 className='text-2xl font-semibold text-white mb-2'>
                    Sube tu imagen PNG
                  </h3>
                  <p className='text-gray-300 mb-6'>
                    Arrastra y suelta o haz clic para seleccionar
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
            ) : file && !convertedImageUrl ? (
              <div className='bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-400/30 rounded-2xl p-6'>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-4'>
                    <div className='w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center'>
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
                      <p className='text-lg font-semibold text-white'>
                        {file?.name}
                      </p>
                      <p className='text-purple-300 text-sm'>
                        Archivo PNG listo para convertir
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRemoveImage}
                    className='p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded-xl transition-all duration-300'
                    title='Eliminar imagen'
                  >
                    <svg
                      className='w-6 h-6'
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
              </div>
            ) : null}

            {/* Image preview */}
            {filePreviewUrl && (
              <div className='space-y-4'>
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
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Convert button */}
            {!convertedImageUrl && file && (
              <div className='text-center'>
                <button
                  onClick={handleConvert}
                  disabled={isLoading}
                  className='inline-flex items-center px-12 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold text-lg rounded-2xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed shadow-2xl'
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
                  ) : (
                    <>
                      <svg
                        className='w-6 h-6 mr-2'
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

            {/* Conversion result */}
            {convertedImageUrl && (
              <div className='space-y-8'>
                <div className='text-center'>
                  <div className='inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl mb-4 shadow-2xl'>
                    <svg
                      className='w-8 h-8 text-white'
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
                  </div>
                  <h3 className='text-3xl font-bold text-white mb-2'>
                    ¡Conversión completada!
                  </h3>
                  <p className='text-gray-300 text-lg'>
                    Tu imagen se ha convertido exitosamente a WebP
                  </p>
                </div>

                {/* Size comparison */}
                {imageMetadata && convertedImageSize && (
                  <div className='bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-400/30 rounded-2xl p-8'>
                    <h4 className='text-2xl font-semibold text-white mb-6 text-center flex items-center justify-center'>
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
                          d='M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
                        />
                      </svg>
                      Reducción de tamaño
                    </h4>

                    <div className='grid md:grid-cols-3 gap-6 items-center'>
                      {/* Original file */}
                      <div className='text-center p-6 bg-white/5 rounded-2xl border border-white/10'>
                        <div className='text-4xl font-bold text-gray-300 mb-2'>
                          {imageMetadata?.size}
                        </div>
                        <div className='text-gray-400'>Archivo original</div>
                      </div>

                      {/* Arrow */}
                      <div className='flex justify-center'>
                        <div className='w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center'>
                          <svg
                            className='w-8 h-8 text-white'
                            fill='none'
                            stroke='currentColor'
                            viewBox='0 0 24 24'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M17 8l4 4m0 0l-4 4m4-4H3'
                            />
                          </svg>
                        </div>
                      </div>

                      {/* Converted file */}
                      <div className='text-center p-6 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl border border-green-400/30'>
                        <div className='text-4xl font-bold text-green-400 mb-2'>
                          {convertedImageSize}
                        </div>
                        <div className='text-green-300'>Archivo WebP</div>
                      </div>
                    </div>

                    {/* Savings stats */}
                    <div className='grid md:grid-cols-2 gap-6 mt-8'>
                      <div className='text-center p-6 bg-white/5 rounded-2xl border border-white/10'>
                        <div className='text-3xl font-bold text-green-400 mb-2'>
                          {(() => {
                            const originalSizeStr = imageMetadata?.size || '';
                            const convertedSizeStr = convertedImageSize || '';

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
                        </div>
                        <div className='text-gray-400'>Reducción</div>
                      </div>

                      <div className='text-center p-6 bg-white/5 rounded-2xl border border-white/10'>
                        <div className='text-3xl font-bold text-green-400 mb-2'>
                          {(() => {
                            const originalSizeStr = imageMetadata?.size || '';
                            const convertedSizeStr = convertedImageSize || '';

                            const getBytes = (str: string): number => {
                              const [value, unit] = str.split(' ');
                              const size = parseFloat(value);
                              if (unit === 'MB') return size * 1024 * 1024;
                              if (unit === 'KB') return size * 1024;
                              return size;
                            };

                            const bytesToReadable = (bytes: number): string => {
                              const kb = bytes / 1024;
                              if (kb > 1024)
                                return `${(kb / 1024).toFixed(2)} MB`;
                              return `${kb.toFixed(1)} KB`;
                            };

                            const savedBytes =
                              getBytes(originalSizeStr) -
                              getBytes(convertedSizeStr);
                            return `-${bytesToReadable(savedBytes)}`;
                          })()}
                        </div>
                        <div className='text-gray-400'>Ahorrado</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* WebP preview */}
                <div className='bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-400/30 rounded-2xl p-6'>
                  <h4 className='text-xl font-semibold text-white mb-4 flex items-center'>
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
                        d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
                      />
                      <path
                        strokeLinecap='round'
                        strokeLinejoin='round'
                        strokeWidth={2}
                        d='M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z'
                      />
                    </svg>
                    Vista previa (WebP)
                  </h4>
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
                </div>

                {/* Action buttons */}
                <div className='flex flex-col sm:flex-row justify-center gap-4'>
                  <button
                    onClick={handleDownload}
                    className='flex-1 sm:flex-none inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl'
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
                    className='flex-1 sm:flex-none inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-2xl'
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
