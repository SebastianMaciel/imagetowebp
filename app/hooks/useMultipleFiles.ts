'use client';

import { useCallback, useState } from 'react';

interface FileWithMetadata {
  file: File;
  id: string;
  previewUrl: string | null;
  metadata: {
    width: number;
    height: number;
    size: string;
  } | null;
  estimatedWebPSize: string | null;
  isAnalyzing: boolean;
  isConverting: boolean;
  convertedUrl: string | null;
  convertedSize: string | null;
  error: string | null;
}

const MAX_FILES = 10;

export function useMultipleFiles() {
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [isConvertingAll, setIsConvertingAll] = useState(false);

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const validFiles = newFiles.filter((file) => {
        const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        return validImageTypes.includes(file.type);
      });

      if (files.length + validFiles.length > MAX_FILES) {
        // Calcular cuántos archivos podemos agregar
        const availableSlots = MAX_FILES - files.length;
        const filesToAdd = validFiles.slice(0, availableSlots);
        const excessCount = validFiles.length - availableSlots;

        const filesWithMetadata: FileWithMetadata[] = filesToAdd.map(
          (file) => ({
            file,
            id: Math.random().toString(36).substr(2, 9),
            previewUrl: URL.createObjectURL(file),
            metadata: null,
            estimatedWebPSize: null,
            isAnalyzing: false,
            isConverting: false,
            convertedUrl: null,
            convertedSize: null,
            error: null,
          })
        );

        setFiles((prev) => [...prev, ...filesWithMetadata]);

        // Procesar metadata y estimación de tamaño para cada archivo
        filesWithMetadata.forEach((fileWithMeta) => {
          processFileMetadata(fileWithMeta);
        });

        const message = `You selected ${validFiles.length} images, but we can only convert up to ${MAX_FILES} at a time. The first ${filesToAdd.length} images were added.`;
        return {
          success: false,
          message,
          excess: excessCount,
          added: filesToAdd.length,
        };
      }

      const filesWithMetadata: FileWithMetadata[] = validFiles.map((file) => ({
        file,
        id: Math.random().toString(36).substr(2, 9),
        previewUrl: URL.createObjectURL(file),
        metadata: null,
        estimatedWebPSize: null,
        isAnalyzing: false,
        isConverting: false,
        convertedUrl: null,
        convertedSize: null,
        error: null,
      }));

      setFiles((prev) => [...prev, ...filesWithMetadata]);

      // Procesar metadata y estimación de tamaño para cada archivo
      filesWithMetadata.forEach((fileWithMeta) => {
        processFileMetadata(fileWithMeta);
      });

      return {
        success: true,
        message: `${validFiles.length} file${
          validFiles.length === 1 ? '' : 's'
        } added`,
      };
    },
    [files.length]
  );

  const processFileMetadata = useCallback((fileWithMeta: FileWithMetadata) => {
    const img = document.createElement('img');
    img.onload = () => {
      const sizeInKB = (fileWithMeta.file.size / 1024).toFixed(1);
      const sizeInMB = (fileWithMeta.file.size / (1024 * 1024)).toFixed(2);
      const size =
        fileWithMeta.file.size > 1024 * 1024
          ? `${sizeInMB} MB`
          : `${sizeInKB} KB`;

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileWithMeta.id
            ? { ...f, metadata: { width: img.width, height: img.height, size } }
            : f
        )
      );

      // Iniciar análisis de tamaño estimado
      estimateWebPSize(fileWithMeta.id, fileWithMeta.file);
    };
    img.src = fileWithMeta.previewUrl || ''; // Ensure src is not null
  }, []);

  const estimateWebPSize = useCallback(async (fileId: string, file: File) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, isAnalyzing: true } : f))
    );

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error analyzing image');
      }

      const blob = await response.blob();
      const sizeInKB = (blob.size / 1024).toFixed(1);
      const sizeInMB = (blob.size / (1024 * 1024)).toFixed(2);
      const convertedSize =
        blob.size > 1024 * 1024 ? `${sizeInMB} MB` : `${sizeInKB} KB`;

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, estimatedWebPSize: convertedSize, isAnalyzing: false }
            : f
        )
      );

      // Limpiar el blob
      URL.revokeObjectURL(URL.createObjectURL(blob));
    } catch (error) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, error: 'Error analyzing image', isAnalyzing: false }
            : f
        )
      );
    }
  }, []);

  const convertFile = useCallback(
    async (fileId: string) => {
      const fileWithMeta = files.find((f) => f.id === fileId);
      if (!fileWithMeta) return;

      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId ? { ...f, isConverting: true, error: null } : f
        )
      );

      try {
        const formData = new FormData();
        formData.append('image', fileWithMeta.file);

        const response = await fetch('/api/convert', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Error converting image');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        const sizeInKB = (blob.size / 1024).toFixed(1);
        const sizeInMB = (blob.size / (1024 * 1024)).toFixed(2);
        const convertedSize =
          blob.size > 1024 * 1024 ? `${sizeInMB} MB` : `${sizeInKB} KB`;

        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  convertedUrl: url,
                  convertedSize,
                  isConverting: false,
                  previewUrl: null, // Ocultar preview original
                }
              : f
          )
        );
      } catch (error) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === fileId
              ? {
                  ...f,
                  error:
                    error instanceof Error
                      ? error.message
                      : 'Error desconocido',
                  isConverting: false,
                }
              : f
          )
        );
      }
    },
    [files]
  );

  const convertAllFiles = useCallback(async () => {
    setIsConvertingAll(true);

    const filesToConvert = files.filter((f) => !f.convertedUrl && !f.error);

    for (const fileWithMeta of filesToConvert) {
      await convertFile(fileWithMeta.id);
    }

    setIsConvertingAll(false);
  }, [files, convertFile]);

  const removeFile = useCallback((fileId: string) => {
    setFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === fileId);
      if (fileToRemove) {
        // Limpiar URLs
        if (fileToRemove.previewUrl) {
          URL.revokeObjectURL(fileToRemove.previewUrl);
        }
        if (fileToRemove.convertedUrl) {
          URL.revokeObjectURL(fileToRemove.convertedUrl);
        }
      }
      return prev.filter((f) => f.id !== fileId);
    });
  }, []);

  const clearAllFiles = useCallback(() => {
    files.forEach((fileWithMeta) => {
      if (fileWithMeta.previewUrl) {
        URL.revokeObjectURL(fileWithMeta.previewUrl);
      }
      if (fileWithMeta.convertedUrl) {
        URL.revokeObjectURL(fileWithMeta.convertedUrl);
      }
    });
    setFiles([]);
  }, [files]);

  const downloadFile = useCallback(
    (fileId: string) => {
      const fileWithMeta = files.find((f) => f.id === fileId);
      if (fileWithMeta?.convertedUrl) {
        const link = document.createElement('a');
        link.href = fileWithMeta.convertedUrl;
        // Remove any image extension and add .webp
        const baseName = fileWithMeta.file.name.replace(
          /\.(png|jpg|jpeg)$/i,
          ''
        );
        link.download = `${baseName}.webp`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    },
    [files]
  );

  const downloadAll = useCallback(() => {
    const convertedFiles = files.filter((f) => f.convertedUrl);
    convertedFiles.forEach((fileWithMeta) => {
      const link = document.createElement('a');
      link.href = fileWithMeta.convertedUrl!;
      // Remove any image extension and add .webp
      const baseName = fileWithMeta.file.name.replace(/\.(png|jpg|jpeg)$/i, '');
      link.download = `${baseName}.webp`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  }, [files]);

  return {
    files,
    addFiles,
    convertFile,
    convertAllFiles,
    removeFile,
    clearAllFiles,
    downloadFile,
    downloadAll,
    isConvertingAll,
    canConvertAll: files.some(
      (f) => !f.convertedUrl && !f.error && !f.isAnalyzing
    ),
    allConverted:
      files.length > 0 && files.every((f) => f.convertedUrl || f.error),
    hasErrors: files.some((f) => f.error),
  };
}
