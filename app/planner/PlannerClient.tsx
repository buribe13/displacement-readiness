/**
 * PLANNER CLIENT COMPONENT
 *
 * Handles client-side interactivity for the Outreach Window Planner.
 * Data is pre-fetched server-side and passed as props.
 *
 * DESIGN PHILOSOPHY:
 * - Dashboard layout with sidebar navigation
 * - Timeline is the PRIMARY interface (default view)
 * - Map is SECONDARY and de-emphasized
 * - All data is clearly labeled as simulated/delayed
 * - Full functionality for all interactive elements
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, ViewType } from "@/components/shell/Sidebar";
import { TimelineView } from "@/components/planner/TimelineView";
import { OverlapViewer } from "@/components/planner/OverlapViewer";
import { GuidancePanel } from "@/components/planner/GuidancePanel";
import { ContextualMapView } from "@/components/planner/ContextualMapView";

import type { TemporalSignal, TemporalSignalsMeta } from "@/lib/temporal/types";
import type { OutreachWindow, SignalOverlap } from "@/lib/temporal/aggregate";

interface PlannerClientProps {
  initialSignals: TemporalSignal[];
  initialWindows: OutreachWindow[];
  initialOverlaps: SignalOverlap[];
  meta: TemporalSignalsMeta;
}

export function PlannerClient({
  initialSignals,
  initialWindows,
  initialOverlaps,
  meta: _meta,
}: PlannerClientProps) {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<ViewType>("timeline");
  const [selectedWindowId, setSelectedWindowId] = useState<
    string | undefined
  >();
  const [scenarioMode, setScenarioMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [filterType, setFilterType] = useState<string | null>(null);

  // Find the selected window for guidance panel
  const selectedWindow = selectedWindowId
    ? initialWindows.find((w) => w.id === selectedWindowId)
    : undefined;

  // Filter windows based on selected filter type
  const filteredWindows = filterType
    ? initialWindows.filter((w) => w.windowType === filterType)
    : initialWindows;

  // Dark mode effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Initialize dark mode from system preference
  useEffect(() => {
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    setDarkMode(prefersDark);
  }, []);

  // Handle view change - sync with guidance panel selection
  const handleViewChange = useCallback((view: ViewType) => {
    setCurrentView(view);
  }, []);

  // Handle window selection from any view
  const handleWindowSelect = useCallback(
    (windowId: string | undefined) => {
      setSelectedWindowId(windowId);
      // If selecting a window from guidance, switch to timeline for details
      if (windowId && currentView === "guidance") {
        // Stay on guidance to show the selected window details
      }
    },
    [currentView]
  );

  // Export data functionality
  const handleExport = useCallback(() => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      windows: initialWindows.map((w) => ({
        id: w.id,
        type: w.windowType,
        timeRange: w.timeRange,
        explanation: w.plainLanguageWhy,
        approach: w.suggestedApproach,
        confidence: w.confidenceSummary,
      })),
      overlaps: initialOverlaps.map((o) => ({
        id: o.id,
        timeRange: o.timeRange,
        impact: o.combinedImpact,
        explanation: o.whyItMatters,
      })),
      signals: initialSignals.map((s) => ({
        id: s.id,
        type: s.signalType,
        description: s.description,
        timeRange: s.timeRange,
        impact: s.impactLevel,
        isSimulated: s.isSimulated,
      })),
      disclaimer:
        "This data is for outreach planning only. All data is simulated or delayed (24h+). Not for surveillance or enforcement.",
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `outreach-windows-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [initialWindows, initialOverlaps, initialSignals]);

  // Refresh data functionality
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    // Use router.refresh() to re-fetch server data
    router.refresh();
    // Simulate a delay for visual feedback
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, [router]);

  // Handle dark mode toggle
  const handleDarkModeChange = useCallback((enabled: boolean) => {
    setDarkMode(enabled);
  }, []);

  // Render current view content
  const renderContent = () => {
    switch (currentView) {
      case "timeline":
        return (
          <TimelineView
            windows={filteredWindows}
            signals={initialSignals}
            selectedWindowId={selectedWindowId}
            onWindowSelect={handleWindowSelect}
            scenarioMode={scenarioMode}
            onScenarioModeChange={setScenarioMode}
            filterType={filterType}
            onFilterChange={setFilterType}
          />
        );
      case "overlaps":
        return (
          <OverlapViewer overlaps={initialOverlaps} signals={initialSignals} />
        );
      case "guidance":
        return (
          <GuidancePanel
            windows={initialWindows}
            selectedWindow={selectedWindow}
            onWindowSelect={handleWindowSelect}
          />
        );
      case "map":
        return (
          <ContextualMapView
            signals={initialSignals}
            windows={initialWindows}
          />
        );
      default:
        return null;
    }
  };

  return (
    <>
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        overlapsCount={initialOverlaps.length}
        onExport={handleExport}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        darkMode={darkMode}
        onDarkModeChange={handleDarkModeChange}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Header Bar */}
        <header className="h-14 border-b bg-card flex items-center justify-between px-6 shrink-0">
          <div>
            <h2 className="text-lg font-semibold capitalize">
              {currentView === "map" ? "Geographic Context" : currentView}
            </h2>
            <p className="text-sm text-muted-foreground">
              {currentView === "timeline" &&
                "Time-based view of outreach conditions"}
              {currentView === "overlaps" &&
                "Periods where multiple signals coincide"}
              {currentView === "guidance" &&
                "Non-prescriptive planning suggestions"}
              {currentView === "map" && "Supplementary geographic context"}
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              {initialWindows.length} windows • {initialSignals.length} signals
            </span>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-auto">{renderContent()}</div>

        {/* Footer Disclaimer */}
        <footer className="border-t bg-muted/30 px-6 py-2 shrink-0">
          <p className="text-xs text-muted-foreground text-center">
            Prototype for demonstration purposes. All data is simulated or
            delayed. Designed for outreach planning, not surveillance or
            enforcement.
          </p>
        </footer>
      </main>
    </>
  );
}
