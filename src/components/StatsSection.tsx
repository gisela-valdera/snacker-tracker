import React, { useMemo } from 'react';
import { Snack, SnackCategory } from '../types.ts';

interface StatsSectionProps {
  snacks: Snack[];
  onBackToIndex: () => void;
  onOpenAddModal: () => void;
}

export const StatsSection: React.FC<StatsSectionProps> = ({
  snacks,
  onBackToIndex,
  onOpenAddModal,
}) => {
  const totalCount = snacks.length;

  // 1. Country distribution
  const countryData = useMemo(() => {
    const counts: Record<string, number> = {};
    snacks.forEach((s) => {
      const country = s.origin.trim() || 'Unknown';
      counts[country] = (counts[country] || 0) + 1;
    });

    const entries = Object.entries(counts).map(([country, count]) => ({
      country,
      count,
      percent: totalCount > 0 ? (count / totalCount) * 100 : 0,
    }));

    entries.sort((a, b) => {
      if (b.count !== a.count) return b.count - a.count;
      return a.country.localeCompare(b.country);
    });

    const maxCount = entries.length > 0 ? entries[0].count : 1;

    return { entries, maxCount };
  }, [snacks, totalCount]);

  // 2. Category distribution
  const categoryData = useMemo(() => {
    const categories: Array<{ id: Exclude<SnackCategory, 'all'>; label: string }> = [
      { id: 'sweet', label: 'Sweet' },
      { id: 'savoury', label: 'Savoury' },
      { id: 'fruit', label: 'Fruit' },
      { id: 'drink', label: 'Drink' },
      { id: 'other', label: 'Other' },
    ];

    const counts: Record<string, number> = {
      sweet: 0,
      savoury: 0,
      fruit: 0,
      drink: 0,
      other: 0,
    };

    snacks.forEach((s) => {
      if (counts[s.category] !== undefined) {
        counts[s.category]++;
      } else {
        counts.other++;
      }
    });

    const list = categories.map((cat) => {
      const count = counts[cat.id] || 0;
      return {
        ...cat,
        count,
        percent: totalCount > 0 ? (count / totalCount) * 100 : 0,
      };
    });

    const maxCategoryCount = Math.max(...list.map((c) => c.count), 1);

    return { list, maxCategoryCount };
  }, [snacks, totalCount]);

  // 3. Rating statistics & distribution
  const ratingData = useMemo(() => {
    let totalScoreSum = 0;
    let totalRatingsCast = 0;
    let ratedSnacksCount = 0;

    // Tiers for individual snack average ratings
    const tiers = [
      { label: '4.5 – 5.0 ★ (Superior)', min: 4.5, max: 5.01, count: 0 },
      { label: '3.5 – 4.4 ★ (Commendable)', min: 3.5, max: 4.5, count: 0 },
      { label: '2.5 – 3.4 ★ (Moderate)', min: 2.5, max: 3.5, count: 0 },
      { label: '0.5 – 2.4 ★ (Divisive)', min: 0.5, max: 2.5, count: 0 },
      { label: 'Unrated (Pending Evaluation)', min: -1, max: 0.5, count: 0 },
    ];

    // Ratings per category
    const categoryRatings: Record<string, { sum: number; count: number; snacksWithRatings: number }> = {
      sweet: { sum: 0, count: 0, snacksWithRatings: 0 },
      savoury: { sum: 0, count: 0, snacksWithRatings: 0 },
      fruit: { sum: 0, count: 0, snacksWithRatings: 0 },
      drink: { sum: 0, count: 0, snacksWithRatings: 0 },
      other: { sum: 0, count: 0, snacksWithRatings: 0 },
    };

    snacks.forEach((s) => {
      const sum = s.ratingSum || 0;
      const count = s.ratingCount || 0;

      if (count > 0) {
        totalScoreSum += sum;
        totalRatingsCast += count;
        ratedSnacksCount++;

        const avg = sum / count;
        const matchedTier = tiers.find((t) => avg >= t.min && avg < t.max);
        if (matchedTier) matchedTier.count++;

        if (categoryRatings[s.category]) {
          categoryRatings[s.category].sum += sum;
          categoryRatings[s.category].count += count;
          categoryRatings[s.category].snacksWithRatings++;
        }
      } else {
        tiers[tiers.length - 1].count++;
      }
    });

    const overallAverage = totalRatingsCast > 0 ? totalScoreSum / totalRatingsCast : 0;
    const maxTierCount = Math.max(...tiers.map((t) => t.count), 1);

    const categoryAverages = [
      { id: 'sweet', label: 'Sweet' },
      { id: 'savoury', label: 'Savoury' },
      { id: 'fruit', label: 'Fruit' },
      { id: 'drink', label: 'Drink' },
      { id: 'other', label: 'Other' },
    ].map((cat) => {
      const data = categoryRatings[cat.id];
      const avg = data && data.count > 0 ? data.sum / data.count : 0;
      return {
        ...cat,
        average: avg,
        ratingsCount: data ? data.count : 0,
        ratedSnacks: data ? data.snacksWithRatings : 0,
      };
    });

    return {
      overallAverage,
      totalRatingsCast,
      ratedSnacksCount,
      tiers,
      maxTierCount,
      categoryAverages,
    };
  }, [snacks]);

  return (
    <div className="space-y-12 animate-fadeIn">
      {/* Top Banner Navigation & Context */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-2 border-[var(--border-color)] pb-6">
        <div>
          <div className="text-xs font-mono-tabular uppercase tracking-widest opacity-60 mb-1">
            Archive Analytics // Departmental Metrics
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
            Snack Statistics
          </h1>
          <p className="text-sm md:text-base opacity-75 mt-2 max-w-2xl font-normal leading-relaxed">
            Quantitative assessment of all {totalCount} items in the shared registry.
            Calculated client-side from the stored archive without background polling.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBackToIndex}
            className="px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-tight border border-[var(--border-color)] bg-[var(--bg)] text-[var(--fg)] hover:bg-[var(--fg)] hover:text-[var(--bg)] transition-colors cursor-pointer"
          >
            ← Back to Index
          </button>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-4 py-2 text-xs md:text-sm font-bold uppercase tracking-tight bg-[var(--fg)] text-[var(--bg)] border border-[var(--border-color)] hover:bg-[var(--bg)] hover:text-[var(--fg)] transition-colors cursor-pointer"
          >
            + Add Snack
          </button>
        </div>
      </div>

      {totalCount === 0 ? (
        <div className="border border-[var(--border-color)] p-12 text-center bg-[var(--card-bg)]">
          <div className="font-mono-tabular text-sm opacity-60 uppercase mb-2">[No Records Available]</div>
          <h2 className="text-2xl font-bold uppercase mb-3">Archive Awaiting First Submission</h2>
          <p className="text-sm opacity-75 max-w-md mx-auto mb-6">
            There are currently no logged snacks to generate statistical charts. Add a snack to establish origin countries, category balances, and rating metrics.
          </p>
          <button
            type="button"
            onClick={onOpenAddModal}
            className="px-6 py-3 bg-[var(--fg)] text-[var(--bg)] font-bold uppercase text-xs tracking-wider cursor-pointer hover:opacity-90"
          >
            Submit Inaugural Snack
          </button>
        </div>
      ) : (
        <>
          {/* Executive KPI Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border border-[var(--border-color)] p-5 bg-[var(--card-bg)]">
              <div className="text-[11px] font-mono-tabular uppercase opacity-60">Total Accessions</div>
              <div className="text-3xl md:text-4xl font-black font-mono-tabular mt-1">{totalCount}</div>
              <div className="text-[11px] opacity-60 mt-1">Stored sample (max 100)</div>
            </div>

            <div className="border border-[var(--border-color)] p-5 bg-[var(--card-bg)]">
              <div className="text-[11px] font-mono-tabular uppercase opacity-60">Origin Countries</div>
              <div className="text-3xl md:text-4xl font-black font-mono-tabular mt-1">
                {countryData.entries.length}
              </div>
              <div className="text-[11px] opacity-60 mt-1">Global provenance tally</div>
            </div>

            <div className="border border-[var(--border-color)] p-5 bg-[var(--card-bg)]">
              <div className="text-[11px] font-mono-tabular uppercase opacity-60">Department Rating</div>
              <div className="text-3xl md:text-4xl font-black font-mono-tabular mt-1">
                {ratingData.overallAverage > 0 ? `${ratingData.overallAverage.toFixed(2)}★` : '—'}
              </div>
              <div className="text-[11px] opacity-60 mt-1">
                {ratingData.totalRatingsCast} total votes cast
              </div>
            </div>

            <div className="border border-[var(--border-color)] p-5 bg-[var(--card-bg)]">
              <div className="text-[11px] font-mono-tabular uppercase opacity-60">Rated Proportion</div>
              <div className="text-3xl md:text-4xl font-black font-mono-tabular mt-1">
                {Math.round((ratingData.ratedSnacksCount / totalCount) * 100)}%
              </div>
              <div className="text-[11px] opacity-60 mt-1">
                {ratingData.ratedSnacksCount} of {totalCount} items evaluated
              </div>
            </div>
          </div>

          {/* Grid Layout: Chart 1 (Category) & Chart 2 (Country) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* CHART 1: Snacks Per Category */}
            <section className="border border-[var(--border-color)] p-6 bg-[var(--card-bg)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 mb-6">
                  <div>
                    <span className="text-[11px] font-mono-tabular uppercase opacity-60 block">Metric 01</span>
                    <h2 className="text-xl font-black uppercase tracking-tight">Snacks Per Category</h2>
                  </div>
                  <span className="text-xs font-mono-tabular font-bold">5 Types</span>
                </div>

                <div className="space-y-5">
                  {categoryData.list.map((cat) => {
                    const barWidthPercent =
                      categoryData.maxCategoryCount > 0
                        ? Math.max(Math.round((cat.count / categoryData.maxCategoryCount) * 100), 2)
                        : 0;

                    return (
                      <div key={cat.id} className="group">
                        <div className="flex items-baseline justify-between text-xs font-mono-tabular mb-1.5">
                          <span className="font-bold uppercase tracking-tight text-[13px]">
                            {cat.label}
                          </span>
                          <span className="opacity-75">
                            <strong className="text-[var(--fg)]">{cat.count}</strong> items ({cat.percent.toFixed(1)}%)
                          </span>
                        </div>

                        {/* Chart bar */}
                        <div className="w-full h-7 border border-[var(--border-color)] bg-[var(--bg)] p-0.5 flex items-center">
                          <div
                            className="h-full bg-[var(--fg)] transition-all duration-300 relative group-hover:opacity-90"
                            style={{ width: `${barWidthPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] text-[11px] font-mono-tabular opacity-60 flex justify-between">
                <span>Scale: Proportional to peak category</span>
                <span>Sum = {totalCount} total entries</span>
              </div>
            </section>

            {/* CHART 2: Snacks Per Country */}
            <section className="border border-[var(--border-color)] p-6 bg-[var(--card-bg)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 mb-6">
                  <div>
                    <span className="text-[11px] font-mono-tabular uppercase opacity-60 block">Metric 02</span>
                    <h2 className="text-xl font-black uppercase tracking-tight">Snacks Per Country</h2>
                  </div>
                  <span className="text-xs font-mono-tabular font-bold">
                    {countryData.entries.length} Countries
                  </span>
                </div>

                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
                  {countryData.entries.map((item, idx) => {
                    const barWidthPercent =
                      countryData.maxCount > 0
                        ? Math.max(Math.round((item.count / countryData.maxCount) * 100), 2)
                        : 0;
                    const rankNum = String(idx + 1).padStart(2, '0');

                    return (
                      <div key={item.country} className="group">
                        <div className="flex items-baseline justify-between text-xs font-mono-tabular mb-1.5">
                          <span className="font-bold tracking-tight">
                            <span className="opacity-50 mr-2">[{rankNum}]</span>
                            {item.country}
                          </span>
                          <span className="opacity-75">
                            <strong className="text-[var(--fg)]">{item.count}</strong> {item.count === 1 ? 'snack' : 'snacks'} ({item.percent.toFixed(1)}%)
                          </span>
                        </div>

                        {/* Chart bar */}
                        <div className="w-full h-6 border border-[var(--border-color)] bg-[var(--bg)] p-0.5 flex items-center">
                          <div
                            className="h-full bg-[var(--fg)] transition-all duration-300"
                            style={{ width: `${barWidthPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[var(--border-subtle)] text-[11px] font-mono-tabular opacity-60 flex justify-between">
                <span>Ranked desc by volume of accession</span>
                <span>{countryData.entries.length} sovereign origins</span>
              </div>
            </section>
          </div>

          {/* CHART 3: Average Rating & Distribution */}
          <section className="border border-[var(--border-color)] p-6 bg-[var(--card-bg)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[var(--border-color)] pb-3 mb-6 gap-2">
              <div>
                <span className="text-[11px] font-mono-tabular uppercase opacity-60 block">Metric 03</span>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight">Average Rating & Score Distribution</h2>
              </div>
              <div className="text-xs font-mono-tabular opacity-75">
                Composite Score: <strong className="text-[var(--fg)] text-sm">{ratingData.overallAverage > 0 ? ratingData.overallAverage.toFixed(2) : '0.00'} / 5.00</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* 3A: Rating Tier Histogram */}
              <div className="space-y-4">
                <div className="text-xs font-mono-tabular uppercase font-bold tracking-tight pb-1 border-b border-[var(--border-subtle)]">
                  Archive Score Tier Distribution
                </div>

                <div className="space-y-3.5">
                  {ratingData.tiers.map((tier) => {
                    const percentOfTotal = totalCount > 0 ? (tier.count / totalCount) * 100 : 0;
                    const barWidth =
                      ratingData.maxTierCount > 0
                        ? Math.max(Math.round((tier.count / ratingData.maxTierCount) * 100), tier.count > 0 ? 3 : 0)
                        : 0;

                    return (
                      <div key={tier.label}>
                        <div className="flex justify-between items-baseline text-xs font-mono-tabular mb-1">
                          <span className="opacity-90">{tier.label}</span>
                          <span className="font-bold">
                            {tier.count} snacks <span className="opacity-60 font-normal">({percentOfTotal.toFixed(0)}%)</span>
                          </span>
                        </div>

                        <div className="w-full h-5 border border-[var(--border-color)] bg-[var(--bg)] p-0.5">
                          <div
                            className="h-full bg-[var(--fg)] transition-all duration-300"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3B: Average Rating By Category */}
              <div className="space-y-4">
                <div className="text-xs font-mono-tabular uppercase font-bold tracking-tight pb-1 border-b border-[var(--border-subtle)]">
                  Category Average Score Comparison (0.0 to 5.0 ★)
                </div>

                <div className="space-y-3.5">
                  {ratingData.categoryAverages.map((cat) => {
                    const barPercent = Math.min(Math.round((cat.average / 5.0) * 100), 100);

                    return (
                      <div key={cat.id}>
                        <div className="flex justify-between items-baseline text-xs font-mono-tabular mb-1">
                          <span className="font-bold uppercase tracking-tight">{cat.label}</span>
                          <span>
                            {cat.ratingsCount > 0 ? (
                              <>
                                <strong className="text-[var(--fg)]">{cat.average.toFixed(1)} ★</strong>{' '}
                                <span className="opacity-60">({cat.ratingsCount} votes)</span>
                              </>
                            ) : (
                              <span className="opacity-50">No ratings</span>
                            )}
                          </span>
                        </div>

                        <div className="w-full h-5 border border-[var(--border-color)] bg-[var(--bg)] p-0.5 relative">
                          {/* Guide ticks at 1.0, 2.0, 3.0, 4.0, 5.0 */}
                          <div className="absolute inset-0 flex justify-between pointer-events-none px-1 opacity-20 text-[9px] font-mono-tabular items-center">
                            <span>|</span>
                            <span>|</span>
                            <span>|</span>
                            <span>|</span>
                            <span>|</span>
                          </div>
                          <div
                            className="h-full bg-[var(--fg)] transition-all duration-300 relative z-10"
                            style={{ width: `${barPercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row justify-between text-[11px] font-mono-tabular opacity-60 gap-2">
              <span>Atomic score increments (0.5 to 5.0 ★) compiled per snack document</span>
              <span>Individual browser locks enforced locally</span>
            </div>
          </section>
        </>
      )}

      {/* Footer Return Action */}
      <div className="flex justify-between items-center pt-8 border-t border-[var(--border-color)] text-xs font-mono-tabular">
        <button
          type="button"
          onClick={onBackToIndex}
          className="hover:underline font-bold uppercase cursor-pointer"
        >
          ← Return to snack index
        </button>
        <span className="opacity-60">X-Team, VML UK · Analytics Suite</span>
      </div>
    </div>
  );
};
