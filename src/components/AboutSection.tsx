import React from 'react';

interface AboutSectionProps {
  onBackToIndex: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onBackToIndex }) => {
  return (
    <div className="max-w-4xl py-6 space-y-12">
      {/* Kicker */}
      <div className="flex items-center justify-between border-b border-[#161616] pb-3">
        <span className="font-mono-tabular text-xs uppercase tracking-widest font-bold">
          Archive Manifesto // Context & Protocol
        </span>
        <button
          onClick={onBackToIndex}
          className="text-xs font-mono-tabular uppercase font-bold hover:underline cursor-pointer"
        >
          [← Return to Index]
        </button>
      </div>

      {/* Main Narrative */}
      <div>
        <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight mb-6">
          The Office Snack as Cultural Artifact.
        </h2>
        <div className="space-y-6 text-lg md:text-xl font-normal leading-relaxed opacity-90">
          <p>
            Within our studio, snacks are never merely passive sustenance. They are souvenirs of design residencies, architectural pilgrimages, and spontaneous corner-store discoveries. Every box, tin, and wrapper brought to the studio bench embodies regional typography, idiosyncratic packaging mechanics, and regional flavor profiles.
          </p>
          <p>
            By documenting the provenance, contributor, and sensorial reception of every communal snack, we preserve the collaborative memory of our design department across seasons of intense sprint cycles.
          </p>
        </div>
      </div>

      {/* Three Rules */}
      <div className="border-t border-[#161616] pt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <span className="font-mono-tabular text-xs font-bold block mb-2 opacity-60 uppercase">
            Rule 01 // Global Provenance
          </span>
          <h3 className="text-xl font-bold mb-2">Authentic Origins</h3>
          <p className="text-sm opacity-80 leading-relaxed">
            Prioritize items acquired during travels, heritage markets, or regional importers. Mass-manufactured convenience foods require exceptional design justification.
          </p>
        </div>

        <div>
          <span className="font-mono-tabular text-xs font-bold block mb-2 opacity-60 uppercase">
            Rule 02 // 3:30 PM Critique
          </span>
          <h3 className="text-xl font-bold mb-2">The Communal Opening</h3>
          <p className="text-sm opacity-80 leading-relaxed">
            All sealed packaging is inaugurated during the afternoon design review. The donor gives a brief 60-second provenance briefing before samples are distributed.
          </p>
        </div>

        <div>
          <span className="font-mono-tabular text-xs font-bold block mb-2 opacity-60 uppercase">
            Rule 03 // Curatorial Rating
          </span>
          <h3 className="text-xl font-bold mb-2">Dispassionate Review</h3>
          <p className="text-sm opacity-80 leading-relaxed">
            Ratings are scored on a strict 1-to-5 scale balancing textural novelty, ingredient integrity, and pairing harmony with studio filter coffee and green tea.
          </p>
        </div>
      </div>

      {/* Credits */}
      <div className="border-t border-[#161616] pt-8 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs font-mono-tabular opacity-75 gap-4">
        <div>
          A project by X-Team, part of VML UK.
        </div>
        <button
          onClick={onBackToIndex}
          className="brutalist-btn text-xs"
        >
          Explore Catalog Index →
        </button>
      </div>
    </div>
  );
};
