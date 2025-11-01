import React from 'react';
import { SavedIdea } from '../types';

interface IdeaFoundModalProps {
  isOpen: boolean;
  idea: SavedIdea | null;
  onAccept: () => void;
  onReject: () => void;
}

const IdeaFoundModal: React.FC<IdeaFoundModalProps> = ({ isOpen, idea, onAccept, onReject }) => {
  if (!isOpen || !idea) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center animate-fade-in p-4">
      <div 
        className="modal-card w-full max-w-lg mx-auto flex flex-col animate-scale-in bg-[var(--bg-secondary)]/80 backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-green-400 to-blue-500 text-white mb-4 animate-pulse-icon">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M6.343 16l-.707.707m12.728 0l-.707-.707M6.343 8l-.707-.707m12.728 0l.707.707M12 21a9 9 0 110-18 9 9 0 010 18z" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold font-light-heading text-[var(--text-primary)]">
                İşte Niş Fikir Önerisi
            </h2>
        </div>

        <div className="px-6 pb-6 max-h-[50vh] overflow-y-auto">
            <div className="bg-[var(--bg-primary)]/80 p-4 rounded-lg border border-[var(--border-color)]">
                <h3 className="font-bold text-lg text-center text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500 mb-2">
                    {idea.title}
                </h3>
                <p className="text-sm text-[var(--text-secondary)] text-left whitespace-pre-wrap">
                    {idea.description}
                </p>
            </div>
        </div>
        
        <div className="p-6 bg-transparent rounded-b-2xl border-t border-[var(--border-color)] flex flex-col sm:flex-row gap-3">
          <button
            onClick={onAccept}
            className="w-full gradient-button gradient-success py-3 px-4 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform hover:scale-105"
          >
            Bu Harika, Teşekkürler!
          </button>
          <button
            onClick={onReject}
            className="w-full bg-[var(--bg-secondary)]/60 py-3 px-4 rounded-lg text-[var(--text-primary)] font-semibold hover:bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-offset-2 ring-offset-[var(--bg-secondary)] focus:ring-gray-400"
          >
            Daha İyi Bir Fikir Arayın
          </button>
        </div>
      </div>
    </div>
  );
};

export default IdeaFoundModal;