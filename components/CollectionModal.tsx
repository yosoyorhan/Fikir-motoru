import React, { useState } from 'react';
import { SavedIdea, IdeaStatus } from '../types';

interface CollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedIdeas: SavedIdea[];
  onLoadIdea: (idea: SavedIdea) => void;
  onSetMainFocus: (idea: SavedIdea) => void;
  onIdeaStatusChange: (ideaId: string, newStatus: IdeaStatus) => void;
}

const columns: IdeaStatus[] = ['Havuz (Kasa)', 'Değerlendiriliyor', 'Onaylandı'];

const KanbanCard: React.FC<{ idea: SavedIdea; onSetMainFocus: (idea: SavedIdea) => void; }> = ({ idea, onSetMainFocus }) => {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("ideaId", idea.id);
      }}
      className="bg-[var(--bg-primary)] p-4 rounded-lg border border-[var(--border-color)] shadow-md cursor-grab active:cursor-grabbing"
    >
      <div className="flex justify-between items-start">
        <span className="text-xs bg-cyan-900/50 text-cyan-300 px-2 py-0.5 rounded-full">{idea.topic}</span>
        <button 
          onClick={() => onSetMainFocus(idea)}
          title="Ana Odak Olarak Ayarla"
          className="p-2 rounded-full text-[var(--text-secondary)] hover:text-white hover:bg-green-500 transition-colors"
        >
          🚀
        </button>
      </div>
      <h3 className="font-bold text-md text-[var(--text-primary)] mt-2">{idea.title}</h3>
      <p className="text-[var(--text-secondary)] mt-2 text-sm">{idea.description.substring(0, 100)}...</p>
    </div>
  );
};

const KanbanColumn: React.FC<{
  status: IdeaStatus;
  ideas: SavedIdea[];
  onSetMainFocus: (idea: SavedIdea) => void;
  onIdeaStatusChange: (ideaId: string, newStatus: IdeaStatus) => void;
}> = ({ status, ideas, onSetMainFocus, onIdeaStatusChange }) => {
  const [isOver, setIsOver] = useState(false);
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const ideaId = e.dataTransfer.getData("ideaId");
    if (ideaId) {
      onIdeaStatusChange(ideaId, status);
    }
    setIsOver(false);
  };
  
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
      className={`w-full lg:w-1/3 flex-shrink-0 bg-[var(--bg-secondary)]/50 rounded-lg p-4 transition-colors ${isOver ? 'bg-cyan-500/20' : ''}`}
    >
      <h3 className="font-bold text-lg text-center mb-4 pb-2 border-b border-[var(--border-color)]">{status}</h3>
      <div className="space-y-4 lg:h-[calc(100%-4rem)] lg:overflow-y-auto">
        {ideas.map(idea => <KanbanCard key={idea.id} idea={idea} onSetMainFocus={onSetMainFocus} />)}
      </div>
    </div>
  );
};

const CollectionModal: React.FC<CollectionModalProps> = ({ 
    isOpen, 
    onClose, 
    savedIdeas, 
    onLoadIdea,
    onSetMainFocus,
    onIdeaStatusChange
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center animate-fade-in" onClick={onClose}>
      <div className="modal-card w-full max-w-6xl h-[90vh] mx-4 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-[var(--border-color)] flex justify-between items-center flex-shrink-0">
             <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-500">İnovasyon Panosu</h2>
             <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-3xl font-light">&times;</button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          {savedIdeas.length === 0 ? (
            <div className="text-center text-[var(--text-secondary)] py-10 flex flex-col items-center justify-center h-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 opacity-30 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M6.343 16l-.707.707m12.728 0l-.707-.707M6.343 8l-.707-.707m12.728 0l.707.707M12 21a9 9 0 110-18 9 9 0 010 18z" />
              </svg>
              <p className="text-lg font-semibold">İnovasyon Kasası boş.</p>
              <p className="text-sm mt-1">İlk parlak fikrinizi bulmak için motoru çalıştırın!</p>
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-6 lg:h-full">
              {columns.map(status => (
                <KanbanColumn
                  key={status}
                  status={status}
                  ideas={savedIdeas.filter(idea => idea.status === status)}
                  onSetMainFocus={onSetMainFocus}
                  onIdeaStatusChange={onIdeaStatusChange}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CollectionModal;
