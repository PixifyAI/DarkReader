import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GalleryItem, Highlight, ToolState } from '../types';

interface DocumentViewerProps {
  file: GalleryItem;
  highlights: Highlight[];
  onHighlightsChange: (highlights: Highlight[]) => void;
  toolState: ToolState;
  isDarkMode: boolean;
  zoomLevel: number;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ file, highlights, onHighlightsChange, toolState, isDarkMode, zoomLevel }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  const zoomContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<Highlight | null>(null);
  
  // Ensure SVG overlay has the same height as the content
  useEffect(() => {
    if (zoomContainerRef.current && svgRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        if(zoomContainerRef.current && svgRef.current) {
            svgRef.current.style.width = `${zoomContainerRef.current.clientWidth}px`;
            svgRef.current.style.height = `${zoomContainerRef.current.scrollHeight}px`;
        }
      });
      resizeObserver.observe(zoomContainerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, [file.content, zoomLevel]);

  const getPointerPosition = useCallback((e: MouseEvent | TouchEvent, target: HTMLElement) => {
      const rect = target.getBoundingClientRect();
      const touch = 'touches' in e ? e.touches[0] : e;
      // Adjust coordinates for the zoom level to get position within the unscaled element
      const x = (touch.clientX - rect.left) / zoomLevel;
      const y = (touch.clientY - rect.top) / zoomLevel;
      return { x, y };
  }, [zoomLevel]);

  const handleDrawStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (toolState.activeTool !== 'highlight' || isDrawing) return;

    // Blur the active element (likely a toolbar button) to allow the toolbar to hide on hover.
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    
    e.preventDefault(); // Prevent scrolling on touch devices
    const { x, y } = getPointerPosition(e.nativeEvent, e.currentTarget as HTMLElement);
    
    setIsDrawing(true);
    setCurrentPath({
      id: `path-${Date.now()}`,
      points: [{ x, y }],
      color: toolState.color,
      size: toolState.size, // Store the raw size; scaling is handled by the SVG transform
    });
  }, [toolState.activeTool, toolState.color, toolState.size, isDrawing, getPointerPosition]);

  useEffect(() => {
    if (!isDrawing) return;

    const handleDrawMove = (e: MouseEvent | TouchEvent) => {
        if (!zoomContainerRef.current) return;
        const { x, y } = getPointerPosition(e, zoomContainerRef.current);
        setCurrentPath(prev => prev ? { ...prev, points: [...prev.points, { x, y }] } : null);
    };

    const handleDrawEnd = () => {
        setIsDrawing(false);
    };

    window.addEventListener('mousemove', handleDrawMove);
    window.addEventListener('touchmove', handleDrawMove);
    window.addEventListener('mouseup', handleDrawEnd);
    window.addEventListener('touchend', handleDrawEnd);

    return () => {
        window.removeEventListener('mousemove', handleDrawMove);
        window.removeEventListener('touchmove', handleDrawMove);
        window.removeEventListener('mouseup', handleDrawEnd);
        window.removeEventListener('touchend', handleDrawEnd);
    };
  }, [isDrawing, getPointerPosition]);

  useEffect(() => {
    if (!isDrawing && currentPath) {
        if (currentPath.points.length > 1) {
            onHighlightsChange([...highlights, currentPath]);
        }
        setCurrentPath(null);
    }
  }, [isDrawing, currentPath, onHighlightsChange, highlights]);
  
  const generatePathData = (points: Array<{x: number, y: number}>) => {
    if (points.length < 2) {
      return points.length === 1 ? `M${points[0].x},${points[0].y} L${points[0].x},${points[0].y}` : '';
    }

    let d = `M${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length - 1; i++) {
        const xc = (points[i].x + points[i + 1].x) / 2;
        const yc = (points[i].y + points[i + 1].y) / 2;
        d += ` Q${points[i].x},${points[i].y} ${xc},${yc}`;
    }
    d += ` L${points[points.length - 1].x},${points[points.length - 1].y}`;
    return d;
  };

  const renderContent = () => {
    const bgClass = isDarkMode ? 'bg-zinc-900' : 'bg-white';
    const textClass = isDarkMode ? 'text-zinc-200' : 'text-zinc-900';

    if (Array.isArray(file.content)) {
      // PDF (pre-rendered pages)
      return file.content.map((dataUrl, index) => (
        <img key={index} src={dataUrl} alt={`Page ${index + 1}`} className={`w-full h-auto block select-none ${isDarkMode ? 'pdf-dark-mode-filter' : ''}`} draggable="false"/>
      ));
    }
    
    // For DOCX, PPTX, XLSX, EPUB, TXT
    if (file.type === 'xlsx') {
        return <div className={`${bgClass} ${textClass} p-4 md:p-8`} dangerouslySetInnerHTML={{ __html: file.content as string}}/>
    }

    const proseClasses = isDarkMode ? 'prose prose-invert' : 'prose';
    return <div className={`p-8 md:p-12 max-w-none ${bgClass} ${textClass} ${proseClasses}`} dangerouslySetInnerHTML={{ __html: file.content as string}}/>
  }

  return (
    <div
      ref={viewerRef}
      className="relative w-full h-full overflow-auto pt-8 pb-32 flex justify-start"
    >
      <div className="relative flex-shrink-0 w-full flex justify-center">
        <div
            ref={zoomContainerRef}
            className={`relative max-w-4xl shadow-2xl transition-transform duration-200 ease-in-out`}
            style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
            onMouseDown={handleDrawStart}
            onTouchStart={handleDrawStart}
        >
          <div className="w-full">
            {renderContent()}
          </div>
          
          {/* Highlight Overlay */}
          <svg ref={svgRef} className="absolute top-0 left-0 pointer-events-none z-10">
            <g>
              {highlights.map(h => (
                <path
                  key={h.id}
                  d={generatePathData(h.points)}
                  stroke={h.color}
                  strokeWidth={h.size}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {currentPath && (
                <path
                  d={generatePathData(currentPath.points)}
                  stroke={currentPath.color}
                  strokeWidth={currentPath.size}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;