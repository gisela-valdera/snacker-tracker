import React from 'react';

export const Manifesto: React.FC = () => {
  return (
    <section className="my-12 md:my-16 max-w-[1100px]">
      <p 
        className="font-medium tracking-tight text-[var(--fg)] leading-[1.12]"
        style={{ fontSize: 'clamp(22px, 4.2vw, 56px)' }}
      >
        We curate the culture of our design department by tracking the global origins of our office snacks, reviving the visionary ideas of creators through shared taste.
      </p>
    </section>
  );
};
