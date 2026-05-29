import { create } from 'zustand';
import { TravelBoard, SavedActivity, TravelPriority } from '@/types';

interface TravelStore {
  currentBoard: TravelBoard | null;
  savedBoards: TravelBoard[];
  favorites: string[];
  theme: 'light' | 'dark';
  savedActivities: SavedActivity[];
  
  setCurrentBoard: (board: TravelBoard) => void;
  saveBoard: (board: TravelBoard) => void;
  toggleFavorite: (destinationId: string) => void;
  toggleTheme: () => void;
  updatePackingItem: (itemId: string, checked: boolean) => void;
  clearCurrentBoard: () => void;
  
  // New activity management methods
  addActivity: (activity: SavedActivity) => void;
  removeActivity: (activityId: string) => void;
  updateActivityPriority: (activityId: string, priority: TravelPriority) => void;
  clearActivities: () => void;
  getTotalBudget: () => number;
}

export const useTravelStore = create<TravelStore>((set, get) => ({
  currentBoard: null,
  savedBoards: [],
  favorites: [],
  theme: 'dark',
  savedActivities: [],
  
  setCurrentBoard: (board) => set({ currentBoard: board }),
  
  saveBoard: (board) => set((state) => ({
    savedBoards: [board, ...state.savedBoards.filter(b => b.id !== board.id)].slice(0, 10),
  })),
  
  toggleFavorite: (destinationId) => set((state) => ({
    favorites: state.favorites.includes(destinationId)
      ? state.favorites.filter(id => id !== destinationId)
      : [...state.favorites, destinationId],
  })),
  
  toggleTheme: () => set((state) => ({
    theme: state.theme === 'light' ? 'dark' : 'light',
  })),
  
  updatePackingItem: (itemId, checked) => set((state) => {
    if (!state.currentBoard) return state;
    
    return {
      currentBoard: {
        ...state.currentBoard,
        packingList: state.currentBoard.packingList.map(item =>
          item.id === itemId ? { ...item, checked } : item
        ),
      },
    };
  }),
  
  clearCurrentBoard: () => set({ currentBoard: null, savedActivities: [] }),
  
  // Activity management
  addActivity: (activity) => set((state) => ({
    savedActivities: [...state.savedActivities, activity],
  })),
  
  removeActivity: (activityId) => set((state) => ({
    savedActivities: state.savedActivities.filter(a => a.id !== activityId),
  })),
  
  updateActivityPriority: (activityId, priority) => set((state) => ({
    savedActivities: state.savedActivities.map(a =>
      a.id === activityId ? { ...a, priority } : a
    ),
  })),
  
  clearActivities: () => set({ savedActivities: [] }),
  
  getTotalBudget: () => {
    const state = get();
    return state.savedActivities.reduce((total, activity) => total + activity.estimatedCost, 0);
  },
}));
