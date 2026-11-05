import React from 'react';

interface HeroProps {
  onTableBump?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onTableBump }) => {
  const [clicks, setClicks] = React.useState(0);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const handleClick = () => {
    const next = clicks + 1;
    if (next >= 3) {
      if (onTableBump) onTableBump();
      setClicks(0);
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }
    setClicks(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setClicks(0), 1200);
  };

  return (
    <div className="w-full mb-10 select-none">
      <div 
        onClick={handleClick}
        className="font-black leading-[0.8] tracking-[-0.05em] text-[var(--fg)] cursor-pointer active:scale-[0.99] transition-transform"
        style={{ fontSize: 'clamp(72px, 16vw, 210px)' }}
        title="SNACKS (Click 3 times to bump the table)"
      >
        SNACKS
      </div>
      <div className="w-full h-[18px] md:h-[22px] bg-[var(--fg)] mt-3 md:mt-4"></div>
    </div>
  );
};
