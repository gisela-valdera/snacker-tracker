import React from 'react';
import { SnackCategory, SortField, SortDirection } from '../types.ts';

interface FilterBarProps {
  currentFilter: SnackCategory;
  onFilterChange: (cat: SnackCategory) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortField: SortField;
  sortDirection: SortDirection;
  onSortChange: (field: SortField) => void;
  categoryCounts: Record<SnackCategory, number>;
  totalFiltered: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  currentFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  sortField,
  sortDirection,
  onSortChange,
  categoryCounts,
  totalFiltered,
}) => {
  const categories: { label: string; value: SnackCategory }[] = [
    { label: 'All', value: 'all' },
    { label: 'Sweet', value: 'sweet' },
    { label: 'Savoury', value: 'savoury' },
    { label: 'Fruit', value: 'fruit' },
    { label: 'Drink', value: 'drink' },
    { label: 'Other', value: 'other' },
  ];

  return (
    <div className="mb-8 space-y-4">
      {/* Category Toggles & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-3 border-b border-[var(--border-subtle)]">
        <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-[15px] md:text-[17px]">
          {categories.map((cat) => {
            const count = categoryCounts[cat.value] || 0;
            const isActive = currentFilter === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => onFilterChange(cat.value)}
                className={`filter-btn ${isActive ? 'active' : ''}`}
                type="button"
              >
                [{cat.label}
                <span className="text-[11px] opacity-75 font-mono-tabular ml-0.5">
                  {count}
                </span>
                ]
              </button>
            );
          })}
        </div>

        {/* Live Search Input */}
        <div className="w-full md:w-72">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search donor, country, snack..."
              className="brutalist-input text-[14px] pb-1.5 pt-0 placeholder:text-[var(--fg-muted)]"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="absolute right-0 top-0 text-[11px] font-mono-tabular opacity-60 hover:opacity-100 uppercase"
                title="Clear search"
              >
                [Clear]
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sorting Controls & Result Count */}
      <div className="flex flex-wrap items-center justify-between text-[12px] font-medium opacity-80 gap-2">
        <div className="flex items-center gap-2">
          <span className="uppercase tracking-wider text-[11px] font-bold opacity-60">Order:</span>
          <button
            onClick={() => onSortChange('dateBroughtIn')}
            className={`cursor-pointer hover:underline ${sortField === 'dateBroughtIn' ? 'font-bold underline' : ''}`}
          >
            Date In {sortField === 'dateBroughtIn' ? (sortDirection === 'desc' ? '↓' : '↑') : ''}
          </button>
          <span>/</span>
          <button
            onClick={() => onSortChange('rating')}
            className={`cursor-pointer hover:underline ${sortField === 'rating' ? 'font-bold underline' : ''}`}
          >
            Score {sortField === 'rating' ? (sortDirection === 'desc' ? '↓' : '↑') : ''}
          </button>
          <span>/</span>
          <button
            onClick={() => onSortChange('name')}
            className={`cursor-pointer hover:underline ${sortField === 'name' ? 'font-bold underline' : ''}`}
          >
            Name {sortField === 'name' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
          </button>
          <span>/</span>
          <button
            onClick={() => onSortChange('origin')}
            className={`cursor-pointer hover:underline ${sortField === 'origin' ? 'font-bold underline' : ''}`}
          >
            Origin {sortField === 'origin' ? (sortDirection === 'asc' ? '↑' : '↓') : ''}
          </button>
        </div>

        <div className="font-mono-tabular text-[11px]">
          [Displaying {totalFiltered} of maximum 100 latest]
        </div>
      </div>
    </div>
  );
};
