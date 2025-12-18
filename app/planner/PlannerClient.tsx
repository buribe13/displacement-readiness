/**
 * PLANNER CLIENT COMPONENT
 *
 * Handles client-side interactivity for the Outreach Window Planner.
 * Simplified Cursor-style layout with top bar actions and alerts panel.
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar, ViewType } from "@/components/shell/Sidebar";
import { TimelineView } from "@/components/planner/TimelineView";
import { OverlapViewer } from "@/components/planner/OverlapViewer";
import { GuidancePanel } from "@/components/planner/GuidancePanel";
import { ContextualMapView } from "@/components/planner/ContextualMapView";
import { AlertsPanel } from "@/components/planner/AlertsPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { RefreshCw, Download, Moon, Sun, Bell } from "lucide-react";
import { useAlerts } from "@/lib/alerts/useAlerts";
import type { AlertDraft } from "@/lib/alerts/types";

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
}: PlannerClientProps) {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<ViewType>("timeline");
  const [selectedWindowId, setSelectedWindowId] = useState<
    string | undefined
  >();
  const [scenarioMode, setScenarioMode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    // Initialize from system preference (runs only on client)
    if (typeof window !== "undefined") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });
  const [filterType, setFilterType] = useState<string | null>(null);

  // Alerts state
  const [alertsOpen, setAlertsOpen] = useState(false);
  const [alertDraft, setAlertDraft] = useState<AlertDraft | null>(null);
  const [alertCount, setAlertCount] = useState(0);

  // Load alert count after hydration (client-only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("outreachPlanner.alerts.v1");
        if (stored) {
          const alerts = JSON.parse(stored);
          const count = alerts.filter((a: any) => a.status === "open").length;
          setAlertCount(count);
        }
      } catch (e) {
        // Ignore errors
      }
    }
  }, [alertsOpen]); // Reload when panel closes

  // Find the selected window for guidance panel
  const selectedWindow = selectedWindowId
    ? initialWindows.find((w) => w.id === selectedWindowId)
    : undefined;

  // Filter windows based on selected filter type
  const filteredWindows = filterType
    ? initialWindows.filter((w) => w.windowType === filterType)
    : initialWindows;

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Handle view change
  const handleViewChange = useCallback(
    (view: ViewType) => {
      console.log("=== VIEW CHANGE ===");
      console.log("Changing view to:", view);
      console.log("Current view before:", currentView);
      setCurrentView(view);
      console.log("setState called");
    },
    [currentView]
  );

  // Handle window selection from any view
  const handleWindowSelect = useCallback((windowId: string | undefined) => {
    setSelectedWindowId(windowId);
  }, []);

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
    router.refresh();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  }, [router]);

  // Toggle dark mode
  const toggleDarkMode = useCallback(() => {
    setDarkMode((prev) => !prev);
  }, []);

  // Handle creating an alert (opens panel with prefilled draft)
  const handleCreateAlert = useCallback((draft: AlertDraft) => {
    setAlertDraft(draft);
    setAlertsOpen(true);
  }, []);

  // Clear draft after it's been consumed
  const handleDraftConsumed = useCallback(() => {
    setAlertDraft(null);
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
            onCreateAlert={handleCreateAlert}
          />
        );
      case "overlaps":
        return (
          <OverlapViewer
            overlaps={initialOverlaps}
            signals={initialSignals}
            onCreateAlert={handleCreateAlert}
          />
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
            onCreateAlert={handleCreateAlert}
          />
        );
      default:
        return null;
    }
  };

  // Get view title and subtitle
  const getViewInfo = () => {
    switch (currentView) {
      case "timeline":
        return { title: "Timeline", subtitle: "Outreach windows by time" };
      case "overlaps":
        return {
          title: "Overlaps",
          subtitle: "When multiple signals coincide",
        };
      case "guidance":
        return { title: "Guidance", subtitle: "Planning suggestions" };
      case "map":
        return { title: "Map", subtitle: "Geographic context" };
      default:
        return { title: "", subtitle: "" };
    }
  };

  const viewInfo = getViewInfo();

  return (
    <>
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onViewChange={handleViewChange}
        overlapsCount={initialOverlaps.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-14 border-b bg-background flex items-center justify-between px-6 shrink-0">
          <div>
            <h1 className="text-sm font-medium">{viewInfo.title}</h1>
            <p className="text-xs text-muted-foreground">{viewInfo.subtitle}</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh data</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleExport}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export data</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={toggleDarkMode}
                >
                  {darkMode ? (
                    <Sun className="h-4 w-4" />
                  ) : (
                    <Moon className="h-4 w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {darkMode ? "Light mode" : "Dark mode"}
              </TooltipContent>
            </Tooltip>

            <div className="w-px h-6 bg-border mx-2" />

            {/* Alerts toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={alertsOpen ? "secondary" : "ghost"}
                  size="icon"
                  className="h-8 w-8 relative"
                  onClick={() => setAlertsOpen(!alertsOpen)}
                >
                  <Bell className="h-4 w-4" />
                  {alertCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                    >
                      {alertCount > 9 ? "9+" : alertCount}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {alertsOpen ? "Close alerts" : "Open alerts"}
              </TooltipContent>
            </Tooltip>

            <span className="ml-3 text-xs text-muted-foreground">
              {initialWindows.length} windows
            </span>
          </div>
        </header>

        {/* Content Area with optional Alerts Panel */}
        <div className="flex-1 flex min-h-0 min-w-0 overflow-hidden">
          <div className="flex-1 overflow-auto">{renderContent()}</div>

          {/* Alerts Panel */}
          <AlertsPanel
            isOpen={alertsOpen}
            onClose={() => setAlertsOpen(false)}
            draft={alertDraft}
            onDraftConsumed={handleDraftConsumed}
          />
        </div>

        {/* Minimal Footer */}
        <footer className="border-t px-6 py-2 shrink-0">
          <p className="text-xs text-muted-foreground text-center">
            Simulated data (24h+ delay) · For outreach planning only
          </p>
        </footer>
      </main>
    </>
  );
}
