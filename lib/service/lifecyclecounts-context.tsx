// lib/service/lifecyclecounts-context.tsx
"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Counts = { upcoming: number; today: number; past: number };

type LifecycleCountsContextType = {
  counts: Counts;
  setCounts: React.Dispatch<React.SetStateAction<Counts>>;
  decrementCount: (category: keyof Counts) => void;
  
};

const LifecycleCountsContext = createContext<LifecycleCountsContextType | null>(null);

export function LifecycleCountsProvider({ children }: { children: ReactNode }) {
  const [counts, setCounts] = useState<Counts>({ upcoming: 0, today: 0, past: 0 });

  // initial fetch
  useEffect(() => {
    async function fetchCounts() {
      try {
        const res = await fetch("/api/lifecycle/counts");
        const data = await res.json();
        setCounts(data);
      } catch (err) {
        console.error("Failed to fetch lifecycle counts", err);
      }
    }
    fetchCounts();
  }, []);

  const decrementCount = (category: keyof Counts) => {
    setCounts((prev) => ({ ...prev, [category]: Math.max(0, prev[category] - 1) }));
  };

  return (
    <LifecycleCountsContext.Provider value={{ counts, setCounts, decrementCount }}>
      {children}
    </LifecycleCountsContext.Provider>
  );
}

export function useLifecycleCounts() {
  const context = useContext(LifecycleCountsContext);
  if (!context) throw new Error("useLifecycleCounts must be used inside provider");
  return context;
}