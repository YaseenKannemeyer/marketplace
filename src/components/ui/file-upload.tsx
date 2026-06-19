'use client';

import * as React from 'react';
import { useDropzone, type DropzoneOptions } from 'react-dropzone';
import { cn } from '@/lib/utils';

interface FileUploaderContextValue {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  dropzoneOptions?: DropzoneOptions;
  orientation?: 'horizontal' | 'vertical';
}

const FileUploaderContext = React.createContext<FileUploaderContextValue | null>(null);

function useFileUploader() {
  const ctx = React.useContext(FileUploaderContext);
  if (!ctx) throw new Error('useFileUploader must be used within a <FileUploader>');
  return ctx;
}

interface FileUploaderProps {
  value: File[];
  onValueChange: (files: File[]) => void;
  dropzoneOptions?: DropzoneOptions;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  children?: React.ReactNode;
}

function FileUploader({
  value: files,
  onValueChange,
  dropzoneOptions,
  orientation = 'vertical',
  className,
  children,
}: FileUploaderProps) {
  const setFiles = React.useCallback(
    (updater: React.SetStateAction<File[]>) => {
      const newFiles = typeof updater === 'function' ? updater(files) : updater;
      onValueChange(newFiles);
    },
    [files, onValueChange],
  );

  const contextValue = React.useMemo<FileUploaderContextValue>(
    () => ({ files, setFiles, dropzoneOptions, orientation }),
    [files, setFiles, dropzoneOptions, orientation],
  );

  return (
    <FileUploaderContext.Provider value={contextValue}>
      <div className={cn('w-full', className)}>{children}</div>
    </FileUploaderContext.Provider>
  );
}

function FileInput({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { dropzoneOptions, setFiles } = useFileUploader();
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    ...dropzoneOptions,
    onDrop: (accepted, rejected, event) => {
      if (dropzoneOptions?.onDrop) {
        dropzoneOptions.onDrop(accepted, rejected, event);
      }
      setFiles((prev) => {
        const existing = new Set(prev.map((f) => `${f.name}-${f.lastModified}-${f.size}`));
        const unique = accepted.filter(
          (f) => !existing.has(`${f.name}-${f.lastModified}-${f.size}`),
        );
        return [...prev, ...unique].slice(0, dropzoneOptions?.maxFiles || 10);
      });
    },
  });

  return (
    <div
      {...getRootProps({ ...props })}
      className={cn(
        'relative flex flex-col items-center justify-center cursor-pointer rounded-lg transition-colors',
        isDragActive && 'bg-primary/10 border-primary',
        className,
      )}
    >
      <input {...getInputProps()} />
      {children}
    </div>
  );
}

function FileUploaderContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const { orientation } = useFileUploader();

  return (
    <div
      className={cn(
        'flex gap-2 mt-3',
        orientation === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

interface FileUploaderItemProps extends React.HTMLAttributes<HTMLDivElement> {
  index: number;
  children?: React.ReactNode;
}

function FileUploaderItem({ index, className, children, ...props }: FileUploaderItemProps) {
  const { files, setFiles } = useFileUploader();
  const file = files[index];
  if (!file) return null;

  const previewUrl = React.useMemo(() => URL.createObjectURL(file), [file]);

  React.useEffect(() => {
    return () => URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  return (
    <div className={cn('relative group/file-item', className)} {...props}>
      {children || (
        file.type.startsWith('image/') ? (
          <img
            src={previewUrl}
            alt={file.name}
            className="w-20 h-20 rounded-md object-cover border"
          />
        ) : (
          <div className="w-20 h-20 rounded-md border flex items-center justify-center bg-muted">
            <span className="text-xs text-muted-foreground truncate px-1">{file.name}</span>
          </div>
        )
      )}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setFiles((prev) => prev.filter((_, i) => i !== index));
        }}
        className="absolute -top-2 -right-2 z-10 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover/file-item:opacity-100 transition-opacity shadow-sm hover:bg-red-600"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export {
  FileUploader,
  FileInput,
  FileUploaderContent,
  FileUploaderItem,
  useFileUploader,
};
