import React from 'react';
import { HIGHLIGHT_COLORS, HIGHLIGHT_SIZES, SPOTLIGHT_SIZES } from '../constants';
import { ToolState, Tool } from '../types';
import { PlayIcon, PauseIcon, StopIcon, HighlightIcon, PointerIcon, SpotlightIcon, TrashIcon, DarkModeIcon, LightModeIcon, EraseIcon, GalleryIcon, ZoomInIcon, ZoomOutIcon, ZoomResetIcon, AssistantIcon } from './Icons';

interface ToolbarProps {
  toolState: ToolState;
  setToolState: React.Dispatch<React.SetStateAction<ToolState>>;
  tts: {
    isSpeaking: boolean;
    isPaused: boolean;
    play: () => void;
    pause: () => void;
    stop: () => void;
  };
  onClearHighlights: () => void;
  isDarkMode: boolean;
  setIsDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
  onDeleteCurrentFile: () => void;
  onOpenGallery: () => void;
  zoomLevel: number;
  onZoom: (direction: 'in' | 'out' | 'reset') => void;
  onToggleAI: () => void;
  isAiActive: boolean;
}

const ToolButton: React.FC<{
  label: string;
  isActive?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}> = ({ label, isActive = false, onClick, children }) => (
  <button
    onClick={onClick}
    aria-label={label}
    className={`relative group p-3 rounded-xl transition-colors duration-200 ${isActive ? 'bg-indigo-500 text-white' : 'text-glass-fg hover:bg-white/20'}`}
  >
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 whitespace-nowrap px-3 py-1.5 text-xs font-semibold text-white bg-zinc-800/90 rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-[101]">
      {label}
      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-[4px] border-t-zinc-800/90"></div>
    </div>
  </button>
);

const Toolbar: React.FC<ToolbarProps> = ({ 
    toolState, setToolState, tts, onClearHighlights, isDarkMode, 
    setIsDarkMode, onDeleteCurrentFile, onOpenGallery, zoomLevel, onZoom,
    onToggleAI, isAiActive
}) => {
  const handleToolChange = (tool: Tool) => {
    setToolState(prev => ({
      ...prev,
      activeTool: prev.activeTool === tool ? 'none' : tool,
    }));
  };

  const handleHighlightColorChange = (color: string) => {
    setToolState(prev => ({ ...prev, color }));
  };

  const handleHighlightSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToolState(prev => ({ ...prev, size: Number(e.target.value) }));
  };

  const handleSpotlightSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToolState(prev => ({ ...prev, spotlightSize: Number(e.target.value) }));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:bottom-4 md:left-1/2 md:-translate-x-1/2 md:w-auto md:max-w-[95vw] opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity duration-300">
      <div className="bg-glass-bg border border-glass-border rounded-t-2xl md:rounded-2xl shadow-2xl backdrop-blur-lg">
        <div className="flex flex-wrap items-center justify-center gap-2 p-2">
        
          {/* Highlight Tools */}
          <div className="flex items-center gap-1">
            <ToolButton label="Highlight" isActive={toolState.activeTool === 'highlight'} onClick={() => handleToolChange('highlight')}>
              <HighlightIcon className="w-6 h-6" />
            </ToolButton>
            <ToolButton
              label="Erase all highlights"
              onClick={onClearHighlights}
            >
              <EraseIcon className="w-6 h-6" />
            </ToolButton>
            {toolState.activeTool === 'highlight' && (
              <div className="flex items-center gap-3 animate-fade-in pl-2">
                <div className="flex items-center gap-2">
                  {HIGHLIGHT_COLORS.map(color => (
                    <button
                      key={color}
                      onClick={() => handleHighlightColorChange(color)}
                      className={`w-6 h-6 rounded-full transition-transform duration-200 transform hover:scale-110 ${toolState.color === color ? 'ring-2 ring-offset-2 ring-offset-zinc-700 ring-white' : ''}`}
                      style={{ backgroundColor: color }}
                      aria-label={`Highlight color ${color}`}
                    />
                  ))}
                </div>
                <input
                  type="range"
                  min={HIGHLIGHT_SIZES[0]}
                  max={HIGHLIGHT_SIZES[HIGHLIGHT_SIZES.length - 1]}
                  step="8"
                  value={toolState.size}
                  onChange={handleHighlightSizeChange}
                  className="w-24 h-2 bg-zinc-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* Presenter Tools */}
          <div className="flex items-center gap-1">
            <ToolButton label="Laser Pointer" isActive={toolState.activeTool === 'pointer'} onClick={() => handleToolChange('pointer')}>
              <PointerIcon className="w-6 h-6" />
            </ToolButton>
            <ToolButton label="Spotlight" isActive={toolState.activeTool === 'spotlight'} onClick={() => handleToolChange('spotlight')}>
              <SpotlightIcon className="w-6 h-6" />
            </ToolButton>
            {toolState.activeTool === 'spotlight' && (
              <div className="flex items-center gap-3 animate-fade-in pl-2">
                <input
                  type="range"
                  min={SPOTLIGHT_SIZES.min}
                  max={SPOTLIGHT_SIZES.max}
                  step={SPOTLIGHT_SIZES.step}
                  value={toolState.spotlightSize}
                  onChange={handleSpotlightSizeChange}
                  className="w-24 h-2 bg-zinc-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            )}
          </div>

          {/* AI Assistant */}
           <div className="flex items-center gap-1">
                <ToolButton label="Talk to AI" onClick={onToggleAI} isActive={isAiActive}>
                    <AssistantIcon className="w-6 h-6" />
                </ToolButton>
            </div>

          {/* View Controls */}
          <div className="flex items-center gap-1">
            <ToolButton 
              label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"} 
              onClick={() => setIsDarkMode(p => !p)}
            >
              {isDarkMode ? <LightModeIcon className="w-6 h-6" /> : <DarkModeIcon className="w-6 h-6" />}
            </ToolButton>
             <div className="flex items-center gap-1 text-glass-fg">
                <ToolButton label="Zoom Out" onClick={() => onZoom('out')}><ZoomOutIcon className="w-6 h-6"/></ToolButton>
                <ToolButton label="Reset Zoom" onClick={() => onZoom('reset')}>
                    <span className="font-semibold text-sm w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
                </ToolButton>
                <ToolButton label="Zoom In" onClick={() => onZoom('in')}><ZoomInIcon className="w-6 h-6"/></ToolButton>
            </div>
          </div>

          {/* TTS Controls */}
          <div className="flex items-center gap-1">
            <ToolButton 
              label={tts.isSpeaking && !tts.isPaused ? "Pause" : "Play"} 
              onClick={tts.isSpeaking && !tts.isPaused ? tts.pause : tts.play}
              isActive={tts.isSpeaking && !tts.isPaused}
            >
              {tts.isSpeaking && !tts.isPaused ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
            </ToolButton>
             <ToolButton label="Stop" onClick={tts.stop}>
              <StopIcon className="w-6 h-6" />
            </ToolButton>
          </div>

          {/* Gallery/File Controls */}
          <div className="flex items-center gap-1">
              <ToolButton label="Delete Current Document" onClick={onDeleteCurrentFile}>
                  <TrashIcon className="w-6 h-6" />
              </ToolButton>
              <ToolButton label="Open Gallery" onClick={onOpenGallery}>
                  <GalleryIcon className="w-6 h-6" />
              </ToolButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toolbar;