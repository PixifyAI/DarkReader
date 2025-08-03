import React, { useState, useEffect, useCallback, useMemo } from 'react';
import DocumentViewer from './components/DocumentViewer';
import Toolbar from './components/Toolbar';
import Gallery from './components/Gallery';
import FileUpload from './components/FileUpload';
import AiVoiceOverlay from './components/AiVoiceOverlay';
import { useTextToSpeech } from './hooks/useTextToSpeech';
import { useSpeechToText } from './hooks/useSpeechToText';
import { useAiSpeech } from './hooks/useAiSpeech';
import { Highlight, ToolState, GalleryItem, AiStatus } from './types';
import { INITIAL_TOOL_STATE, ZOOM_LEVELS } from './constants';
import * as db from './utils/db';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';


declare const pdfjsLib: any;
declare const mammoth: any;
declare const XLSX: any;
declare const ePub: any;


const useLocalStorage = <T,>(key: string, initialState: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialState;
        } catch (error) {
            console.error(error);
            return initialState;
        }
    });

    useEffect(() => {
        try {
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.error(error);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue];
};

const PointerEffect: React.FC = () => {
    const [position, setPosition] = useState({ x: -100, y: -100 });
    useEffect(() => {
        const handleMove = (e: MouseEvent | TouchEvent) => {
            const touch = 'touches' in e ? e.touches[0] : e;
            setPosition({ x: touch.clientX, y: touch.clientY });
        };
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('touchmove', handleMove);
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleMove);
        }
    }, []);

    const pointerStyle: React.CSSProperties = {
        left: `${position.x}px`,
        top: `${position.y}px`,
        // Using box-shadow for a brighter, more realistic glow
        boxShadow: '0 0 15px 5px rgba(239, 68, 68, 0.7), 0 0 30px 10px rgba(239, 68, 68, 0.5)',
    };

    return (
        <div
            className="pointer-events-none fixed z-[9999] h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
            style={pointerStyle}
        ></div>
    );
};

interface SpotlightEffectProps {
    size: number;
}

const SpotlightEffect: React.FC<SpotlightEffectProps> = ({ size }) => {
    const [position, setPosition] = useState({ x: -500, y: -500 });
     useEffect(() => {
        const handleMove = (e: MouseEvent | TouchEvent) => {
            const touch = 'touches' in e ? e.touches[0] : e;
            setPosition({ x: touch.clientX, y: touch.clientY });
        };
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('touchmove', handleMove);
        return () => {
            window.removeEventListener('mousemove', handleMove);
            window.removeEventListener('touchmove', handleMove);
        }
    }, []);

    const shadowColor = 'rgba(0, 0, 0, 0.85)';

    const spotlightStyle = {
        background: `radial-gradient(
            circle at ${position.x}px ${position.y}px, 
            transparent ${size}px, 
            ${shadowColor} ${size + 1}px
        )`,
    };
    return <div className="pointer-events-none fixed inset-0 z-[9998]" style={spotlightStyle}></div>;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = error => reject(error);
    });
};

const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

function App() {
    const [gallery, setGallery] = useState<GalleryItem[]>([]);
    const [highlightsMap, setHighlightsMap] = useState<Record<string, Highlight[]>>({});
    
    const [activeFileId, setActiveFileId] = useLocalStorage<string | null>('darkreader_activeFileId', null);
    const [toolState, setToolState] = useLocalStorage<ToolState>('darkreader_toolstate', INITIAL_TOOL_STATE);
    const [isDarkMode, setIsDarkMode] = useLocalStorage<boolean>('darkreader_darkmode', true);
    const [zoomLevel, setZoomLevel] = useLocalStorage<number>('darkreader_zoom', 1);
    
    const [dbReady, setDbReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isGalleryOpen, setIsGalleryOpen] = useState(false);

    // AI Assistant State
    const [aiStatus, setAiStatus] = useState<AiStatus>('idle');
    const [aiError, setAiError] = useState<string | null>(null);
    
    const activeFile = gallery.find(f => f.id === activeFileId) || null;
    const activeHighlights = activeFile ? highlightsMap[activeFile.id] || [] : [];
    
    const ai = useMemo(() => process.env.API_KEY ? new GoogleGenAI({ apiKey: process.env.API_KEY }) : null, []);

    const onAiSpeechEnd = useCallback(() => {
      setAiStatus('idle');
    }, []);
    
    const { speak: speakAi, stop: stopAiSpeech } = useAiSpeech(onAiSpeechEnd);

    const handleAiTranscript = useCallback(async (transcript: string) => {
      if (!ai) {
          setAiError('Gemini API key is not configured.');
          setAiStatus('idle');
          return;
      }
      if (!activeFile) return;

      setAiStatus('thinking');
      
      try {
          const systemInstruction = `You are a helpful assistant for analyzing documents. The user has provided the following document content. Keep your answers concise and conversational. Document content: """${activeFile.textContent}"""`;
          
          const response: GenerateContentResponse = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: { role: 'user', parts: [{text: transcript}] },
              config: { systemInstruction },
          });

          setAiStatus('speaking');
          speakAi(response.text);

      } catch (err) {
          console.error("Gemini API error:", err);
          setAiError('Sorry, I encountered an error.');
          setAiStatus('idle');
      }
    }, [ai, activeFile, speakAi]);

    const { startListening, stopListening, error: speechError } = useSpeechToText(handleAiTranscript);

    useEffect(() => {
      if (aiStatus === 'idle') {
        stopListening();
        stopAiSpeech();
      }
    }, [aiStatus, stopListening, stopAiSpeech]);
    
    useEffect(() => {
        const loadDataFromDB = async () => {
            try {
                await db.initDB();
                const [galleryItems, highlights] = await Promise.all([
                    db.getGallery(),
                    db.getHighlights(),
                ]);
                setGallery(galleryItems);
                setHighlightsMap(highlights);
                setDbReady(true);
            } catch (err) {
                console.error("Failed to load data from IndexedDB:", err);
                setError("Could not load saved documents. Your browser might be in private mode or has blocked storage access.");
            } finally {
                setIsLoading(false);
            }
        };
        loadDataFromDB();
    }, []);

    const tts = useTextToSpeech(activeFile?.textContent || '');
    
    const handleZoom = (direction: 'in' | 'out' | 'reset') => {
        if (direction === 'reset') {
            setZoomLevel(1);
            return;
        }
        const newZoom = direction === 'in' 
            ? Math.min(ZOOM_LEVELS.max, zoomLevel + ZOOM_LEVELS.step)
            : Math.max(ZOOM_LEVELS.min, zoomLevel - ZOOM_LEVELS.step);
        
        setZoomLevel(newZoom);
    };

    const handleFileUpload = useCallback(async (file: File) => {
        setIsLoading(true);
        setError(null);
        try {
            const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';
            const validExtensions = ['pdf', 'docx', 'txt', 'pptx', 'xlsx', 'epub'];
            if (!validExtensions.includes(fileExtension)) {
                throw new Error('Unsupported file type.');
            }
            
            const type = fileExtension as GalleryItem['type'];
            const fileData = await fileToBase64(file);
            const arrayBuffer = base64ToArrayBuffer(fileData);

            let content: string[] | string = '';
            let textContent = '';
            let pages: number | undefined = undefined;

            switch(type) {
                case 'pdf': {
                    const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                    pages = pdfDoc.numPages;
                    const renderedPages = [];
                    for (let i = 1; i <= pages; i++) {
                        const page = await pdfDoc.getPage(i);
                        const viewport = page.getViewport({ scale: 1.5 });
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;
                        if (context) {
                            await page.render({ canvasContext: context, viewport: viewport }).promise;
                            renderedPages.push(canvas.toDataURL());
                        }
                        const text = await page.getTextContent();
                        textContent += text.items.map((item: any) => item.str).join(' ');
                    }
                    content = renderedPages;
                    break;
                }
                case 'docx':
                case 'pptx': { // Mammoth.js has experimental support for pptx
                    const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
                    const textResult = await mammoth.extractRawText({ arrayBuffer });
                    content = htmlResult.value;
                    textContent = textResult.value;
                    break;
                }
                case 'xlsx': {
                    const workbook = XLSX.read(arrayBuffer, { type: 'buffer' });
                    let html = '';
                    textContent = '';
                    workbook.SheetNames.forEach((sheetName: string) => {
                        const sheet = workbook.Sheets[sheetName];
                        html += `<h2>${sheetName}</h2>` + XLSX.utils.sheet_to_html(sheet);
                        const sheetText = XLSX.utils.sheet_to_txt(sheet);
                        textContent += sheetText + '\n\n';
                    });
                    content = html;
                    break;
                }
                case 'epub': {
                    const book = ePub(arrayBuffer);
                    const sections = await Promise.all(
                        book.spine.items.map((item: any) => 
                            item.load(book.load.bind(book)).then(() => item.render())
                        )
                    );
                    content = sections.join('');
                    // For textContent, strip HTML
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = content;
                    textContent = tempDiv.textContent || tempDiv.innerText || '';
                    pages = book.spine.items.length;
                    break;
                }
                case 'txt': {
                    const decoder = new TextDecoder('utf-8');
                    const rawText = decoder.decode(arrayBuffer);
                    content = `<pre>${rawText}</pre>`;
                    textContent = rawText;
                    break;
                }
            }

            const newFile: GalleryItem = {
                id: `file-${Date.now()}-${file.name}`,
                name: file.name,
                type,
                data: fileData,
                content,
                textContent,
                pages,
            };
            
            await db.addOrUpdateGalleryItem(newFile);
            await db.saveHighlights(newFile.id, []);

            setGallery(prev => [...prev, newFile]);
            setHighlightsMap(prev => ({ ...prev, [newFile.id]: [] }));
            setActiveFileId(newFile.id);
            setIsGalleryOpen(false);

        } catch (err: any) {
            console.error("File processing error:", err);
            setError(err.message || `Failed to process ${file.name}. The file might be corrupted or in an unsupported format.`);
        } finally {
            setIsLoading(false);
        }
    }, [setActiveFileId]);

    const handleDeleteFile = useCallback(async (fileId: string) => {
        await db.deleteGalleryItem(fileId);

        const newGallery = gallery.filter(f => f.id !== fileId);
        const newHighlightsMap = { ...highlightsMap };
        delete newHighlightsMap[fileId];

        setGallery(newGallery);
        setHighlightsMap(newHighlightsMap);

        if (activeFileId === fileId) {
            setActiveFileId(null);
             if(newGallery.length > 0) {
                setIsGalleryOpen(true);
            } else {
                setIsGalleryOpen(false);
            }
        }
    }, [activeFileId, gallery, highlightsMap, setActiveFileId]);
    
    const handleOpenFile = (fileId: string) => {
        setActiveFileId(fileId);
        setIsGalleryOpen(false);
    };
    
    const handleHighlightsChange = (newHighlights: Highlight[]) => {
        if(activeFile) {
            setHighlightsMap(prev => ({ ...prev, [activeFile.id]: newHighlights }));
            db.saveHighlights(activeFile.id, newHighlights);
        }
    };
    
    const handleClearHighlights = useCallback(() => {
      if (activeFile) {
        handleHighlightsChange([]);
      }
    }, [activeFile, handleHighlightsChange]);

    const handleOpenGallery = () => setIsGalleryOpen(true);
    const handleCloseGallery = () => setIsGalleryOpen(false);

    const handleToggleAI = () => {
        if (aiStatus === 'idle') {
            setAiStatus('listening');
            startListening();
        } else {
            setAiStatus('idle'); // This will trigger useEffect to stop listening/speaking
        }
    };

    useEffect(() => {
        if (!dbReady) return;
        
        if (!activeFileId && gallery.length > 0) {
            setIsGalleryOpen(true);
        }
    },[activeFileId, gallery.length, dbReady]);

    if (!dbReady || isLoading && !activeFile) { // Allow showing old file while loading new one
        const showLoadingSpinner = !activeFile || (isLoading && gallery.length === 0);
        if (showLoadingSpinner) {
            return <div className="flex items-center justify-center h-screen w-screen"><div className="w-16 h-16 border-4 border-t-transparent border-indigo-500 rounded-full animate-spin"></div></div>;
        }
    }

    if (gallery.length === 0) {
        return <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} error={error} />;
    }

    return (
        <div className="w-screen h-screen overflow-hidden">
            {isGalleryOpen && (
                <Gallery 
                    items={gallery}
                    onOpenFile={handleOpenFile}
                    onDeleteFile={handleDeleteFile}
                    onFileUpload={handleFileUpload}
                    isLoading={isLoading}
                    onClose={handleCloseGallery}
                />
            )}

            {activeFile ? (
                <>
                    {toolState.activeTool === 'pointer' && <PointerEffect />}
                    {toolState.activeTool === 'spotlight' && (
                        <SpotlightEffect size={toolState.spotlightSize} />
                    )}
                    <DocumentViewer 
                        file={activeFile} 
                        highlights={activeHighlights}
                        onHighlightsChange={handleHighlightsChange}
                        toolState={toolState}
                        isDarkMode={isDarkMode}
                        zoomLevel={zoomLevel}
                    />
                    <Toolbar 
                        toolState={toolState} 
                        setToolState={setToolState}
                        tts={tts}
                        onClearHighlights={handleClearHighlights}
                        isDarkMode={isDarkMode}
                        setIsDarkMode={setIsDarkMode}
                        onDeleteCurrentFile={() => handleDeleteFile(activeFile.id)}
                        onOpenGallery={handleOpenGallery}
                        zoomLevel={zoomLevel}
                        onZoom={handleZoom}
                        isAiActive={aiStatus !== 'idle'}
                        onToggleAI={handleToggleAI}
                    />
                    <AiVoiceOverlay status={aiStatus} />
                </>
            ) : (
                 !isGalleryOpen && <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} error={error} />
            )}
        </div>
    );
}

export default App;