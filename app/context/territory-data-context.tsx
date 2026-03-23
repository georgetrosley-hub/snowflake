"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import {
  defaultActivities,
  defaultSignals,
  next7Days,
  priorityAccounts,
  type ActivityItem,
  type SignalItem,
} from "@/data/territory-data";

const STORAGE_KEY_ACTIVITIES = "territory-os-activities";
const STORAGE_KEY_SIGNALS = "territory-os-signals";

interface TerritoryDataContextValue {
  activities: ActivityItem[];
  signals: SignalItem[];
  addActivity: (account: string, text: string) => void;
  addSignal: (account: string, text: string) => void;
  next7Days: typeof next7Days;
  priorityAccounts: typeof priorityAccounts;
}

const TerritoryDataContext = createContext<TerritoryDataContextValue | null>(null);

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(key) : null;
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function saveJson(key: string, value: unknown) {
  try {
    typeof window !== "undefined" && localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function TerritoryDataProvider({ children }: { children: React.ReactNode }) {
  const [activities, setActivities] = useState<ActivityItem[]>(defaultActivities);
  const [signals, setSignals] = useState<SignalItem[]>(defaultSignals);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setActivities(loadJson(STORAGE_KEY_ACTIVITIES, defaultActivities));
    setSignals(loadJson(STORAGE_KEY_SIGNALS, defaultSignals));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveJson(STORAGE_KEY_ACTIVITIES, activities);
  }, [activities, hydrated]);

  useEffect(() => {
    if (hydrated) saveJson(STORAGE_KEY_SIGNALS, signals);
  }, [signals, hydrated]);

  const addActivity = useCallback((account: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const item: ActivityItem = {
      timestamp: new Date().toISOString().slice(0, 10),
      account,
      text: trimmed,
    };
    setActivities((prev) => [item, ...prev].slice(0, 20));
  }, []);

  const addSignal = useCallback((account: string, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const item: SignalItem = {
      timestamp: new Date().toISOString().slice(0, 10),
      account,
      text: trimmed,
    };
    setSignals((prev) => [item, ...prev].slice(0, 20));
  }, []);

  const value: TerritoryDataContextValue = {
    activities,
    signals,
    addActivity,
    addSignal,
    next7Days,
    priorityAccounts,
  };

  return (
    <TerritoryDataContext.Provider value={value}>
      {children}
    </TerritoryDataContext.Provider>
  );
}

export function useTerritoryData() {
  const ctx = useContext(TerritoryDataContext);
  if (!ctx) throw new Error("useTerritoryData must be used within TerritoryDataProvider");
  return ctx;
}
