import React from 'react';

interface PreviewCardProps {
  imageSrc: string | null;
  loading: boolean;
  altText: string;
}

const PreviewCard: React.FC<PreviewCardProps> = ({ imageSrc, loading, altText }) => {
  return (
    <div className="w-full aspect-square rounded-2xl bg-dark-800 border-2 border-dashed border-dark-700 flex flex-col items-center justify-center overflow-hidden relative group transition-all hover:border-dark-600">
      {loading ? (
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-16 h-16 rounded-full bg-dark-700" />
          <div className="h-4 w-32 bg-dark-700 rounded" />
          <p className="text-gray-500 text-sm">Generating your masterpiece...</p>
        </div>
      ) : imageSrc ? (
        <>
          <img 
            src={imageSrc} 
            alt="NFT Preview" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
             <span className="text-white text-sm font-medium backdrop-blur-md px-3 py-1 rounded-full bg-white/10">Preview</span>
          </div>
        </>
      ) : (
        <div className="text-center p-6">
          <p className="text-gray-400 mb-2 font-medium">{altText}</p>
          <p className="text-gray-600 text-xs">Supports JPG, PNG, GIF</p>
        </div>
      )}
    </div>
  );
};

export default PreviewCard;