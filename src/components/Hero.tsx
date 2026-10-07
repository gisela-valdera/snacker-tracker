import React from 'react';

export const Hero: React.FC = () => {
  return (
    <div className="w-full mb-10 select-none">
      <div 
        className="font-black leading-[0.8] tracking-[-0.05em] text-[#161616]"
        style={{ fontSize: 'clamp(72px, 16vw, 210px)' }}
      >
        SNACKS
      </div>
      <div className="w-full h-[18px] md:h-[22px] bg-[#161616] mt-3 md:mt-4"></div>
    </div>
  );
};
