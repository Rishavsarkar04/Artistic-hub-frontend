import React, { createContext, useContext, useReducer } from 'react';
import type { AppState, AppAction, CartItem } from '../types';
import { mockUser, mockOrders } from '../data/products';

const initialState: AppState = {
  currentPage: 'home',
  currentProductId: null,
  currentOrderId: null,
  accountSection: 'profile',
  authMode: 'login',
  cart: [],
  user: null,
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
        currentProductId: action.productId ?? state.currentProductId,
        currentOrderId: action.orderId ?? state.currentOrderId,
        accountSection: action.accountSection ?? state.accountSection,
        listingCollection: action.page === 'listing' ? action.collection ?? 'All' : state.listingCollection,
        listingScent: action.page === 'listing' ? action.scent ?? null : state.listingScent,
      };
    case 'SET_AUTH_MODE':
      return { ...state, authMode: action.mode };
    case 'LOGIN':
      return { ...state, user: action.user };
    case 'LOGOUT':
      return { ...state, user: null, currentPage: 'home' };
    case 'ADD_TO_CART': {
      const existing = state.cart.findIndex(
        (i) => i.productId === action.item.productId && i.size.label === action.item.size.label
      );
      if (existing >= 0) {
        const cart = [...state.cart];
        cart[existing] = { ...cart[existing], quantity: cart[existing].quantity + action.item.quantity };
        return { ...state, cart };
      }
      return { ...state, cart: [...state.cart, action.item] };
    }
    case 'UPDATE_CART_QTY': {
      const cart = state.cart.map((i) =>
        i.productId === action.productId && i.size.label === action.sizeLabel
          ? { ...i, quantity: action.qty }
          : i
      );
      return { ...state, cart };
    }
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter(
          (i) => !(i.productId === action.productId && i.size.label === action.sizeLabel)
        ),
      };
    case 'CLEAR_CART':
      return { ...state, cart: [] };
    case 'PLACE_ORDER':
      return { ...state, orders: [action.order, ...state.orders], cart: [] };
    case 'UPDATE_USER':
      return { ...state, user: action.user };
    case 'ADD_ADDRESS':
      if (!state.user) return state;
      return {
        ...state,
        user: { ...state.user, addresses: [...state.user.addresses, action.address] },
      };
    case 'UPDATE_ADDRESS':
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          addresses: state.user.addresses.map((a) => (a.id === action.address.id ? action.address : a)),
        },
      };
    case 'DELETE_ADDRESS':
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          addresses: state.user.addresses.filter((a) => a.id !== action.id),
        },
      };
    case 'SET_DEFAULT_ADDRESS':
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          addresses: state.user.addresses.map((a) => ({
            ...a,
            isDefault: a.id === action.id,
          })),
        },
      };
    default:
      return state;
  }
}

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  navigate: (page: AppState['currentPage'], opts?: { productId?: string; orderId?: string; accountSection?: AppState['accountSection']; collection?: string; scent?: string | null }) => void;
  cartCount: number;
  cartTotal: number;
  addToCart: (item: CartItem) => void;
  loginDemo: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const navigate = (
    page: AppState['currentPage'],
    opts?: { productId?: string; orderId?: string; accountSection?: AppState['accountSection']; collection?: string; scent?: string | null }
  ) => {
    dispatch({ type: 'NAVIGATE', page, ...opts });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cartCount = state.cart.reduce((acc, i) => acc + i.quantity, 0);
  const cartTotal = state.cart.reduce((acc, i) => acc + i.size.price * i.quantity, 0);

  const addToCart = (item: CartItem) => dispatch({ type: 'ADD_TO_CART', item });

  const loginDemo = () => dispatch({ type: 'LOGIN', user: mockUser });

  return (
    <AppContext.Provider value={{ state, dispatch, navigate, cartCount, cartTotal, addToCart, loginDemo }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
