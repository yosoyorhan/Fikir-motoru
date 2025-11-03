import React, { useState } from 'react';

interface ImagePreviewProps {
  imageUrl: string;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrl }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!imageUrl) return null;

  return (
    <>
      {/* Thumbnail Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-28 right-5 w-20 h-20 rounded-xl border-2 border-[var(--border-color)] shadow-lg z-20 transition-all duration-300 hover:scale-110 hover:shadow-2xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 overflow-hidden group"
        style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
        title="Arka Plan Resmini Görüntüle"
        aria-label="Arka Plan Resmini Görüntüle"
      >
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/50 transition-colors flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white/80 group-hover:text-white transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex justify-center items-center animate-fade-in"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] p-4 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-white/20 text-white rounded-full text-2xl flex items-center justify-center hover:bg-white/40 transition-colors"
              aria-label="Kapat"
            >
              &times;
            </button>
            <img src={imageUrl} alt="Oluşturulan Arka Plan Resmi" className="rounded-lg shadow-2xl object-contain max-w-full max-h-[85vh]" />
          </div>
        </div>
      )}
    </>
  );
};

export default ImagePreview;
