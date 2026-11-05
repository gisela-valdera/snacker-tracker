import React, { useState, useEffect, useMemo } from 'react';
import { Snack } from '../types.ts';

interface AddSnackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSnack: (snack: Omit<Snack, 'id' | 'createdAt'>) => Promise<boolean>;
  cooldownRemaining: number;
}

export const AddSnackModal: React.FC<AddSnackModalProps> = ({
  isOpen,
  onClose,
  onAddSnack,
  cooldownRemaining,
}) => {
  const getTodayISO = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const [name, setName] = useState('');
  const [broughtBy, setBroughtBy] = useState('');
  const [origin, setOrigin] = useState('');
  const [region, setRegion] = useState('');
  const [dateBroughtIn, setDateBroughtIn] = useState(getTodayISO);
  const [category, setCategory] = useState<'sweet' | 'savoury' | 'fruit' | 'drink' | 'other'>('sweet');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Clear validation messages and reset errors when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setError(null);
    }
  }, [isOpen]);

  // Formatted date preview in DD/MM/YYYY
  const formattedDatePreview = useMemo(() => {
    if (!dateBroughtIn) return '';
    const parts = dateBroughtIn.split('-');
    if (parts.length === 3) {
      const [yyyy, mm, dd] = parts;
      return `${dd}/${mm}/${yyyy}`;
    }
    return '';
  }, [dateBroughtIn]);

  if (!isOpen) return null;

  const isValidRealDate = (val: string): boolean => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(val)) return false;
    const [yearStr, monthStr, dayStr] = val.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);

    if (year < 1900 || year > 2100) return false;
    if (month < 1 || month > 12) return false;

    // Check days in month
    const dateObj = new Date(year, month - 1, day);
    return (
      dateObj.getFullYear() === year &&
      dateObj.getMonth() === month - 1 &&
      dateObj.getDate() === day
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (cooldownRemaining > 0) {
      setError(`Submission cooldown active. Please wait ${cooldownRemaining}s before logging another item.`);
      return;
    }

    const trimmedName = name.trim();
    if (trimmedName.length < 1 || trimmedName.length > 60) {
      setError('Snack name must be between 1 and 60 characters.');
      return;
    }

    const trimmedBroughtBy = broughtBy.trim();
    if (trimmedBroughtBy.length < 1 || trimmedBroughtBy.length > 40) {
      setError('Contributor first name must be between 1 and 40 characters.');
      return;
    }

    const trimmedOrigin = origin.trim();
    if (trimmedOrigin.length < 1 || trimmedOrigin.length > 60) {
      setError('Origin country must be between 1 and 60 characters.');
      return;
    }

    const trimmedRegion = region.trim();
    if (trimmedRegion.length > 60) {
      setError('City/region must be 60 characters or fewer.');
      return;
    }

    if (!isValidRealDate(dateBroughtIn)) {
      setError('Please provide a valid date brought in (DD/MM/YYYY).');
      return;
    }

    const trimmedNotes = notes.trim();
    if (trimmedNotes.length > 200) {
      setError('Notes must be 200 characters or fewer.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onAddSnack({
        name: trimmedName,
        broughtBy: trimmedBroughtBy,
        origin: trimmedOrigin,
        region: trimmedRegion || undefined,
        dateBroughtIn,
        category,
        ratingSum: 0,
        ratingCount: 0,
        notes: trimmedNotes || undefined,
      });

      if (success) {
        setName('');
        setBroughtBy('');
        setOrigin('');
        setRegion('');
        setDateBroughtIn(getTodayISO());
        setNotes('');
        setError(null);
        onClose();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to commit entry to Firestore.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-xl max-h-[92vh] overflow-y-auto bg-[var(--card-bg)] text-[var(--fg)] border-2 border-[var(--border-color)] shadow-[var(--overlay-shadow)] p-6 md:p-8"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border-color)] pb-3 mb-6 font-mono-tabular text-xs">
          <div className="font-bold uppercase tracking-wider">
            Curatorial Intake // New Snack Entry
          </div>
          <button
            onClick={onClose}
            type="button"
            className="cursor-pointer font-bold hover:underline uppercase text-sm"
          >
            [Close ✕]
          </button>
        </div>

        {/* Cooldown Alert */}
        {cooldownRemaining > 0 && (
          <div className="p-3 mb-4 bg-[var(--fg)] text-[var(--bg)] text-xs font-mono-tabular flex items-center justify-between">
            <span>COOLDOWN ACTIVE: Anti-spam rate limit</span>
            <span className="font-bold">{cooldownRemaining}s remaining</span>
          </div>
        )}

        {/* Validation Error Banner */}
        {error && (
          <div className="p-3 mb-4 border border-[var(--border-color)] bg-red-100/90 text-red-950 dark:bg-red-950/60 dark:text-red-200 dark:border-red-700 text-xs font-mono-tabular flex items-center justify-between">
            <span>[ERROR] {error}</span>
            <button
              onClick={() => setError(null)}
              type="button"
              className="font-bold hover:underline ml-2"
            >
              [Dismiss]
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex justify-between items-center text-[11px] font-mono-tabular uppercase tracking-wider opacity-70 mb-1">
              <label htmlFor="snack-name">Snack Name *</label>
              <span>{name.length}/60</span>
            </div>
            <input
              id="snack-name"
              type="text"
              required
              maxLength={60}
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              placeholder="e.g. Salted Egg Yolk Fish Skin Crisps"
              className="brutalist-input"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center text-[11px] font-mono-tabular uppercase tracking-wider opacity-70 mb-1">
                <label htmlFor="donor-name">Brought By (First Name) *</label>
                <span>{broughtBy.length}/40</span>
              </div>
              <input
                id="donor-name"
                type="text"
                required
                maxLength={40}
                value={broughtBy}
                onChange={(e) => {
                  setBroughtBy(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. Alice"
                className="brutalist-input"
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-[11px] font-mono-tabular uppercase tracking-wider opacity-70 mb-1">
                <label htmlFor="date-brought-in">Date Brought In *</label>
                <span className="font-bold text-[var(--fg)]">
                  {formattedDatePreview ? `[${formattedDatePreview}]` : ''}
                </span>
              </div>
              <input
                id="date-brought-in"
                type="date"
                required
                value={dateBroughtIn}
                onChange={(e) => {
                  setDateBroughtIn(e.target.value);
                  setError(null);
                }}
                className="brutalist-input font-mono-tabular"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between items-center text-[11px] font-mono-tabular uppercase tracking-wider opacity-70 mb-1">
                <label htmlFor="origin-country">Origin Country *</label>
                <span>{origin.length}/60</span>
              </div>
              <input
                id="origin-country"
                type="text"
                required
                maxLength={60}
                value={origin}
                onChange={(e) => {
                  setOrigin(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. Singapore"
                className="brutalist-input"
              />
            </div>

            <div>
              <div className="flex justify-between items-center text-[11px] font-mono-tabular uppercase tracking-wider opacity-70 mb-1">
                <label htmlFor="origin-region">City or Region (Optional)</label>
                <span>{region.length}/60</span>
              </div>
              <input
                id="origin-region"
                type="text"
                maxLength={60}
                value={region}
                onChange={(e) => {
                  setRegion(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. Chinatown, Tokyo, Oaxaca"
                className="brutalist-input"
              />
            </div>
          </div>

          <div>
            <label htmlFor="snack-category" className="block text-[11px] font-mono-tabular uppercase tracking-wider opacity-70 mb-1">
              Category *
            </label>
            <select
              id="snack-category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as any);
                setError(null);
              }}
              className="brutalist-input bg-transparent cursor-pointer"
            >
              <option value="sweet" className="bg-[var(--bg)] text-[var(--fg)]">Sweet</option>
              <option value="savoury" className="bg-[var(--bg)] text-[var(--fg)]">Savoury</option>
              <option value="fruit" className="bg-[var(--bg)] text-[var(--fg)]">Fruit</option>
              <option value="drink" className="bg-[var(--bg)] text-[var(--fg)]">Drink</option>
              <option value="other" className="bg-[var(--bg)] text-[var(--fg)]">Other</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center text-[11px] font-mono-tabular uppercase tracking-wider opacity-70 mb-1">
              <label htmlFor="snack-notes">Tasting Notes (Optional)</label>
              <span>{notes.length}/200</span>
            </div>
            <textarea
              id="snack-notes"
              rows={2}
              maxLength={200}
              value={notes}
              onChange={(e) => {
                setNotes(e.target.value);
                setError(null);
              }}
              placeholder="Flavour notes, textures, pairing comments..."
              className="brutalist-input resize-none"
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[var(--border-color)]">
            <button
              type="button"
              onClick={onClose}
              className="brutalist-btn-outline text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || cooldownRemaining > 0}
              className={`brutalist-btn text-xs ${
                cooldownRemaining > 0 || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting
                ? 'Committing...'
                : cooldownRemaining > 0
                ? `Wait (${cooldownRemaining}s)`
                : '+ Commit To Cloud'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
