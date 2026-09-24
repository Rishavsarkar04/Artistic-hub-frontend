import React, { createContext, useContext, useReducer } from 'react';
import type { AppState, AppAction } from '../types';
import { mockOrders } from '../data/products';

const initialState: AppState = {
  currentPage: 'home',
  previousPage: 'home',
  currentProductId: null,
  currentOrderId: null,
  currentSlug: null,
  accountSection: 'profile',
  authMode: 'login',
  orders: mockOrders as AppState['orders'],
  checkoutPendingProduct: null,
  listingCollection: 'All',
  listingScent: null,
};

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'NAVIGATE':
      return {
        ...state,
        currentPage: action.page,
        previousPage: action.page !== state.currentPage ? state.currentPage : state.previousPage,
        currentProductId: action.productId ?? state.currentProductId,
        currentOrderId: action.orderId ?? state.currentOrderId,
        currentSlug: action.slug ?? state.currentSlug,
        accountSection: action.accountSection ?? state.accountSection,
        listingCollection: action.page === 'listing' ? action.collection ?? 'All' : state.listingCollection,
        listingScent: action.page === 'listing' ? action.scent ?? null : state.listingScent,
      };
    case 'SET_AUTH_MODE':
      return { ...state, authMode: action.mode };
    case 'PLACE_ORDER':
      return { ...state, orders: [action.order, ...state.orders] };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  navigate: (page: AppState['currentPage'], opts?: { productId?: string; orderId?: string; accountSection?: AppState['accountSection']; collection?: string; scent?: string | null; slug?: string }) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const navigate = (
    page: AppState['currentPage'],
    opts?: { productId?: string; orderId?: string; accountSection?: AppState['accountSection']; collection?: string; scent?: string | null; slug?: string }
  ) => {
    dispatch({ type: 'NAVIGATE', page, ...opts });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AppContext.Provider value={{ state, dispatch, navigate }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
