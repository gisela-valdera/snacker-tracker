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
import { Snack, SnackCategory, ViewMode, SortField, SortDirection } from './types.ts';
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

const USER_RATINGS_STORAGE_KEY = 'snack_tracker_user_star_ratings_v1';

export default function App() {
  const [snacks, setSnacks] = useState<Snack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // Test connection on boot and listen to Firestore snacks (latest 100)
  useEffect(() => {
    testFirestoreConnection();

    setIsLoading(true);
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
      },
      (error) => {
        setIsLoading(false);
        handleFirestoreError(error, OperationType.GET, 'snacks');
      }
    );

    return () => unsubscribe();
  }, []);

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

    try {
      await addDoc(collection(db, 'snacks'), payload);
      setCooldownRemaining(10);
      setNotification(`[Accession "${newSnackData.name}" committed to Firestore archive]`);
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

      setNotification(`[Rating ${ratingValue}★ recorded · Locked for this browser]`);
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
    <div className="min-h-screen bg-[#E5E4DF] text-[#161616] p-4 sm:p-6 md:p-8 selection:bg-[#161616] selection:text-[#E5E4DF]">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#161616] text-[#E5E4DF] font-mono-tabular text-xs px-4 py-3 shadow-[4px_4px_0px_rgba(0,0,0,0.2)] flex items-center gap-3">
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
        />

        {/* Content routing */}
        {viewMode === 'about' ? (
          <AboutSection onBackToIndex={() => setViewMode('index')} />
        ) : (
          <main>
            {/* Monumental SNACKS Hero */}
            <Hero />

            {/* Curatorial Manifesto */}
            <Manifesto />

            {/* Filter Bar with category & search */}
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

            {/* Index List or Gallery Grid */}
            {isLoading ? (
              <div className="border border-[#161616] py-16 text-center">
                <div className="font-mono-tabular text-sm uppercase tracking-wider animate-pulse">
                  [Loading Firestore Archive Records...]
                </div>
              </div>
            ) : viewMode === 'index' ? (
              <SnackIndexList
                snacks={filteredAndSortedSnacks}
                onSelectSnack={setSelectedSnack}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                userRatings={userRatings}
                onRateSnack={handleRateSnack}
              />
            ) : (
              <SnackGalleryView
                snacks={filteredAndSortedSnacks}
                onSelectSnack={setSelectedSnack}
                onOpenAddModal={() => setIsAddModalOpen(true)}
                userRatings={userRatings}
                onRateSnack={handleRateSnack}
              />
            )}

            {/* Summary & Ledger Footer */}
            <SummarySection
              snacks={snacks}
              isLoading={isLoading}
            />
          </main>
        )}

        {/* Detail Inspection Modal (Read-Only) */}
        <SnackDetailModal
          snack={selectedSnack}
          indexNumber={selectedIndexNumber}
          onClose={() => setSelectedSnack(null)}
          userRating={selectedSnack ? (userRatings[selectedSnack.id] ?? null) : null}
          onRateSnack={handleRateSnack}
        />

        {/* Intake Add Snack Modal */}
        <AddSnackModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddSnack={handleAddSnack}
          cooldownRemaining={cooldownRemaining}
        />
      </div>
    </div>
  );
}
