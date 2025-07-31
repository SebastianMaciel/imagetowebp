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
    <div className='min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4'>
      <div className='max-w-xl mx-auto'>
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 dark:text-white mb-2'>
            Convertí PNG a WebP
          </h1>
          <p className='text-gray-600 dark:text-gray-400'>
            Subí tu imagen PNG y convertila a formato WebP con un solo clic
          </p>
        </div>

        <div className='bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 space-y-6'>
          {/* Input para subir archivo */}
          {!file && !convertedImageUrl ? (
            <div>
              <label className='block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2'>
                Seleccionar archivo PNG
              </label>
              <input
                type='file'
                accept='.png,image/png'
                onChange={handleFileChange}
                className='block w-full text-sm text-gray-500 dark:text-gray-400
                   file:mr-4 file:py-2 file:px-4
                   file:rounded-full file:border-0
                   file:text-sm file:font-semibold
                   file:bg-blue-50 file:text-blue-700
                   dark:file:bg-blue-900 dark:file:text-blue-300
                   hover:file:bg-blue-100 dark:hover:file:bg-blue-800
                   file:cursor-pointer
                   border border-gray-300 dark:border-gray-600 rounded-lg
                   bg-white dark:bg-gray-700'
              />
            </div>
          ) : file && !convertedImageUrl ? (
            <div className='flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600'>
              <div className='flex items-center space-x-3'>
                <div className='w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center'>
                  <svg
                    className='w-5 h-5 text-blue-600 dark:text-blue-300'
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
                  <p className='text-sm font-medium text-gray-900 dark:text-white'>
                    {file.name}
                  </p>
                  <p className='text-xs text-gray-500 dark:text-gray-400'>
                    Archivo PNG seleccionado
                  </p>
                </div>
              </div>
              <button
                onClick={handleRemoveImage}
                className='text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors'
                title='Eliminar imagen'
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
          ) : null}

          {/* Preview de la imagen */}
          {filePreviewUrl && (
            <div className='space-y-3'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                Vista previa
              </h3>
              <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700'>
                <div className='flex flex-col md:flex-row gap-4'>
                  {/* Imagen */}
                  <div className='flex-1'>
                    <Image
                      src={filePreviewUrl}
                      alt='Vista previa de la imagen PNG'
                      width={400}
                      height={300}
                      className='w-full h-auto rounded-lg max-h-64 object-contain'
                    />
                  </div>

                  {/* Metadata */}
                  {imageMetadata && (
                    <div className='flex-1 space-y-2'>
                      <h4 className='font-semibold text-gray-900 dark:text-white text-sm'>
                        Información del archivo
                      </h4>
                      <div className='space-y-1 text-sm'>
                        <div className='flex justify-between'>
                          <span className='text-gray-600 dark:text-gray-400'>
                            Peso:
                          </span>
                          <span className='font-bold text-gray-900 dark:text-white'>
                            {imageMetadata.size}
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-600 dark:text-gray-400'>
                            Ancho:
                          </span>
                          <span className='font-medium text-gray-900 dark:text-white'>
                            {imageMetadata.width}px
                          </span>
                        </div>
                        <div className='flex justify-between'>
                          <span className='text-gray-600 dark:text-gray-400'>
                            Alto:
                          </span>
                          <span className='font-medium text-gray-900 dark:text-white'>
                            {imageMetadata.height}px
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Botón convertir */}
          {!convertedImageUrl && file && (
            <button
              onClick={handleConvert}
              disabled={isLoading}
              className='w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400
                        text-white font-semibold py-3 px-4 rounded-lg transition-colors
                        disabled:cursor-not-allowed'
            >
              {isLoading ? 'Convirtiendo...' : 'Convertir a WebP'}
            </button>
          )}

          {/* Mensaje de error */}
          {error && (
            <div className='bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4'>
              <p className='text-red-800 dark:text-red-200 text-sm'>{error}</p>
            </div>
          )}

          {/* Resultado */}
          {convertedImageUrl && (
            <div className='space-y-4'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>
                ¡Conversión completada!
              </h3>

              {/* Comparación de tamaños */}
              {imageMetadata && convertedImageSize && (
                <div className='bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6'>
                  <h4 className='text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4 text-center'>
                    Reducción de tamaño
                  </h4>
                  <div className='flex items-center justify-center space-x-6'>
                    {/* Archivo original */}
                    <div className='text-center'>
                      <div className='text-3xl font-bold text-gray-700 dark:text-gray-300'>
                        {imageMetadata.size}
                      </div>
                      <div className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                        Archivo original
                      </div>
                    </div>

                    {/* Flecha */}
                    <svg
                      className='w-8 h-8 text-blue-600 dark:text-blue-400'
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

                    {/* Archivo convertido */}
                    <div className='text-center'>
                      <div className='text-3xl font-bold text-green-600 dark:text-green-400'>
                        {convertedImageSize}
                      </div>
                      <div className='text-sm text-gray-500 dark:text-gray-400 mt-1'>
                        Archivo WebP
                      </div>
                    </div>
                  </div>

                  {/* Porcentaje reducido */}
                  <div className='text-center flex flex-col items-center mt-4'>
                    <div className='text-lg font-semibold text-green-600 dark:text-green-400'>
                      {(() => {
                        const originalSizeStr = imageMetadata.size; // ej: "1.56 MB"
                        const convertedSizeStr = convertedImageSize; // ej: "84.9 KB"

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
                          ((originalBytes - convertedBytes) / originalBytes) *
                          100;
                        const formatted =
                          percentage >= 10
                            ? percentage.toFixed(1)
                            : percentage.toFixed(2);

                        return `-${formatted}%`;
                      })()}
                    </div>
                    <div className='text-xs text-gray-500 dark:text-gray-400'>
                      Reducción
                    </div>
                  </div>

                  {/* Peso reducido */}
                  <div className='text-center'>
                    <div className='text-lg font-semibold text-green-600 dark:text-green-400'>
                      {(() => {
                        const originalSizeStr = imageMetadata.size;
                        const convertedSizeStr = convertedImageSize;

                        const getBytes = (str: string): number => {
                          const [value, unit] = str.split(' ');
                          const size = parseFloat(value);
                          if (unit === 'MB') return size * 1024 * 1024;
                          if (unit === 'KB') return size * 1024;
                          return size;
                        };

                        const bytesToReadable = (bytes: number): string => {
                          const kb = bytes / 1024;
                          if (kb > 1024) return `${(kb / 1024).toFixed(2)} MB`;
                          return `${kb.toFixed(1)} KB`;
                        };

                        const savedBytes =
                          getBytes(originalSizeStr) -
                          getBytes(convertedSizeStr);
                        return `-${bytesToReadable(savedBytes)}`;
                      })()}
                    </div>
                    <div className='text-xs text-gray-500 dark:text-gray-400'>
                      Ahorrado
                    </div>
                  </div>
                </div>
              )}

              {/* Vista previa de la imagen WebP */}
              <div className='border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700'>
                <h4 className='text-sm font-medium text-gray-700 dark:text-gray-300 mb-3'>
                  Vista previa (WebP)
                </h4>
                <div className='flex justify-center'>
                  <Image
                    src={convertedImageUrl}
                    alt='Imagen convertida a WebP'
                    width={400}
                    height={300}
                    className='w-full h-auto rounded-lg max-h-64 object-contain'
                  />
                </div>
              </div>

              {/* Botones de acción */}
              <div className='flex justify-center space-x-4'>
                <button
                  onClick={handleDownload}
                  className='bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2'
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
                      d='M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                    />
                  </svg>
                  <span>Descargar WebP</span>
                </button>

                <button
                  onClick={handleRemoveImage}
                  className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2'
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
                      d='M12 6v6m0 0v6m0-6h6m-6 0H6'
                    />
                  </svg>
                  <span>Convertir otra imagen</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
