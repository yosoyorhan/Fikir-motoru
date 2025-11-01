import React, { useState } from 'react';
import { ExtractedIdea } from '../types';

interface SessionEndModalProps {
  isOpen: boolean;
  ideas: ExtractedIdea[];
  onDetail: (idea: ExtractedIdea) => void;
  onContinue: () => void;
  onEnd: () => void;
}

const SessionEndModal: React.FC<SessionEndModalProps> = ({ isOpen, ideas, onDetail, onContinue, onEnd }) => {
  const [selectedIdea, setSelectedIdea] = useState<ExtractedIdea | null>(null);

  if (!isOpen) return null;

  const handleDetailClick = () => {
    if (selectedIdea) {
      onDetail(selectedIdea);
      setSelectedIdea(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center animate-fade-in p-4">
      <div 
        className="modal-card w-full max-w-2xl mx-auto flex flex-col animate-scale-in bg-[var(--bg-secondary)]/80 backdrop-blur-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center border-b border-[var(--border-color)]">
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">
                Fikir Fırtınası Tamamlandı!
            </h2>
            <p className="text-md text-[var(--text-secondary)] mt-2">Ekip birkaç potansiyel fikir belirledi. Şimdi ne yapmak istersiniz?</p>
        </div>

        <div className="px-6 py-4 max-h-[50vh] overflow-y-auto">
            <div className="space-y-3">
                {ideas.map((idea) => (
                    <button
                        key={idea.id}
                        onClick={() => setSelectedIdea(idea)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
                            selectedIdea?.id === idea.id
                                ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/50'
                                : 'border-[var(--border-color)] bg-[var(--bg-primary)]/50 hover:border-blue-500/50 hover:bg-blue-500/5'
                        }`}
                    >
                        <h3 className="font-bold text-md text-[var(--text-primary)]">
                            {idea.title}
                        </h3>
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                            {idea.summary}
                        </p>
                    </button>
                ))}
            </div>
        </div>
        
        <div className="p-6 bg-transparent rounded-b-2xl border-t border-[var(--border-color)] flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleDetailClick}
            disabled={!selectedIdea}
            className="w-full gradient-button gradient-strategy-button py-3 px-4 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Fikri Detaylandır
          </button>
           <button
            onClick={onContinue}
            className="w-full gradient-button gradient-success py-3 px-4 rounded-lg text-white font-semibold shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Devam Et
          </button>
          <button
            onClick={onEnd}
            className="w-full bg-[var(--bg-secondary)]/60 py-3 px-4 rounded-lg text-[var(--text-primary)] font-semibold hover:bg-[var(--bg-secondary)] focus:outline-none focus:ring-2 focus:ring-offset-2 ring-offset-[var(--bg-secondary)] focus:ring-gray-400"
          >
            Bitir
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionEndModal;