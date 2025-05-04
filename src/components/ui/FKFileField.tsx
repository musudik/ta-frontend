import React, { useRef } from 'react';
import { cn } from '../../lib/utils';

interface FileWithPreview extends File {
  preview?: string;
}

interface FKFileFieldProps {
  id: string;
  value: FileWithPreview[] | null;
  onChange: (files: FileWithPreview[]) => void;
  onRemove?: (index: number) => void;
  hasError?: boolean;
  validationError?: string;
  mainLanguage: string;
  selectedLanguage: string;
  className?: string;
  mandatory?: boolean;
  multiple?: boolean;
  accept?: string;
  maxSize?: number; // in MB
  maxFiles?: number;
  showPreview?: boolean;
  previewType?: 'list' | 'grid';
}

const FKFileField: React.FC<FKFileFieldProps> = ({
  id,
  value,
  onChange,
  onRemove,
  hasError,
  validationError,
  mainLanguage,
  selectedLanguage,
  className,
  mandatory = false,
  multiple = false,
  accept,
  maxSize = 10, // Default max size 10MB
  maxFiles = 5, // Default max files
  showPreview = true,
  previewType = 'list'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    // Validate number of files
    if (multiple && files.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate file sizes and create previews
    const validFiles = files.filter(file => {
      if (file.size > maxSize * 1024 * 1024) {
        alert(`File ${file.name} exceeds maximum size of ${maxSize}MB`);
        return false;
      }
      return true;
    }).map(file => {
      const fileWithPreview = file as FileWithPreview;
      if (file.type.startsWith('image/')) {
        fileWithPreview.preview = URL.createObjectURL(file);
      }
      return fileWithPreview;
    });

    // Update value
    onChange(multiple ? [...(value || []), ...validFiles] : validFiles);
  };

  const handleRemoveFile = (index: number) => {
    if (!value) return;
    
    // Revoke object URL if it exists
    if (value[index].preview) {
      URL.revokeObjectURL(value[index].preview!);
    }
    
    // Remove file
    const newFiles = value.filter((_, i) => i !== index);
    onChange(newFiles);
    if (onRemove) onRemove(index);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();

    const droppedFiles = Array.from(event.dataTransfer.files);
    const validFiles = droppedFiles.filter(file => {
      if (accept) {
        const acceptedTypes = accept.split(',').map(type => type.trim());
        return acceptedTypes.some(type => {
          if (type.startsWith('.')) {
            return file.name.toLowerCase().endsWith(type.toLowerCase());
          }
          return file.type.match(new RegExp(type.replace('*', '.*')));
        });
      }
      return true;
    });

    if (validFiles.length) {
      const changeEvent = {
        target: {
          files: validFiles as unknown as FileList
        }
      } as React.ChangeEvent<HTMLInputElement>;
      handleFileChange(changeEvent);
    }
  };

  return (
    <div className={cn('space-y-2', className)}>
      {/* Label Section */}
      <div className="mb-1">
        <label htmlFor={id} className="block font-medium text-sm text-neutral-900">
          {mainLanguage}
          {mandatory && <span className="text-red-500 ml-1">*</span>}
        </label>
        {selectedLanguage && (
          <label htmlFor={id} className="block text-neutral-500 text-sm">
            {selectedLanguage}
          </label>
        )}
      </div>

      {/* File Input Section */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors',
          hasError ? 'border-red-500' : 'border-gray-300'
        )}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          id={id}
          className="hidden"
          onChange={handleFileChange}
          multiple={multiple}
          accept={accept}
        />
        <div className="space-y-2">
          <div className="text-neutral-600">
            {multiple ? (
              <>
                <span className="text-blue-600">Click to upload</span> {/* or drag and drop multiple files
                <p className="text-sm text-neutral-500">
                  Up to {maxFiles} files (max. {maxSize}MB each)
                </p> */}
              </>
            ) : (
              <>
                <span className="text-blue-600">Click to upload</span> or drag and drop
                <p className="text-sm text-neutral-500">
                  Max file size: {maxSize}MB
                </p>
              </>
            )}
          </div>
          {/*  {accept && (
            <p className="text-sm text-neutral-500">
              Accepted formats: {accept.split(',').join(', ')}
            </p>
          )} */}
        </div>
      </div>

      {/* Validation Error */}
      {hasError && validationError && (
        <p className="text-red-500 text-xs mt-1">{validationError}</p>
      )}

      {/* File Preview Section */}
      {showPreview && value && value.length > 0 && (
        <div className={cn(
          'mt-4',
          previewType === 'grid' ? 'grid grid-cols-2 md:grid-cols-4 gap-4' : 'space-y-2'
        )}>
          {value.map((file, index) => (
            <div
              key={index}
              className={cn(
                'relative group border rounded-lg overflow-hidden',
                previewType === 'list' ? 'p-2 flex items-center' : 'p-1'
              )}
            >
              {file && file.type && file.type.startsWith('image/') && file.preview ? (
                <img
                  src={file.preview}
                  alt={file.name}
                  className={cn(
                    'object-cover',
                    previewType === 'grid' ? 'w-full h-24' : 'w-12 h-12'
                  )}
                />
              ) : (
                <div className={cn(
                  'flex items-center justify-center bg-gray-100',
                  previewType === 'grid' ? 'w-full h-24' : 'w-12 h-12'
                )}>
                  <span className="text-2xl">📄</span>
                </div>
              )}
              <div className={cn(
                'flex-1 min-w-0',
                previewType === 'list' ? 'ml-3' : 'mt-2'
              )}>
                <p className="text-sm truncate">{file?.name || 'Unknown file'}</p>
                <p className="text-xs text-gray-500">
                  {file ? (file.size / 1024 / 1024).toFixed(2) : '0'} MB
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFile(index);
                }}
                className={cn(
                  'absolute text-red-500 hover:text-red-700 p-1',
                  previewType === 'grid' ? 'top-1 right-1' : 'right-2'
                )}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FKFileField; 