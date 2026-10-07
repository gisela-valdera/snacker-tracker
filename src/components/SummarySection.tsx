import React from 'react';
import { Snack } from '../types.ts';

interface SummarySectionProps {
  snacks: Snack[];
  isLoading: boolean;
}

export const SummarySection: React.FC<SummarySectionProps> = ({
  snacks,
  isLoading,
}) => {
  // Compute top contributor
  const contributorCounts = snacks.reduce<Record<string, number>>((acc, s) => {
    acc[s.broughtBy] = (acc[s.broughtBy] || 0) + 1;
    return acc;
  }, {});

  const sortedContributors = Object.entries(contributorCounts).sort((a, b) => b[1] - a[1]);
  const topContributor = sortedContributors[0] ? sortedContributors[0][0] : 'None';
  const topContributorCount = sortedContributors[0] ? sortedContributors[0][1] : 0;

  // Compute countries
  const uniqueOrigins = new Set(snacks.map((s) => s.origin)).size;

  // Compute category breakdown
  const sweetCount = snacks.filter((s) => s.category === 'sweet').length;
  const savouryCount = snacks.filter((s) => s.category === 'savoury').length;
  const fruitCount = snacks.filter((s) => s.category === 'fruit').length;
  const drinkCount = snacks.filter((s) => s.category === 'drink').length;
  const otherCount = snacks.filter((s) => s.category === 'other').length;

  // Compute global average rating
  const totalRatingSum = snacks.reduce((acc, s) => acc + (s.ratingSum || 0), 0);
  const totalRatingCount = snacks.reduce((acc, s) => acc + (s.ratingCount || 0), 0);
  const avgRatingDisplay = totalRatingCount > 0
    ? `${(totalRatingSum / totalRatingCount).toFixed(1)}/5.0 (${totalRatingCount} ratings)`
    : 'No ratings yet';

  return (
    <footer className="mt-16 pt-8 border-t-2 border-[#161616]">
      {/* Primary Curatorial Ledger Statement */}
      <div className="text-[17px] md:text-[22px] font-bold tracking-tight mb-4 leading-snug">
        {isLoading ? (
          <span>Synchronizing with Cloud Firestore archive...</span>
        ) : snacks.length > 0 ? (
          <span>
            Total {snacks.length} items logged [*]. Top contributor: {topContributor} ({topContributorCount} entries) [**]. Origin count: {uniqueOrigins} countries. Department score: {avgRatingDisplay}.
          </span>
        ) : (
          <span>
            Archive is clean with 0 entries logged. Awaiting first submission [*].
          </span>
        )}
      </div>

      {/* Grid of Micro-Metrics in Swiss Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 py-4 my-4 border-y border-[#161616]/30 text-xs font-mono-tabular">
        <div>
          <span className="opacity-60 block uppercase">Sweet</span>
          <span className="text-base font-bold">{sweetCount}</span>
        </div>
        <div>
          <span className="opacity-60 block uppercase">Savoury</span>
          <span className="text-base font-bold">{savouryCount}</span>
        </div>
        <div>
          <span className="opacity-60 block uppercase">Fruit</span>
          <span className="text-base font-bold">{fruitCount}</span>
        </div>
        <div>
          <span className="opacity-60 block uppercase">Drink</span>
          <span className="text-base font-bold">{drinkCount}</span>
        </div>
        <div>
          <span className="opacity-60 block uppercase">Other</span>
          <span className="text-base font-bold">{otherCount}</span>
        </div>
      </div>

      {/* Footnotes & Required Branding */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs font-mono-tabular opacity-75">
        <div className="space-y-1">
          <p>[*] Persisted in Cloud Firestore. Limited to latest 100 entries.</p>
          <p>[**] Immutable community records with running score aggregates.</p>
        </div>

        <div className="space-y-1 text-left md:text-right">
          <div className="font-bold">
            A project by X-Team, part of VML UK.
          </div>
          <div className="opacity-60 text-[11px]">
            X-Team, VML UK ©2026
          </div>
        </div>
      </div>
    </footer>
  );
};
