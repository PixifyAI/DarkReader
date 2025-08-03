import React from 'react';
import { AiStatus } from '../types';
import { MicIcon, SoundWaveIcon } from './Icons';

interface AiVoiceOverlayProps {
  status: AiStatus;
}

const AiVoiceOverlay: React.FC<AiVoiceOverlayProps> = ({ status }) => {
  if (status === 'idle') {
    return null;
  }

  const getStatusContent = () => {
    switch (status) {
      case 'listening':
        return (
          <>
            <MicIcon className="w-8 h-8 text-white" />
            <span className="mt-2 text-sm font-medium">Listening...</span>
          </>
        );
      case 'thinking':
        return (
          <>
            <div className="flex items-center justify-center gap-2">
                <div className="w-3 h-3 bg-white rounded-full animate-bounce"></div>
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-3 h-3 bg-white rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
            </div>
            <span className="mt-2 text-sm font-medium">Thinking...</span>
          </>
        );
      case 'speaking':
        return (
           <>
            <SoundWaveIcon className="w-8 h-8 text-white animate-pulse" />
            <span className="mt-2 text-sm font-medium">Speaking...</span>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed bottom-24 md:bottom-28 left-1/2 -translate-x-1/2 z-[60] pointer-events-none">
      <div className="bg-indigo-600/90 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col items-center justify-center text-white px-8 py-4 animate-fade-in">
        {getStatusContent()}
      </div>
    </div>
  );
};

export default AiVoiceOverlay;
