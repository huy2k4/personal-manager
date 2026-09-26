'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

interface RefreshContextType {
  isRefreshing: boolean;
  refreshCount: number;
  triggerRefresh: () => Promise<void>;
  registerRefreshHandler: (id: string, handler: () => Promise<void> | void) => () => void;
}

const RefreshContext = createContext<RefreshContextType>({
  isRefreshing: false,
  refreshCount: 0,
  triggerRefresh: async () => {},
  registerRefreshHandler: () => () => {},
});

export function RefreshProvider({ children }: { children: React.ReactNode }) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshCount, setRefreshCount] = useState(0);
  const handlersRef = useRef<Map<string, () => Promise<void> | void>>(new Map());

  const registerRefreshHandler = useCallback((id: string, handler: () => Promise<void> | void) => {
    handlersRef.current.set(id, handler);
    return () => {
      handlersRef.current.delete(id);
    };
  }, []);

  const triggerRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setRefreshCount((c) => c + 1);

    try {
      // Execute all registered data re-fetch handlers in parallel
      const promises = Array.from(handlersRef.current.values()).map(async (fn) => {
        try {
          await fn();
        } catch {
          // Ignore individual handler error to prevent blocking
        }
      });

      // Ensure at least 650ms so user sees the '---' empty state and smooth spin
      await Promise.all([
        ...promises,
        new Promise((resolve) => setTimeout(resolve, 750)),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  return (
    <RefreshContext.Provider
      value={{
        isRefreshing,
        refreshCount,
        triggerRefresh,
        registerRefreshHandler,
      }}
    >
      {children}
    </RefreshContext.Provider>
  );
}

export function useRefresh() {
  return useContext(RefreshContext);
}
