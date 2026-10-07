import React from 'react';
import { ViewMode } from '../types.ts';

interface HeaderProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  onOpenAddModal: () => void;
  itemCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  viewMode,
  setViewMode,
  onOpenAddModal,
  itemCount,
}) => {
  return (
    <header className="grid grid-cols-2 md:grid-cols-4 gap-4 border-b border-[#161616] pb-3 mb-10 text-[13px] md:text-[14px] font-medium tracking-tight">
      <div className="flex items-center gap-2">
        <span className="font-bold tracking-tighter uppercase text-[15px]">Snack Tracker</span>
        <span className="text-[12px] opacity-60">[{itemCount}]</span>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <button
          onClick={() => setViewMode('index')}
          className={`hover:bg-[#F2F1ED] px-1.5 py-0.5 rounded-none cursor-pointer bg-transparent border-0 text-inherit transition-colors ${
            viewMode === 'index' ? 'font-bold underline' : 'opacity-75'
          }`}
        >
          Index
        </button>
        <span className="opacity-40">/</span>
        <button
          onClick={onOpenAddModal}
          className="hover:bg-[#F2F1ED] px-1.5 py-0.5 rounded-none cursor-pointer bg-transparent border-0 text-inherit font-bold uppercase transition-colors"
        >
          + Add
        </button>
        <span className="opacity-40">/</span>
        <button
          onClick={() => setViewMode('about')}
          className={`hover:bg-[#F2F1ED] px-1.5 py-0.5 rounded-none cursor-pointer bg-transparent border-0 text-inherit transition-colors ${
            viewMode === 'about' ? 'font-bold underline' : 'opacity-75'
          }`}
        >
          About
        </button>
      </div>

      <div className="flex items-center">
        <button
          onClick={() => setViewMode(viewMode === 'gallery' ? 'index' : 'gallery')}
          className="filter-btn text-[13px] uppercase font-bold tracking-tight"
        >
          {viewMode === 'gallery' ? '[List View]' : '[Gallery View]'}
        </button>
      </div>

      <div className="text-right text-[12px] md:text-[13px] opacity-80 font-mono-tabular">
        X-Team, VML UK ©2026
      </div>
    </header>
  );
};
