import React, { useState } from 'react';

interface RLSHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  sqlToFix: string;
}

const RLSHelpModal: React.FC<RLSHelpModalProps> = ({ isOpen, onClose, sqlToFix }) => {
  const [copyButtonText, setCopyButtonText] = useState('Kodu Kopyala');

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlToFix);
    setCopyButtonText('Kopyalandı!');
    setTimeout(() => setCopyButtonText('Kodu Kopyala'), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center animate-fade-in p-4" onClick={onClose}>
      <div className="modal-card w-full max-w-2xl mx-auto flex flex-col animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 text-center border-b border-[var(--border-color)]">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/50 mb-4">
            <svg className="h-6 w-6 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Veritabanı İzin Hatası</h2>
          <p className="text-md text-[var(--text-secondary)] mt-2">
            Uygulamanın verilerinize erişim izni yok gibi görünüyor. Bu genellikle Supabase'deki Satır Seviyesi Güvenlik (RLS) politikaları eksik olduğunda meydana gelir.
          </p>
        </div>
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          <p className="text-sm text-[var(--text-secondary)] mb-4">
            Sorunu çözmek için lütfen aşağıdaki SQL kodunu Supabase projenizdeki <strong>SQL Editor</strong> bölümüne yapıştırıp çalıştırın.
          </p>
          <pre className="bg-[var(--bg-primary)] p-4 rounded-lg text-sm text-[var(--text-secondary)] overflow-x-auto">
            <code>{sqlToFix}</code>
          </pre>
        </div>
        <div className="p-6 bg-transparent rounded-b-2xl border-t border-[var(--border-color)] flex flex-col sm:flex-row gap-3">
          <button onClick={handleCopy} className="w-full gradient-button gradient-strategy-button py-3 px-4 rounded-lg font-semibold">
            {copyButtonText}
          </button>
          <button onClick={onClose} className="w-full bg-[var(--bg-secondary)]/60 py-3 px-4 rounded-lg text-[var(--text-primary)] font-semibold hover:bg-[var(--bg-secondary)]">
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};

export default RLSHelpModal;
