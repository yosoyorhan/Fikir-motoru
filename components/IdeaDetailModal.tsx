import React from 'react';
import { marked } from 'marked';
import { DetailedIdea } from '../types';

interface IdeaDetailModalProps {
  isOpen: boolean;
  idea: DetailedIdea | null;
  onSave: (idea: DetailedIdea) => void;
  onClose: () => void;
}

const IdeaDetailModal: React.FC<IdeaDetailModalProps> = ({ isOpen, idea, onSave, onClose }) => {
  if (!isOpen || !idea) return null;

  const handleSave = () => {
    onSave(idea);
    onClose();
  };
  
  const renderedDetails = marked.parse(idea.details, { gfm: true, breaks: true });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center animate-fade-in p-4">
      <div 
        className="modal-card w-full max-w-2xl mx-auto flex flex-col animate-scale-in bg-[var(--bg-secondary)]/80 backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center border-b border-[var(--border-color)]">
             <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">
                Fikir Detaylandırıldı
            </h2>
             <p className="text-md text-[var(--text-secondary)] mt-2">{idea.title}</p>
        </div>

        <div className="px-6 py-4 max-h-[60vh] overflow-y-auto">
             <div
                className="prose prose-sm dark:prose-invert max-w-none text-[var(--text-secondary)]"
                dangerouslySetInnerHTML={{ __html: renderedDetails }}
            />
        </div>
        
        <div className="p-6 bg-transparent rounded-b-2xl border-t border-[var(--border-color)] flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSave}
            className="w-full gradient-button gradient-success py-3 px-4 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-transform hover:scale-105"
          >
            İnovasyon Panosuna Ekle
          </button>
          <button
            onClick={onClose}
            className="w-full bg-[var(--bg-secondary)]/60 py-3 px-4 rounded-lg text-[var(--text-primary)] font-semibold hover:bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-offset-2 ring-offset-[var(--bg-secondary)] focus:ring-gray-400"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default IdeaDetailModal;
