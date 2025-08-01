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
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB
const MIN_FILE_SIZE = 1024; // 1 KB
const MAX_TOTAL_SIZE = 100 * 1024 * 1024; // 100 MB

// Client-side image compression function
const compressImage = (
  file: File,
  maxWidth = 1920,
  quality = 0.8
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      // Calculate new dimensions while maintaining aspect ratio
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and compress the image
      ctx?.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          } else {
            reject(new Error('Failed to compress image'));
          }
        },
        file.type,
        quality
      );
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
};

export function useMultipleFiles() {
  const [files, setFiles] = useState<FileWithMetadata[]>([]);
  const [isConvertingAll, setIsConvertingAll] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);

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

      // Clean up the blob
      URL.revokeObjectURL(URL.createObjectURL(blob));
    } catch {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? { ...f, error: 'Error analyzing image', isAnalyzing: false }
            : f
        )
      );
    }
  }, []);

  const processFileMetadata = useCallback(
    (fileWithMeta: FileWithMetadata) => {
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
              ? {
                  ...f,
                  metadata: { width: img.width, height: img.height, size },
                }
              : f
          )
        );

        // Start estimated size analysis
        estimateWebPSize(fileWithMeta.id, fileWithMeta.file);
      };
      img.src = fileWithMeta.previewUrl || ''; // Ensure src is not null
    },
    [estimateWebPSize]
  );

  const addFiles = useCallback(
    async (newFiles: File[]) => {
      setIsProcessingFiles(true);
      try {
        // Filter valid image types and check file sizes
        const validFiles = newFiles.filter((file) => {
          const validImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];
          const isValidType = validImageTypes.includes(file.type);
          const isValidSize = file.size >= MIN_FILE_SIZE;

          if (!isValidType) {
            console.warn(`Skipping ${file.name}: Invalid file type`);
          }
          if (!isValidSize) {
            console.warn(
              `Skipping ${file.name}: File size ${(
                file.size /
                1024 /
                1024
              ).toFixed(2)}MB is too small`
            );
          }

          return isValidType && isValidSize;
        });

        // Compress large files before processing
        const processedFiles: File[] = [];
        for (const file of validFiles) {
          try {
            if (file.size > 5 * 1024 * 1024) {
              // Compress files larger than 5MB
              console.log(
                `Compressing ${file.name} (${(file.size / 1024 / 1024).toFixed(
                  2
                )}MB)`
              );
              const compressedFile = await compressImage(file);
              processedFiles.push(compressedFile);
            } else {
              processedFiles.push(file);
            }
          } catch (error) {
            console.warn(
              `Failed to compress ${file.name}, using original:`,
              error
            );
            processedFiles.push(file);
          }
        }

        // Filter files that are still too large after compression
        const finalFiles = processedFiles.filter((file) => {
          const isValidSize = file.size <= MAX_FILE_SIZE;
          if (!isValidSize) {
            console.warn(
              `Skipping ${file.name}: File size ${(
                file.size /
                1024 /
                1024
              ).toFixed(2)}MB is still too large after compression`
            );
          }
          return isValidSize;
        });

        // Check total size limit
        const currentTotalSize = files.reduce((sum, f) => sum + f.file.size, 0);
        const newFilesTotalSize = finalFiles.reduce(
          (sum, f) => sum + f.size,
          0
        );

        if (currentTotalSize + newFilesTotalSize > MAX_TOTAL_SIZE) {
          const availableSize = MAX_TOTAL_SIZE - currentTotalSize;
          const filesToAdd = [];
          let accumulatedSize = 0;

          for (const file of finalFiles) {
            if (accumulatedSize + file.size <= availableSize) {
              filesToAdd.push(file);
              accumulatedSize += file.size;
            } else {
              break;
            }
          }

          const excessCount = finalFiles.length - filesToAdd.length;

          if (filesToAdd.length === 0) {
            return {
              success: false,
              message: `Total file size would exceed ${(
                MAX_TOTAL_SIZE /
                1024 /
                1024
              ).toFixed(0)}MB limit. Please remove some files first.`,
              excess: validFiles.length,
              added: 0,
            };
          }

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

          // Process metadata and size estimation for each file
          filesWithMetadata.forEach((fileWithMeta) => {
            processFileMetadata(fileWithMeta);
          });

          const message = `Added ${filesToAdd.length} files. ${excessCount} files were skipped due to size limits.`;
          return {
            success: false,
            message,
            excess: excessCount,
            added: filesToAdd.length,
          };
        }

        if (files.length + finalFiles.length > MAX_FILES) {
          // Calculate how many files we can add
          const availableSlots = MAX_FILES - files.length;
          const filesToAdd = finalFiles.slice(0, availableSlots);
          const excessCount = finalFiles.length - availableSlots;

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

          // Process metadata and size estimation for each file
          filesWithMetadata.forEach((fileWithMeta) => {
            processFileMetadata(fileWithMeta);
          });

          const message = `You selected ${finalFiles.length} images, but we can only convert up to ${MAX_FILES} at a time. The first ${filesToAdd.length} images were added.`;
          return {
            success: false,
            message,
            excess: excessCount,
            added: filesToAdd.length,
          };
        }

        const filesWithMetadata: FileWithMetadata[] = finalFiles.map(
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

        // Process metadata and size estimation for each file
        filesWithMetadata.forEach((fileWithMeta) => {
          processFileMetadata(fileWithMeta);
        });

        return {
          success: true,
          message: `${finalFiles.length} file${
            finalFiles.length === 1 ? '' : 's'
          } added`,
        };
      } finally {
        setIsProcessingFiles(false);
      }
    },
    [files, processFileMetadata]
  );

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
                    error instanceof Error ? error.message : 'Unknown error',
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
        // Clean up URLs
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
    isProcessingFiles,
    canConvertAll: files.some(
      (f) => !f.convertedUrl && !f.error && !f.isAnalyzing
    ),
    allConverted:
      files.length > 0 && files.every((f) => f.convertedUrl || f.error),
    hasErrors: files.some((f) => f.error),
  };
}
