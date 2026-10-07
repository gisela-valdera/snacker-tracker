export type SnackCategory = 'all' | 'sweet' | 'savoury' | 'fruit' | 'drink' | 'other';

export interface Snack {
  id: string;
  name: string;
  broughtBy: string;
  origin: string;
  region?: string;
  dateBroughtIn: string; // YYYY-MM-DD
  category: 'sweet' | 'savoury' | 'fruit' | 'drink' | 'other';
  ratingSum?: number;
  ratingCount?: number;
  notes?: string;
  createdAt: any; // Firestore Timestamp or Date
}

export type ViewMode = 'index' | 'gallery' | 'about';
export type SortField = 'dateBroughtIn' | 'name' | 'origin' | 'rating' | 'ratingCount';
export type SortDirection = 'asc' | 'desc';
