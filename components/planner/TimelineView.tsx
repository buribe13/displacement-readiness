/**
 * TIMELINE VIEW COMPONENT
 *
 * The PRIMARY interface for the Outreach Window Planner.
 * Displays outreach windows in a vertical timeline format.
 *
 * DESIGN PHILOSOPHY:
 * - Time is the dominant dimension (vertical axis = time progression)
 * - Windows are color-coded by type (safer/caution/high disruption)
 * - Colors are intentionally muted to avoid alarming visuals
 * - Plain-language explanations are always visible
 *
 * ACCESSIBILITY:
 * - Uses semantic HTML for screen readers
 * - Color is not the only indicator (text labels included)
 * - Interactive elements have clear focus states
 * - WCAG 2.1 AA compliant color contrast
 */

"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import type { TemporalSignal } from "@/lib/temporal/types";
import type { OutreachWindow, WindowType } from "@/lib/temporal/aggregate";

/**
 * Window type styling configuration.
 * Colors are intentionally muted for calm, operational aesthetic.
 */
const WINDOW_STYLES: Record<
  WindowType,
  { bg: string; border: string; label: string; description: string }
> = {
  safer: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    label: "Safer Window",
    description: "Good conditions for outreach",
  },
  caution: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    label: "Caution",
    description: "Moderate activity expected",
  },
  highDisruption: {
    bg: "bg-stone-100 dark:bg-stone-900/50",
    border: "border-stone-300 dark:border-stone-700",
    label: "High Disruption",
    description: "Consider alternative timing",
  },
};

interface TimelineViewProps {
  windows: OutreachWindow[];
  signals: TemporalSignal[];
  selectedWindowId?: string;
  onWindowSelect: (windowId: string | undefined) => void;
  scenarioMode: boolean;
  onScenarioModeChange: (enabled: boolean) => void;
}

export function TimelineView({
  windows,
  signals,
  selectedWindowId,
  onWindowSelect,
  scenarioMode,
  onScenarioModeChange,
}: TimelineViewProps) {
  const [expandedWindows, setExpandedWindows] = useState<Set<string>>(
    new Set()
  );

  // Group windows by day for better visualization
  const windowsByDay = groupWindowsByDay(windows);

  const toggleExpanded = (windowId: string) => {
    const newExpanded = new Set(expandedWindows);
    if (newExpanded.has(windowId)) {
      newExpanded.delete(windowId);
    } else {
      newExpanded.add(windowId);
    }
    setExpandedWindows(newExpanded);
  };

  // Find signals for a window
  const getWindowSignals = (window: OutreachWindow): TemporalSignal[] => {
    return signals.filter((s) => window.driverSignalIds.includes(s.id));
  };

  return (
    <div className="p-4 space-y-4">
      {/* Header with controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Outreach Windows</h2>
          <p className="text-sm text-muted-foreground">
            Time-based view of outreach conditions
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Scenario Mode Toggle */}
          <div className="flex items-center gap-2">
            <Switch
              id="scenario-mode"
              checked={scenarioMode}
              onCheckedChange={onScenarioModeChange}
            />
            <label
              htmlFor="scenario-mode"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Scenario Mode
            </label>
            {scenarioMode && (
              <Badge
                variant="outline"
                className="text-xs bg-amber-50 dark:bg-amber-950/50"
              >
                Speculative
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Scenario Mode Warning */}
      {scenarioMode && (
        <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800">
          <CardContent className="py-3">
            <p className="text-sm">
              <strong>Scenario Mode Active:</strong> Showing speculative
              adjustments for major event planning. Windows are compressed to
              simulate reduced outreach capacity. Use for planning exercises
              only.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-sm">
        {(Object.keys(WINDOW_STYLES) as WindowType[]).map((type) => (
          <div key={type} className="flex items-center gap-2">
            <div
              className={`w-4 h-4 rounded ${WINDOW_STYLES[type].bg} ${WINDOW_STYLES[type].border} border`}
            />
            <span className="text-muted-foreground">
              {WINDOW_STYLES[type].label}
            </span>
          </div>
        ))}
      </div>

      <Separator />

      {/* Timeline */}
      <div className="space-y-6">
        {Object.entries(windowsByDay).map(([dayKey, dayWindows]) => (
          <div key={dayKey} className="space-y-3">
            {/* Day Header */}
            <div className="sticky top-0 bg-background/95 backdrop-blur-sm py-2 z-10">
              <h3 className="text-sm font-medium">{formatDayHeader(dayKey)}</h3>
            </div>

            {/* Windows for this day */}
            <div className="space-y-2 pl-4 border-l-2 border-muted">
              {dayWindows.map((window) => {
                const isExpanded = expandedWindows.has(window.id);
                const isSelected = selectedWindowId === window.id;
                const windowSignals = getWindowSignals(window);
                const style = WINDOW_STYLES[window.windowType];

                return (
                  <Card
                    key={window.id}
                    className={`
                      ${style.bg} ${style.border}
                      ${isSelected ? "ring-2 ring-ring" : ""}
                      transition-all cursor-pointer hover:shadow-md
                    `}
                    onClick={() =>
                      onWindowSelect(isSelected ? undefined : window.id)
                    }
                  >
                    <CardHeader className="py-3 px-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="text-xs font-normal"
                            >
                              {formatTimeRange(window.timeRange)}
                            </Badge>
                            <Badge
                              variant={
                                window.windowType === "safer"
                                  ? "default"
                                  : "secondary"
                              }
                              className="text-xs"
                            >
                              {style.label}
                            </Badge>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Badge variant="outline" className="text-xs">
                                  {window.confidenceSummary}
                                </Badge>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Data confidence level</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <CardTitle className="text-sm font-medium">
                            {style.description}
                          </CardTitle>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExpanded(window.id);
                          }}
                        >
                          {isExpanded ? "Less" : "More"}
                        </Button>
                      </div>
                    </CardHeader>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <CardContent className="pt-0 px-4 pb-4 space-y-3">
                        <Separator />

                        {/* Why explanation */}
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {window.plainLanguageWhy}
                          </p>
                        </div>

                        {/* Suggested approach */}
                        <div className="bg-background/50 rounded-md p-3">
                          <p className="text-xs font-medium mb-1">
                            Suggested Approach
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {window.suggestedApproach}
                          </p>
                        </div>

                        {/* Contributing signals */}
                        {windowSignals.length > 0 && (
                          <div>
                            <p className="text-xs font-medium mb-2">
                              Contributing Signals ({windowSignals.length})
                            </p>
                            <div className="space-y-1">
                              {windowSignals.slice(0, 3).map((signal) => (
                                <div
                                  key={signal.id}
                                  className="text-xs text-muted-foreground flex items-center gap-2"
                                >
                                  <Badge
                                    variant="outline"
                                    className="text-xs py-0"
                                  >
                                    {signal.impactLevel}
                                  </Badge>
                                  <span className="truncate">
                                    {signal.description}
                                  </span>
                                </div>
                              ))}
                              {windowSignals.length > 3 && (
                                <p className="text-xs text-muted-foreground">
                                  +{windowSignals.length - 3} more signals
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {windows.length === 0 && (
        <Card className="bg-muted/30">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              No outreach windows computed for this time period.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Footer disclaimer */}
      <Card className="bg-muted/30 border-muted">
        <CardContent className="py-3">
          <p className="text-xs text-muted-foreground text-center">
            All windows are derived from simulated, delayed data (24h+). Use for
            planning and coordination, not real-time decisions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Group windows by day for organized display.
 */
function groupWindowsByDay(
  windows: OutreachWindow[]
): Record<string, OutreachWindow[]> {
  const groups: Record<string, OutreachWindow[]> = {};

  for (const window of windows) {
    const startDate = new Date(window.timeRange.start);
    const dayKey = startDate.toISOString().split("T")[0];

    if (!groups[dayKey]) {
      groups[dayKey] = [];
    }
    groups[dayKey].push(window);
  }

  return groups;
}

/**
 * Format a day key into a human-readable header.
 */
function formatDayHeader(dayKey: string): string {
  const date = new Date(dayKey);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  if (date.toDateString() === today.toDateString()) {
    return "Today";
  }
  if (date.toDateString() === tomorrow.toDateString()) {
    return "Tomorrow";
  }

  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
}

/**
 * Format a time range for display.
 */
function formatTimeRange(timeRange: { start: string; end: string }): string {
  const start = new Date(timeRange.start);
  const end = new Date(timeRange.end);

  const startTime = start.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  const endTime = end.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  // If same day
  if (start.toDateString() === end.toDateString()) {
    return `${startTime} - ${endTime}`;
  }

  // Multi-day
  return `${startTime} - ${end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} ${endTime}`;
}
