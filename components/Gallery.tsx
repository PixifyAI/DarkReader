import React from 'react';
import { GalleryItem } from '../types';
import { TrashIcon, UploadIcon, PdfIcon, DocxIcon, TxtIcon, PptxIcon, XlsxIcon, EpubIcon } from './Icons';

interface GalleryProps {
  items: GalleryItem[];
  onOpenFile: (id: string) => void;
  onDeleteFile: (id: string) => void;
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  onClose: () => void;
}

const Gallery: React.FC<GalleryProps> = ({ items, onOpenFile, onDeleteFile, onFileUpload, isLoading, onClose }) => {

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };
  
  const getFileIconComponent = (type: GalleryItem['type']) => {
    const iconProps = { className: "w-12 h-12 text-zinc-400 group-hover:text-indigo-300 transition-colors" };
    switch(type) {
      case 'pdf': return <PdfIcon {...iconProps} />;
      case 'docx': return <DocxIcon {...iconProps} />;
      case 'txt': return <TxtIcon {...iconProps} />;
      case 'pptx': return <PptxIcon {...iconProps} />;
      case 'xlsx': return <XlsxIcon {...iconProps} />;
      case 'epub': return <EpubIcon {...iconProps} />;
      default: return <UploadIcon {...iconProps} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-900/80 backdrop-blur-sm z-[100] flex items-center justify-center animate-fade-in p-4" onClick={onClose}>
      <div className="bg-zinc-900/90 border border-glass-border rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <header className="p-4 px-6 border-b border-glass-border flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-white">Document Gallery</h2>
            <p className="text-sm text-zinc-400">Select a document to open, or upload a new one.</p>
          </div>
           <button onClick={onClose} className="p-2 rounded-full text-zinc-400 hover:bg-white/10 text-2xl leading-none">&times;</button>
        </header>
        
        <main className="p-6 overflow-y-auto">
          {items.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {items.map(item => {
                const description = `${item.type.toUpperCase()}${item.pages ? ` - ${item.pages} pages` : ''}`;
                return (
                  <div key={item.id} className="relative group bg-zinc-700/50 rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-indigo-500/30 hover:ring-2 hover:ring-indigo-500">
                    <button onClick={() => onOpenFile(item.id)} className="w-full h-full flex flex-col p-4 text-left cursor-pointer aspect-[4/5]">
                        <div className="flex-shrink-0 mb-4">
                            {getFileIconComponent(item.type)}
                        </div>
                        <div className="flex-grow flex flex-col justify-end">
                            <p className="text-sm md:text-base font-semibold text-white leading-tight break-words" title={item.name}>{item.name}</p>
                            <p className="text-xs text-zinc-400 mt-1">{description}</p>
                        </div>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeleteFile(item.id); }} 
                      aria-label={`Delete ${item.name}`}
                      className="absolute top-2 right-2 p-1.5 bg-red-600/80 text-white rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-500 focus:opacity-100 transition-all"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
              {/* Upload Card */}
              <label htmlFor="gallery-upload" className="group bg-transparent rounded-lg flex flex-col items-center justify-center p-4 text-center cursor-pointer border-2 border-dashed border-zinc-600 hover:border-indigo-400 hover:bg-zinc-700/40 transition-colors aspect-[4/5]">
                <input type="file" id="gallery-upload" className="sr-only" onChange={handleFileChange} accept=".pdf,.docx,.txt,.pptx,.xlsx,.epub" disabled={isLoading} />
                {isLoading ? (
                    <div className="w-12 h-12 border-4 border-t-transparent border-indigo-400 rounded-full animate-spin"></div>
                ) : (
                    <>
                      <UploadIcon className="w-12 h-12 text-zinc-500 group-hover:text-indigo-400 mb-2 transition-colors" />
                      <span className="text-sm md:text-base font-semibold text-zinc-300">Upload New</span>
                      <span className="text-xs text-zinc-500">Drop a file here</span>
                    </>
                )}
              </label>
            </div>
          ) : (
             <div className="text-center py-16">
                 <h3 className="text-xl text-white">Your gallery is empty.</h3>
                 <p className="text-zinc-400 mb-6">Upload your first document to get started.</p>
                 <label htmlFor="gallery-upload-empty" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-500 transition-colors cursor-pointer">
                    <UploadIcon className="w-5 h-5" />
                    Upload Document
                 </label>
                 <input type="file" id="gallery-upload-empty" className="sr-only" onChange={handleFileChange} accept=".pdf,.docx,.txt,.pptx,.xlsx,.epub" disabled={isLoading} />
             </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Gallery;