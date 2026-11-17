'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiFetch, getStoredToken, setStoredToken } from '@/lib/api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  roles: string[];
  customerProfile?: {
    companyName?: string | null;
    gstNumber?: string | null;
    alternatePhone?: string | null;
  } | null;
}

export interface CartItem {
  id: string;
  type: 'PRODUCT' | 'REFURBISHED';
  name: string;
  sku: string;
  slug: string;
  price: number;
  quantity: number;
  maxStock: number;
  imageUrl?: string;
}

interface AppContextValue {
  user: AuthUser | null;
  loadingAuth: boolean;
  setSession: (user: AuthUser | null, token?: string | null) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  updateCartQuantity: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  toast: { message: string; type: 'success' | 'error' } | null;
  notify: (message: string, type?: 'success' | 'error') => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(
    null,
  );

  const notify = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  };

  const refreshUser = async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setLoadingAuth(false);
      return;
    }
    try {
      const me = await apiFetch<AuthUser>('/auth/me');
      setUser(me);
    } catch {
      setStoredToken(null);
      setUser(null);
    } finally {
      setLoadingAuth(false);
    }
  };

  useEffect(() => {
    refreshUser();
    try {
      const savedCart = window.localStorage.getItem('kiran_cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem('kiran_cart', JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  const setSession = (nextUser: AuthUser | null, token?: string | null) => {
    if (token !== undefined) {
      setStoredToken(token);
    }
    setUser(nextUser);
  };

  const logout = async () => {
    try {
      await apiFetch('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setStoredToken(null);
    setUser(null);
    notify('Signed out successfully');
  };

  const addToCart = (item: Omit<CartItem, 'quantity'>, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id && i.type === item.type);
      if (existing) {
        const nextQty = Math.min(item.maxStock, existing.quantity + qty);
        return prev.map((i) =>
          i.id === item.id && i.type === item.type ? { ...i, quantity: nextQty } : i,
        );
      }
      return [...prev, { ...item, quantity: Math.min(item.maxStock, qty) }];
    });
    notify(`Added "${item.name}" to order request cart`);
  };

  const updateCartQuantity = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.min(item.maxStock, qty) }
          : item,
      ),
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <AppContext.Provider
      value={{
        user,
        loadingAuth,
        setSession,
        refreshUser,
        logout,
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
        toast,
        notify,
      }}
    >
      {children}
      {toast && (
        <div className="fixed bottom-20 right-6 z-50 max-w-sm rounded-lg border px-4 py-3 shadow-lg transition-all bg-slate-900 text-white border-slate-700 flex items-center gap-3">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              toast.type === 'error' ? 'bg-red-500' : 'bg-emerald-400'
            }`}
          />
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
