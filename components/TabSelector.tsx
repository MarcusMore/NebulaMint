import React from 'react';
import { AppMode } from '../types';
import { Upload, Sparkles } from 'lucide-react';

interface TabSelectorProps {
  currentMode: AppMode;
  onSelectMode: (mode: AppMode) => void;
}

const TabSelector: React.FC<TabSelectorProps> = ({ currentMode, onSelectMode }) => {
  return (
    <div className="flex p-1 bg-dark-800 rounded-xl mb-8 border border-dark-700 w-full max-w-md mx-auto relative">
        {/* Sliding background could be added here for advanced animation */}
      <button
        onClick={() => onSelectMode(AppMode.UPLOAD)}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${
          currentMode === AppMode.UPLOAD
            ? 'bg-dark-700 text-white shadow-sm ring-1 ring-white/10'
            : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <Upload className="w-4 h-4" />
        Upload & Mint
      </button>
      <button
        onClick={() => onSelectMode(AppMode.GENERATE)}
        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${
          currentMode === AppMode.GENERATE
            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 ring-1 ring-white/10'
            : 'text-gray-400 hover:text-gray-200'
        }`}
      >
        <Sparkles className="w-4 h-4" />
        AI Generate
      </button>
    </div>
  );
};

export default TabSelector;