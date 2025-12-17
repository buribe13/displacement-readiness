/**
 * DASHBOARD PAGE
 *
 * Main situational awareness view for housing/homelessness service organizations.
 *
 * LAYOUT:
 * - Left (2/3 width): Interactive map of Koreatown with signal overlays
 * - Right (1/3 width): Tabbed panel with Signal Feed and Context/Guidance
 *
 * ETHICAL DESIGN PRINCIPLES IMPLEMENTED:
 *
 * 1. DELAYED/SIMULATED DATA ONLY
 *    All data displayed is either simulated (for this prototype) or would be
 *    delayed by 24+ hours in production. This prevents use as a real-time
 *    surveillance or targeting tool.
 *
 * 2. AGGREGATE SIGNALS, NOT INDIVIDUALS
 *    The dashboard tracks institutional activity (cleanups, permits, closures)
 *    and environmental patterns - never individual people or their locations.
 *
 * 3. CONTEXTUAL INTERPRETATION
 *    Raw data without context is dangerous. Every signal includes interpretation
 *    to help organizations understand what it means for their work.
 *
 * 4. GEOGRAPHIC BOUNDS
 *    The map is intentionally limited to Koreatown to prevent scope creep
 *    toward city-wide surveillance capabilities.
 *
 * 5. PERSISTENT DISCLAIMERS
 *    Users are constantly reminded of the tool's purpose and limitations.
 */

/**
 * DASHBOARD PAGE
 *
 * Main situational awareness view for housing/homelessness service organizations.
 *
 * LAYOUT:
 * - Left (2/3 width): Interactive map of Koreatown with signal overlays
 * - Right (1/3 width): Tabbed panel with Signal Feed and Context/Guidance
 *
 * ETHICAL DESIGN PRINCIPLES IMPLEMENTED:
 *
 * 1. DELAYED/SIMULATED DATA ONLY
 *    All data displayed is either simulated (for this prototype) or would be
 *    delayed by 24+ hours in production. This prevents use as a real-time
 *    surveillance or targeting tool.
 *
 * 2. AGGREGATE SIGNALS, NOT INDIVIDUALS
 *    The dashboard tracks institutional activity (cleanups, permits, closures)
 *    and environmental patterns - never individual people or their locations.
 *
 * 3. CONTEXTUAL INTERPRETATION
 *    Raw data without context is dangerous. Every signal includes interpretation
 *    to help organizations understand what it means for their work.
 *
 * 4. GEOGRAPHIC BOUNDS
 *    The map is intentionally limited to Koreatown to prevent scope creep
 *    toward city-wide surveillance capabilities.
 *
 * 5. PERSISTENT DISCLAIMERS
 *    Users are constantly reminded of the tool's purpose and limitations.
 */

"use client";

import { useEffect, useState, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPanel } from "@/components/dashboard/MapPanel";
import { SignalFeed } from "@/components/dashboard/SignalFeed";
import { ContextPanel } from "@/components/dashboard/ContextPanel";

import type {
  CivicSignal,
  SignalsResponse,
  SignalsSummary,
} from "@/lib/signals/types";

export default function DashboardPage() {
  const [signals, setSignals] = useState<CivicSignal[]>([]);
  const [summary, setSummary] = useState<SignalsSummary | null>(null);
  const [selectedSignalId, setSelectedSignalId] = useState<
    string | undefined
  >();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch signals and summary on mount
  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch signals and summary in parallel
        const [signalsRes, summaryRes] = await Promise.all([
          fetch("/api/signals"),
          fetch("/api/signals/summary"),
        ]);

        if (!signalsRes.ok || !summaryRes.ok) {
          throw new Error("Failed to fetch data");
        }

        const signalsData: SignalsResponse = await signalsRes.json();
        const summaryData: SignalsSummary = await summaryRes.json();

        setSignals(signalsData.signals);
        setSummary(summaryData);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Unable to load dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  // Handle signal selection (from map or feed)
  const handleSignalSelect = useCallback((signal: CivicSignal) => {
    setSelectedSignalId(signal.id);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/20">
        <div className="text-center p-8 rounded-lg border bg-background">
          <div className="text-sm text-foreground font-medium">
            Loading dashboard...
          </div>
          <div className="text-xs text-muted-foreground mt-2">
            Fetching simulated civic signals
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="text-sm text-destructive">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="text-xs text-muted-foreground mt-2 underline"
          >
            Refresh page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex min-h-0">
      {/* Map Panel - 2/3 width */}
      <div className="flex-[2] min-w-0 h-full">
        <MapPanel
          signals={signals}
          pressureLevel={summary?.pressureLevel}
          onSignalClick={handleSignalSelect}
        />
      </div>

      {/* Side Panel - 1/3 width */}
      <div className="flex-1 min-w-[320px] max-w-[400px] border-l flex flex-col">
        <Tabs defaultValue="signals" className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b h-auto p-0">
            <TabsTrigger
              value="signals"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground px-4 py-2"
            >
              Signals
            </TabsTrigger>
            <TabsTrigger
              value="guidance"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground px-4 py-2"
            >
              Guidance
            </TabsTrigger>
          </TabsList>

          <TabsContent
            value="signals"
            className="flex-1 m-0 data-[state=inactive]:hidden"
          >
            <SignalFeed
              signals={signals}
              selectedSignalId={selectedSignalId}
              onSignalSelect={handleSignalSelect}
            />
          </TabsContent>

          <TabsContent
            value="guidance"
            className="flex-1 m-0 data-[state=inactive]:hidden"
          >
            <ContextPanel summary={summary || undefined} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
