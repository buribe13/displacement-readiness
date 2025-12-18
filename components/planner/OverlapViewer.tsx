/**
 * OVERLAP VIEWER COMPONENT
 *
 * Displays periods where multiple disruptive signals coincide.
 * Explains in plain language why overlaps matter for outreach planning.
 *
 * DESIGN PHILOSOPHY:
 * - Overlaps are often more impactful than individual signals
 * - Plain-language explanations help coordinators understand compound effects
 * - Visual timeline shows overlap duration and participating signals
 *
 * ETHICAL NOTE:
 * Overlaps are about institutional activity patterns, not individuals.
 * We're identifying when multiple disruptions coincide, not predicting
 * harm to specific people.
 */

"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  ChevronUp,
  Copy,
  Calendar,
  Filter,
  SortAsc,
  SortDesc,
  Share2,
  AlertTriangle,
  AlertCircle,
  Info,
} from "lucide-react";

import type { TemporalSignal, ImpactLevel } from "@/lib/temporal/types";
import type { SignalOverlap } from "@/lib/temporal/aggregate";

/**
 * Impact level styling.
 */
const IMPACT_STYLES = {
  low: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    badge: "default" as const,
    icon: Info,
  },
  medium: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    badge: "secondary" as const,
    icon: AlertCircle,
  },
  high: {
    bg: "bg-stone-100 dark:bg-stone-900/50",
    border: "border-stone-300 dark:border-stone-700",
    badge: "outline" as const,
    icon: AlertTriangle,
  },
};

type SortMode = "impact" | "time" | "duration";

interface OverlapViewerProps {
  overlaps: SignalOverlap[];
  signals: TemporalSignal[];
}

export function OverlapViewer({ overlaps, signals }: OverlapViewerProps) {
  const [expandedOverlaps, setExpandedOverlaps] = useState<Set<string>>(
    new Set()
  );
  const [filterImpact, setFilterImpact] = useState<ImpactLevel | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("impact");
  const [sortAsc, setSortAsc] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Create a map of signals by ID for quick lookup
  const signalMap = new Map(signals.map((s) => [s.id, s]));

  // Get the actual signal objects for an overlap
  const getOverlapSignals = (overlap: SignalOverlap): TemporalSignal[] => {
    return overlap.signalIds
      .map((id) => signalMap.get(id))
      .filter((s): s is TemporalSignal => s !== undefined);
  };

  // Filter overlaps
  const filteredOverlaps = filterImpact
    ? overlaps.filter((o) => o.combinedImpact === filterImpact)
    : overlaps;

  // Sort overlaps
  const sortedOverlaps = [...filteredOverlaps].sort((a, b) => {
    let comparison = 0;

    switch (sortMode) {
      case "impact": {
        const impactOrder = { high: 0, medium: 1, low: 2 };
        comparison =
          impactOrder[a.combinedImpact] - impactOrder[b.combinedImpact];
        break;
      }
      case "time":
        comparison =
          new Date(a.timeRange.start).getTime() -
          new Date(b.timeRange.start).getTime();
        break;
      case "duration": {
        const durationA =
          new Date(a.timeRange.end).getTime() -
          new Date(a.timeRange.start).getTime();
        const durationB =
          new Date(b.timeRange.end).getTime() -
          new Date(b.timeRange.start).getTime();
        comparison = durationB - durationA; // Longer first
        break;
      }
    }

    return sortAsc ? -comparison : comparison;
  });

  // Toggle expand
  const toggleExpanded = (overlapId: string) => {
    const newExpanded = new Set(expandedOverlaps);
    if (newExpanded.has(overlapId)) {
      newExpanded.delete(overlapId);
    } else {
      newExpanded.add(overlapId);
    }
    setExpandedOverlaps(newExpanded);
  };

  // Expand/collapse all
  const expandAll = () => {
    setExpandedOverlaps(new Set(sortedOverlaps.map((o) => o.id)));
  };

  const collapseAll = () => {
    setExpandedOverlaps(new Set());
  };

  // Copy overlap details
  const copyOverlapDetails = (overlap: SignalOverlap) => {
    const overlapSignals = getOverlapSignals(overlap);
    const text = `
Signal Overlap - ${overlap.combinedImpact.toUpperCase()} Impact
Time: ${formatTimeRange(overlap.timeRange)}

Why It Matters:
${overlap.whyItMatters}

Overlapping Signals:
${overlapSignals
  .map((s) => `- ${s.description} (${s.impactLevel} impact)`)
  .join("\n")}

Coordination Suggestion:
${generateCoordinationSuggestion(overlap, overlapSignals)}

---
Generated by Outreach Window Planner (simulated data)
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedId(overlap.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Add overlap to calendar
  const addToCalendar = (overlap: SignalOverlap) => {
    const start = new Date(overlap.timeRange.start);
    const end = new Date(overlap.timeRange.end);
    const overlapSignals = getOverlapSignals(overlap);

    const calendarUrl = new URL("https://calendar.google.com/calendar/render");
    calendarUrl.searchParams.set("action", "TEMPLATE");
    calendarUrl.searchParams.set(
      "text",
      `Signal Overlap Alert (${overlap.combinedImpact} impact)`
    );
    calendarUrl.searchParams.set(
      "details",
      `${overlap.whyItMatters}\n\nSignals:\n${overlapSignals
        .map((s) => `- ${s.description}`)
        .join("\n")}\n\n(Generated by Outreach Window Planner - simulated data)`
    );
    calendarUrl.searchParams.set(
      "dates",
      `${formatCalendarDate(start)}/${formatCalendarDate(end)}`
    );
    calendarUrl.searchParams.set("location", "Koreatown, Los Angeles");

    window.open(calendarUrl.toString(), "_blank");
  };

  // Share overlap
  const shareOverlap = async (overlap: SignalOverlap) => {
    const shareData = {
      title: `Signal Overlap - ${overlap.combinedImpact} impact`,
      text: overlap.whyItMatters,
      url: window.location.href,
    };

    if (navigator.share && navigator.canShare(shareData)) {
      await navigator.share(shareData);
    } else {
      copyOverlapDetails(overlap);
    }
  };

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-semibold">Signal Overlaps</h2>
          <p className="text-sm text-muted-foreground">
            {sortedOverlaps.length} period
            {sortedOverlaps.length !== 1 ? "s" : ""} where multiple signals
            coincide
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {/* Filter Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <Filter className="h-4 w-4" />
                {filterImpact
                  ? `${
                      filterImpact.charAt(0).toUpperCase() +
                      filterImpact.slice(1)
                    } Impact`
                  : "All Impacts"}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Impact</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setFilterImpact(null)}>
                All Impacts
              </DropdownMenuItem>
              {(["high", "medium", "low"] as ImpactLevel[]).map((impact) => {
                const style = IMPACT_STYLES[impact];
                const Icon = style.icon;
                return (
                  <DropdownMenuItem
                    key={impact}
                    onClick={() => setFilterImpact(impact)}
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {impact.charAt(0).toUpperCase() + impact.slice(1)} Impact
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                {sortAsc ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <SortDesc className="h-4 w-4" />
                )}
                {sortMode === "impact" && "By Impact"}
                {sortMode === "time" && "By Time"}
                {sortMode === "duration" && "By Duration"}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortMode("impact")}>
                Impact Level
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortMode("time")}>
                Start Time
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortMode("duration")}>
                Duration
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortAsc(!sortAsc)}>
                {sortAsc ? "Descending" : "Ascending"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Expand/Collapse */}
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="sm"
              onClick={expandAll}
              className="rounded-r-none border-r"
            >
              <ChevronDown className="h-4 w-4 mr-1" />
              Expand
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={collapseAll}
              className="rounded-l-none"
            >
              <ChevronUp className="h-4 w-4 mr-1" />
              Collapse
            </Button>
          </div>
        </div>
      </div>

      {/* Educational Explainer */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="text-sm font-medium">
          Why Overlaps Matter
        </AlertTitle>
        <AlertDescription className="text-sm text-muted-foreground">
          When multiple signals overlap in time, their combined effect on
          outreach effectiveness is often greater than each signal alone. A
          cleanup during an event, or transit disruption during a service
          bottleneck, creates compound challenges for both outreach teams and
          the people they serve.
        </AlertDescription>
      </Alert>

      <Separator />

      {/* Overlaps List */}
      {sortedOverlaps.length > 0 ? (
        <div className="space-y-4">
          {sortedOverlaps.map((overlap) => {
            const overlapSignals = getOverlapSignals(overlap);
            const style = IMPACT_STYLES[overlap.combinedImpact];
            const Icon = style.icon;
            const isExpanded = expandedOverlaps.has(overlap.id);

            return (
              <Card key={overlap.id} className={`${style.bg} ${style.border}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                        <Badge variant={style.badge} className="text-xs">
                          {overlap.combinedImpact} combined impact
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {formatTimeRange(overlap.timeRange)}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {calculateDuration(overlap.timeRange)}
                        </Badge>
                      </div>
                      <CardTitle className="text-sm font-medium">
                        {overlapSignals.length} Signals Overlap
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => copyOverlapDetails(overlap)}
                          >
                            <Copy
                              className={`h-4 w-4 ${
                                copiedId === overlap.id ? "text-green-500" : ""
                              }`}
                            />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {copiedId === overlap.id ? "Copied!" : "Copy details"}
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => addToCalendar(overlap)}
                          >
                            <Calendar className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Add to calendar</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => shareOverlap(overlap)}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Share</TooltipContent>
                      </Tooltip>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(overlap.id)}
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-4 w-4 mr-1" />
                            Less
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-4 w-4 mr-1" />
                            More
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Why it matters */}
                  <div className="bg-background/50 rounded-md p-3">
                    <p className="text-sm text-muted-foreground">
                      {overlap.whyItMatters}
                    </p>
                  </div>

                  {isExpanded && (
                    <>
                      {/* Contributing signals */}
                      <div>
                        <p className="text-xs font-medium mb-2">
                          Overlapping Signals
                        </p>
                        <div className="space-y-2">
                          {overlapSignals.map((signal) => (
                            <SignalCard key={signal.id} signal={signal} />
                          ))}
                        </div>
                      </div>

                      {/* Coordination suggestion */}
                      <div className="border-t pt-3">
                        <p className="text-xs font-medium mb-1">
                          Coordination Suggestion
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {generateCoordinationSuggestion(
                            overlap,
                            overlapSignals
                          )}
                        </p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-muted/30">
          <CardContent className="py-8 text-center">
            <CardDescription>
              {filterImpact
                ? `No ${filterImpact} impact overlaps detected. Try clearing the filter.`
                : "No significant signal overlaps detected in this time period."}
            </CardDescription>
            <p className="text-sm text-muted-foreground mt-2">
              {filterImpact ? (
                <Button
                  variant="link"
                  onClick={() => setFilterImpact(null)}
                  className="p-0"
                >
                  Clear filter
                </Button>
              ) : (
                "This is generally a positive indicator for outreach planning flexibility."
              )}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary stats */}
      {overlaps.length > 0 && (
        <>
          <Separator />
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-card rounded-lg p-4 border">
              <p className="text-2xl font-semibold">{overlaps.length}</p>
              <p className="text-xs text-muted-foreground">Total Overlaps</p>
            </div>
            <div className="bg-card rounded-lg p-4 border">
              <p className="text-2xl font-semibold">
                {overlaps.filter((o) => o.combinedImpact === "high").length}
              </p>
              <p className="text-xs text-muted-foreground">High Impact</p>
            </div>
            <div className="bg-card rounded-lg p-4 border">
              <p className="text-2xl font-semibold">
                {calculateTotalOverlapHours(overlaps)}h
              </p>
              <p className="text-xs text-muted-foreground">
                Total Overlap Time
              </p>
            </div>
          </div>
        </>
      )}

      {/* Footer */}
      <Card className="bg-muted/30 border-muted">
        <CardContent className="py-3">
          <p className="text-xs text-muted-foreground text-center">
            Overlaps are computed from simulated institutional data. Use for
            planning discussions, not prediction.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Compact signal card for overlap display.
 */
function SignalCard({ signal }: { signal: TemporalSignal }) {
  return (
    <div className="bg-background rounded-md p-3 text-sm border">
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <Badge variant="outline" className="text-xs py-0">
          {signal.signalType}
        </Badge>
        <Badge variant="secondary" className="text-xs py-0">
          {signal.impactLevel}
        </Badge>
        <span className="text-xs text-muted-foreground">{signal.source}</span>
      </div>
      <p className="text-muted-foreground text-sm">{signal.description}</p>
      <p className="text-xs text-muted-foreground mt-1 italic">
        {signal.interpretationNotes}
      </p>
    </div>
  );
}

/**
 * Format a time range for display.
 */
function formatTimeRange(timeRange: { start: string; end: string }): string {
  const start = new Date(timeRange.start);
  const end = new Date(timeRange.end);

  const startStr = start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
  });
  const endStr = end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
  });

  return `${startStr} - ${endStr}`;
}

/**
 * Calculate duration of a time range.
 */
function calculateDuration(timeRange: { start: string; end: string }): string {
  const start = new Date(timeRange.start);
  const end = new Date(timeRange.end);
  const hours = Math.round(
    (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  );

  if (hours < 24) {
    return `${hours}h`;
  }
  const days = Math.round(hours / 24);
  return `${days}d`;
}

/**
 * Calculate total overlap hours.
 */
function calculateTotalOverlapHours(overlaps: SignalOverlap[]): number {
  let totalMs = 0;
  for (const overlap of overlaps) {
    const start = new Date(overlap.timeRange.start);
    const end = new Date(overlap.timeRange.end);
    totalMs += end.getTime() - start.getTime();
  }
  return Math.round(totalMs / (1000 * 60 * 60));
}

/**
 * Format date for Google Calendar URL.
 */
function formatCalendarDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

/**
 * Generate a coordination suggestion based on overlap characteristics.
 */
function generateCoordinationSuggestion(
  overlap: SignalOverlap,
  signals: TemporalSignal[]
): string {
  const hasSanitation = signals.some((s) => s.signalType === "sanitationCycle");
  const hasEvent = signals.some((s) => s.signalType === "publicEvent");
  const hasTransit = signals.some((s) => s.signalType === "transitDisruption");
  const hasShelter = signals.some((s) => s.signalType === "shelterIntakeHours");

  if (hasSanitation && hasEvent) {
    return "Cleanup during event period creates heightened activity. Consider coordinating proactive outreach 24-48 hours before to connect people with resources.";
  }

  if (hasSanitation && hasTransit) {
    return "Cleanup with reduced transit options may limit mobility. Have transportation resources ready if conducting outreach before this period.";
  }

  if (hasEvent && hasTransit) {
    return "Event with transit disruption affects area accessibility. Focus outreach on areas with alternative transit access.";
  }

  if (hasShelter) {
    return "Shelter availability during this overlap period may be helpful. Coordinate referrals if conducting outreach beforehand.";
  }

  if (overlap.combinedImpact === "high") {
    return "High combined impact period. Consider shifting outreach to before or after this window, and use the time for preparation and coordination with partners.";
  }

  return "Multiple factors affect this period. Coordinate with partner organizations and adjust timing if possible.";
}
