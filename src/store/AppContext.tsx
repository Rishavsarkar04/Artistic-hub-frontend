import React, { createContext, useContext, useReducer } from 'react';
import type { AppState, AppAction } from '../types';
import { mockOrders } from '../data/products';

// Navigation lives in the URL (see src/router.tsx); the cart and session live in src/stores/.
const initialState: AppState = {
  orders: mockOrders as AppState['orders'],
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'PLACE_ORDER':
      return { ...state, orders: [action.order, ...state.orders] };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
