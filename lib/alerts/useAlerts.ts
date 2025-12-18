"use client";

/**
 * ALERTS HOOK
 *
 * Manages outreach alerts with localStorage persistence.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { OutreachAlert, AlertDraft, AlertStatus } from "./types";
import { createAlertFromDraft } from "./types";

const STORAGE_KEY = "outreachPlanner.alerts.v1";

/**
 * Load alerts from localStorage.
 */
function loadAlerts(): OutreachAlert[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error("Failed to load alerts:", e);
  }
  return [];
}

/**
 * Save alerts to localStorage.
 */
function saveAlerts(alerts: OutreachAlert[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  } catch (e) {
    console.error("Failed to save alerts:", e);
  }
}

/**
 * Hook for managing outreach alerts.
 */
export function useAlerts() {
  // Start with empty array to avoid hydration mismatch
  const [alerts, setAlerts] = useState<OutreachAlert[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const loadedRef = useRef(false);

  // Load alerts after mount (client-side only)
  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      const loaded = loadAlerts();
      if (loaded.length > 0) {
        setAlerts(loaded);
      }
      setIsLoaded(true);
    }
  });

  // Save alerts whenever they change (after initial load)
  useEffect(() => {
    if (isLoaded && alerts.length >= 0) {
      saveAlerts(alerts);
    }
  }, [alerts, isLoaded]);

  /**
   * Create a new alert from a draft.
   */
  const createAlert = useCallback((draft: AlertDraft): OutreachAlert => {
    const newAlert = createAlertFromDraft(draft);
    setAlerts((prev) => [newAlert, ...prev]);
    return newAlert;
  }, []);

  /**
   * Update an alert's status.
   */
  const updateStatus = useCallback(
    (alertId: string, status: AlertStatus): void => {
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === alertId ? { ...alert, status } : alert
        )
      );
    },
    []
  );

  /**
   * Toggle an alert's status between open and done.
   */
  const toggleStatus = useCallback((alertId: string): void => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === alertId
          ? { ...alert, status: alert.status === "open" ? "done" : "open" }
          : alert
      )
    );
  }, []);

  /**
   * Delete an alert.
   */
  const deleteAlert = useCallback((alertId: string): void => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== alertId));
  }, []);

  /**
   * Update an alert's notes.
   */
  const updateNotes = useCallback((alertId: string, notes: string): void => {
    setAlerts((prev) =>
      prev.map((alert) => (alert.id === alertId ? { ...alert, notes } : alert))
    );
  }, []);

  /**
   * Get open alerts count.
   */
  const openCount = alerts.filter((a) => a.status === "open").length;

  /**
   * Get alerts sorted by creation date (newest first).
   */
  const sortedAlerts = [...alerts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return {
    alerts: sortedAlerts,
    openCount,
    isLoaded,
    createAlert,
    updateStatus,
    toggleStatus,
    deleteAlert,
    updateNotes,
  };
}
