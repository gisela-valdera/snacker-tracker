/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  updateDoc,
  doc,
  increment,
  serverTimestamp,
} from 'firebase/firestore';
import { Snack, SnackCategory, ViewMode, SortField, SortDirection, ThemeMode } from './types.ts';
import { db, handleFirestoreError, OperationType, testFirestoreConnection } from './firebase.ts';
import { Header } from './components/Header.tsx';
import { Hero } from './components/Hero.tsx';
import { Manifesto } from './components/Manifesto.tsx';
import { FilterBar } from './components/FilterBar.tsx';
import { SnackIndexList } from './components/SnackIndexList.tsx';
import { SnackGalleryView } from './components/SnackGalleryView.tsx';
import { SnackDetailModal } from './components/SnackDetailModal.tsx';
import { AddSnackModal } from './components/AddSnackModal.tsx';
import { SummarySection } from './components/SummarySection.tsx';
import { AboutSection } from './components/AboutSection.tsx';
import { StatsSection } from './components/StatsSection.tsx';
import { LoadingSkeletonGrid } from './components/LoadingSkeletonGrid.tsx';
import { EmptyState } from './components/EmptyState.tsx';
import { ErrorState } from './components/ErrorState.tsx';
import { PassportStampCorner } from './components/PassportStampCorner.tsx';

const USER_RATINGS_STORAGE_KEY = 'snack_tracker_user_star_ratings_v1';
const THEME_STORAGE_KEY = 'snack_tracker_theme_v1';
const LEGENDARY_STORAGE_KEY = 'snack_tracker_legendary_snacks_v1';
const PASSPORT_STAMPS_STORAGE_KEY = 'snack_tracker_passport_stamps_v1';

export default function App() {
  const [snacks, setSnacks] = useState<Snack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('index');
  const [currentFilter, setCurrentFilter] = useState<SnackCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Requirement: Sort the list by date brought in (newest first), then by creation time
  const [sortField, setSortField] = useState<SortField>('dateBroughtIn');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const [selectedSnack, setSelectedSnack] = useState<Snack | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  // Dark mode theme preference: 'system' | 'light' | 'dark'
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        return stored as ThemeMode;
      }
    } catch (e) {
      console.warn('Failed to read theme preference from storage:', e);
    }
    return 'system';
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Listen to OS color scheme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Compute resolved dark mode state
  const resolvedIsDark = theme === 'system' ? systemPrefersDark : theme === 'dark';

  // Apply dark mode class to html element and save preference
  useEffect(() => {
    if (resolvedIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch (e) {
      console.warn('Failed to save theme preference to storage:', e);
    }
  }, [theme, resolvedIsDark]);

  // Local storage remembered ratings for this browser (each browser can rate a snack once)
  const [userRatings, setUserRatings] = useState<Record<string, number>>(() => {
    try {
      const stored = localStorage.getItem(USER_RATINGS_STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch (err) {
      console.warn('Failed to parse local user ratings:', err);
    }
    return {};
  });

  // Feature 1: Legendary Snacks ("Perfect five" triggers "Snack of legend" badge & gold shimmer)
  const [legendarySnackIds, setLegendarySnackIds] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem(LEGENDARY_STORAGE_KEY);
      if (stored) {
        return new Set(JSON.parse(stored));
      }
    } catch (e) {
      console.warn('Failed to load legendary snacks:', e);
    }
    return new Set<string>();
  });

  // Feature 2: Passport stamps & counter for newly added countries
  const [passportStamps, setPassportStamps] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(PASSPORT_STAMPS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load passport stamps:', e);
    }
    return [];
  });
  const [latestStamp, setLatestStamp] = useState<{ country: string; date: string } | null>(null);
  const [isRecentlyStamped, setIsRecentlyStamped] = useState(false);

  // Sync existing unique countries into passport stamps
  useEffect(() => {
    if (snacks.length > 0) {
      setPassportStamps((prev) => {
        const set = new Set(prev);
        let changed = false;
        snacks.forEach((s) => {
          const origin = s.origin.trim();
          if (origin && !set.has(origin)) {
            set.add(origin);
            changed = true;
          }
        });
        if (changed) {
          const next = Array.from(set);
          try {
            localStorage.setItem(PASSPORT_STAMPS_STORAGE_KEY, JSON.stringify(next));
          } catch (e) {
            console.warn('Failed to save passport stamps:', e);
          }
          return next;
        }
        return prev;
      });
    }
  }, [snacks]);

  // Feature 3: Logo triple-click table bump wobble
  const [isTableBumped, setIsTableBumped] = useState(false);
  const handleTableBump = () => {
    setIsTableBumped(true);
    setNotification('[*BUMP!* The snack table rattled!]');
    setTimeout(() => {
      setIsTableBumped(false);
    }, 850);
  };

  // Test connection on boot and listen to Firestore snacks (latest 100)
  useEffect(() => {
    testFirestoreConnection();

    setIsLoading(true);
    setFetchError(null);
    const snacksCollection = collection(db, 'snacks');
    const q = query(snacksCollection, orderBy('createdAt', 'desc'), limit(100));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const loaded: Snack[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          loaded.push({
            id: docSnap.id,
            name: data.name,
            broughtBy: data.broughtBy,
            origin: data.origin,
            region: data.region,
            // Fallback for older items that might lack dateBroughtIn
            dateBroughtIn: data.dateBroughtIn || (data.date ? data.date : ''),
            category: data.category,
            // Ignore any old rating field; treat existing items lacking these fields as 0
            ratingSum: typeof data.ratingSum === 'number' ? data.ratingSum : 0,
            ratingCount: typeof data.ratingCount === 'number' ? data.ratingCount : 0,
            notes: data.notes,
            createdAt: data.createdAt,
          });
        });
        setSnacks(loaded);
        setIsLoading(false);
        setIsRetrying(false);
        setFetchError(null);
      },
      (error) => {
        console.error('Firestore live subscription error:', error);
        setIsLoading(false);
        setIsRetrying(false);
        setFetchError(
          'We were unable to establish a live connection with the cloud repository. This is usually caused by a momentary network interruption or offline browser state. All existing records and ratings remain securely preserved.'
        );
      }
    );

    return () => unsubscribe();
  }, [retryCount]);

  const handleRetryFetch = () => {
    setIsRetrying(true);
    setIsLoading(true);
    setFetchError(null);
    setRetryCount((prev) => prev + 1);
  };

  // 10-second cooldown timer between submissions
  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const timer = setInterval(() => {
      setCooldownRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownRemaining]);

  // Auto-dismiss notifications
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      all: snacks.length,
      sweet: snacks.filter((s) => s.category === 'sweet').length,
      savoury: snacks.filter((s) => s.category === 'savoury').length,
      fruit: snacks.filter((s) => s.category === 'fruit').length,
      drink: snacks.filter((s) => s.category === 'drink').length,
      other: snacks.filter((s) => s.category === 'other').length,
    };
  }, [snacks]);

  // Filtering and Sorting (Primary: dateBroughtIn, Secondary: creation time)
  const filteredAndSortedSnacks = useMemo(() => {
    let result = [...snacks];

    // Filter by category
    if (currentFilter !== 'all') {
      result = result.filter((s) => s.category === currentFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const queryStr = searchQuery.toLowerCase().trim();
      result = result.filter((s) => {
        return (
          s.name.toLowerCase().includes(queryStr) ||
          s.broughtBy.toLowerCase().includes(queryStr) ||
          s.origin.toLowerCase().includes(queryStr) ||
          (s.region && s.region.toLowerCase().includes(queryStr)) ||
          (s.notes && s.notes.toLowerCase().includes(queryStr))
        );
      });
    }

    const getCreationTime = (snack: Snack) => {
      if (!snack.createdAt) return 0;
      if (typeof snack.createdAt.toMillis === 'function') return snack.createdAt.toMillis();
      if (typeof snack.createdAt.toDate === 'function') return snack.createdAt.toDate().getTime();
      if (typeof snack.createdAt === 'string') return new Date(snack.createdAt).getTime();
      return 0;
    };

    const getDateBroughtInTime = (snack: Snack) => {
      if (!snack.dateBroughtIn) return 0;
      return new Date(snack.dateBroughtIn).getTime();
    };

    // Sort
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortField) {
        case 'dateBroughtIn': {
          const timeA = getDateBroughtInTime(a);
          const timeB = getDateBroughtInTime(b);
          const diff = timeA - timeB;
          if (diff !== 0) {
            comparison = diff;
          } else {
            // Secondary sort: creation time (always newest first)
            const createA = getCreationTime(a);
            const createB = getCreationTime(b);
            return sortDirection === 'asc' ? createA - createB : createB - createA;
          }
          break;
        }
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'origin':
          comparison = a.origin.localeCompare(b.origin);
          break;
        case 'rating': {
          const scoreA = (a.ratingCount && a.ratingCount > 0) ? (a.ratingSum || 0) / a.ratingCount : 0;
          const scoreB = (b.ratingCount && b.ratingCount > 0) ? (b.ratingSum || 0) / b.ratingCount : 0;
          comparison = scoreA - scoreB;
          break;
        }
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [snacks, currentFilter, searchQuery, sortField, sortDirection]);

  // Sort change handler
  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'dateBroughtIn' || field === 'rating' ? 'desc' : 'asc');
    }
  };

  // Add Snack to Firestore (Created with ratingSum 0 and ratingCount 0)
  const handleAddSnack = async (newSnackData: Omit<Snack, 'id' | 'createdAt'>): Promise<boolean> => {
    if (cooldownRemaining > 0) {
      throw new Error(`Cooldown active: please wait ${cooldownRemaining}s.`);
    }

    const payload: Record<string, any> = {
      name: newSnackData.name,
      broughtBy: newSnackData.broughtBy,
      origin: newSnackData.origin,
      dateBroughtIn: newSnackData.dateBroughtIn,
      category: newSnackData.category,
      ratingSum: 0,
      ratingCount: 0,
      createdAt: serverTimestamp(),
    };

    if (newSnackData.region) {
      payload.region = newSnackData.region;
    }
    if (newSnackData.notes) {
      payload.notes = newSnackData.notes;
    }

    const originTrimmed = newSnackData.origin.trim();
    const existingCountries = new Set(snacks.map((s) => s.origin.trim().toLowerCase()));
    const isNewCountry = !existingCountries.has(originTrimmed.toLowerCase());

    try {
      await addDoc(collection(db, 'snacks'), payload);
      setCooldownRemaining(10);

      // Feature 2: Adding a snack from a country not yet in the list stamps a passport-style mark in corner & counter keeps score
      if (isNewCountry) {
        const todayStr = new Date().toLocaleDateString('en-GB');
        setLatestStamp({ country: originTrimmed, date: todayStr });
        setIsRecentlyStamped(true);
        setTimeout(() => setIsRecentlyStamped(false), 3000);

        setPassportStamps((prev) => {
          if (!prev.includes(originTrimmed)) {
            const next = [...prev, originTrimmed];
            try {
              localStorage.setItem(PASSPORT_STAMPS_STORAGE_KEY, JSON.stringify(next));
            } catch (e) {
              console.warn('Failed to save passport stamps:', e);
            }
            return next;
          }
          return prev;
        });

        setNotification(`[★ NEW TERRITORY DISCOVERED! Passport stamped for ${originTrimmed} · Counter updated]`);
      } else {
        setNotification(`[Accession "${newSnackData.name}" committed to Firestore archive]`);
      }
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'snacks');
      return false;
    }
  };

  // Atomic Star Rating Update (0.5 to 5.0 in 0.5 steps)
  const handleRateSnack = async (snackId: string, ratingValue: number): Promise<void> => {
    if (userRatings[snackId] !== undefined) {
      setNotification('[You have already rated this snack]');
      return;
    }

    // Feature 1: Check if snack already has a 5-star average prior to this rating
    const targetSnack = snacks.find((s) => s.id === snackId);
    const hadFiveStarAverage =
      targetSnack &&
      (targetSnack.ratingCount ?? 0) > 0 &&
      (targetSnack.ratingSum ?? 0) / (targetSnack.ratingCount ?? 1) === 5;

    // 1. Immediately remember in browser's local storage
    const nextUserRatings = { ...userRatings, [snackId]: ratingValue };
    setUserRatings(nextUserRatings);
    try {
      localStorage.setItem(USER_RATINGS_STORAGE_KEY, JSON.stringify(nextUserRatings));
    } catch (err) {
      console.warn('Failed to store rating locally:', err);
    }

    // 2. Perform atomic increment on the snack document in Firestore
    try {
      const snackRef = doc(db, 'snacks', snackId);
      await updateDoc(snackRef, {
        ratingSum: increment(ratingValue),
        ratingCount: increment(1),
      });

      // Optimistically update snack in local state for instantaneous feedback
      setSnacks((prev) =>
        prev.map((s) => {
          if (s.id !== snackId) return s;
          return {
            ...s,
            ratingSum: (s.ratingSum || 0) + ratingValue,
            ratingCount: (s.ratingCount || 0) + 1,
          };
        })
      );

      // Feature 1: Perfect five trigger
      if (ratingValue === 5 && hadFiveStarAverage) {
        setLegendarySnackIds((prev) => {
          const next = new Set(prev);
          next.add(snackId);
          try {
            localStorage.setItem(LEGENDARY_STORAGE_KEY, JSON.stringify(Array.from(next)));
          } catch (e) {
            console.warn('Failed to save legendary snacks:', e);
          }
          return next;
        });
        setNotification(`[★ "Snack of legend" unlocked! 5-star perfection achieved for "${targetSnack.name}"]`);
      } else {
        setNotification(`[Rating ${ratingValue}★ recorded · Locked for this browser]`);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `snacks/${snackId}`);
    }
  };

  const selectedIndexNumber = useMemo(() => {
    if (!selectedSnack) return 1;
    const idx = snacks.findIndex((s) => s.id === selectedSnack.id);
    return idx >= 0 ? idx + 1 : 1;
  }, [selectedSnack, snacks]);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)] p-4 sm:p-6 md:p-8 selection:bg-[var(--fg)] selection:text-[var(--bg)] transition-colors duration-150">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[var(--fg)] text-[var(--bg)] font-mono-tabular text-xs px-4 py-3 border border-[var(--border-color)] shadow-[4px_4px_0px_var(--border-color)] flex items-center gap-3">
          <span>{notification}</span>
          <button
            onClick={() => setNotification(null)}
            className="hover:underline opacity-80 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main App Container */}
      <div className="max-w-[1400px] mx-auto">
        {/* Editorial Top Navigation */}
        <Header
          viewMode={viewMode}
          setViewMode={setViewMode}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          itemCount={snacks.length}
          theme={theme}
          onThemeChange={setTheme}
          resolvedIsDark={resolvedIsDark}
          onTableBump={handleTableBump}
        />

        {/* Content routing */}
        {viewMode === 'about' ? (
          <AboutSection onBackToIndex={() => setViewMode('index')} />
        ) : viewMode === 'stats' ? (
          <StatsSection
            snacks={snacks}
            onBackToIndex={() => setViewMode('index')}
            onOpenAddModal={() => setIsAddModalOpen(true)}
          />
        ) : (
          <main>
            {/* Monumental SNACKS Hero (also supports table bump on triple-click) */}
            <Hero onTableBump={handleTableBump} />

            {/* Curatorial Manifesto */}
            <Manifesto />

            {/* Filter Bar with category & search (visible when items exist and not in error) */}
            {!fetchError && !isLoading && snacks.length > 0 && (
              <FilterBar
                currentFilter={currentFilter}
                onFilterChange={setCurrentFilter}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                sortField={sortField}
                sortDirection={sortDirection}
                onSortChange={handleSortChange}
                categoryCounts={categoryCounts}
                totalFiltered={filteredAndSortedSnacks.length}
              />
            )}

            {/* Main Content Area: Error / Loading / Empty / Data Views */}
            {fetchError ? (
              <ErrorState
                message={fetchError}
                onRetry={handleRetryFetch}
                isRetrying={isRetrying}
              />
            ) : isLoading ? (
              <LoadingSkeletonGrid viewMode={viewMode} />
            ) : snacks.length === 0 ? (
              <EmptyState
                mode="inaugural"
                onOpenAddModal={() => setIsAddModalOpen(true)}
              />
            ) : filteredAndSortedSnacks.length === 0 ? (
              <EmptyState
                mode="filtered"
                searchQuery={searchQuery}
                currentFilter={currentFilter}
                onResetFilters={() => {
                  setSearchQuery('');
                  setCurrentFilter('all');
                }}
                onOpenAddModal={() => setIsAddModalOpen(true)}
              />
            ) : viewMode === 'index' ? (
              <SnackIndexList
                snacks={filteredAndSortedSnacks}
                onSelectSnack={setSelectedSnack}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                userRatings={userRatings}
                onRateSnack={handleRateSnack}
                legendarySnackIds={legendarySnackIds}
                isTableBumped={isTableBumped}
              />
            ) : (
              <SnackGalleryView
                snacks={filteredAndSortedSnacks}
                onSelectSnack={setSelectedSnack}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                userRatings={userRatings}
                onRateSnack={handleRateSnack}
                legendarySnackIds={legendarySnackIds}
                isTableBumped={isTableBumped}
              />
            )}

            {/* Summary & Ledger Footer */}
            {!fetchError && (
              <SummarySection
                snacks={snacks}
                isLoading={isLoading}
                onViewStats={() => setViewMode('stats')}
              />
            )}
          </main>
        )}

        {/* Detail Inspection Modal (Read-Only) */}
        <SnackDetailModal
          snack={selectedSnack}
          indexNumber={selectedIndexNumber}
          onClose={() => setSelectedSnack(null)}
          userRating={selectedSnack ? (userRatings[selectedSnack.id] ?? null) : null}
          onRateSnack={handleRateSnack}
          isLegendary={
            selectedSnack
              ? legendarySnackIds.has(selectedSnack.id) ||
                ((selectedSnack.ratingCount ?? 0) >= 2 &&
                  (selectedSnack.ratingSum ?? 0) / (selectedSnack.ratingCount ?? 1) === 5)
              : false
          }
        />

        {/* Intake Add Snack Modal */}
        <AddSnackModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddSnack={handleAddSnack}
          cooldownRemaining={cooldownRemaining}
        />

        {/* Passport Stamp Corner & Counter */}
        <PassportStampCorner
          stampsCount={passportStamps.length}
          latestStamp={latestStamp}
          allStampedCountries={passportStamps}
          isRecentlyStamped={isRecentlyStamped}
        />
      </div>
    </div>
  );
}
