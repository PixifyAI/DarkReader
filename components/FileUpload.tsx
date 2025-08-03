

import React, { useState, useCallback } from 'react';
import { UploadIcon } from './Icons';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, isLoading, error }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  }, [onFileUpload]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen bg-zinc-900 p-8">
      <div className="w-full max-w-2xl text-center">
        <h2 className="text-4xl font-bold bg-gradient-to-b from-zinc-900 to-zinc-950 bg-clip-text text-transparent select-none mb-1">
          WesRoth
        </h2>
        <h1 className="text-5xl font-bold mb-2 bg-gradient-to-br from-indigo-500 via-purple-600 to-blue-700 bg-clip-text text-transparent">DarkReader</h1>
        <p className="text-lg text-zinc-400 mb-8">Your advanced presenter-focused document reader.</p>
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg transition-colors duration-300 ${isDragging ? 'border-indigo-400 bg-zinc-700' : 'border-zinc-600 hover:border-zinc-500'}`}
        >
          <input type="file" id="file-upload" className="sr-only" onChange={handleChange} accept=".pdf,.docx,.txt,.pptx,.xlsx,.epub" disabled={isLoading} />
          {isLoading ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin mb-4"></div>
              <p className="text-lg text-zinc-300">Processing your document...</p>
            </div>
          ) : (
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
              <UploadIcon className="w-12 h-12 text-zinc-400 mb-4" />
              <p className="text-lg text-zinc-300">
                <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
              </p>
              <p className="text-sm text-zinc-500">PDF, DOCX, TXT, PPTX, XLSX, EPUB</p>
            </label>
          )}
        </div>
        {error && (
            <div className="mt-4 p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">
                <strong>Error:</strong> {error}
            </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;