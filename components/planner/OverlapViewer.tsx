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

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

import type { TemporalSignal } from "@/lib/temporal/types";
import type { SignalOverlap } from "@/lib/temporal/aggregate";

/**
 * Impact level styling.
 */
const IMPACT_STYLES = {
  low: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    badge: "default" as const,
  },
  medium: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    badge: "secondary" as const,
  },
  high: {
    bg: "bg-stone-100 dark:bg-stone-900/50",
    border: "border-stone-300 dark:border-stone-700",
    badge: "outline" as const,
  },
};

interface OverlapViewerProps {
  overlaps: SignalOverlap[];
  signals: TemporalSignal[];
}

export function OverlapViewer({ overlaps, signals }: OverlapViewerProps) {
  // Create a map of signals by ID for quick lookup
  const signalMap = new Map(signals.map((s) => [s.id, s]));

  // Get the actual signal objects for an overlap
  const getOverlapSignals = (overlap: SignalOverlap): TemporalSignal[] => {
    return overlap.signalIds
      .map((id) => signalMap.get(id))
      .filter((s): s is TemporalSignal => s !== undefined);
  };

  // Sort overlaps by combined impact and time
  const sortedOverlaps = [...overlaps].sort((a, b) => {
    // High impact first
    const impactOrder = { high: 0, medium: 1, low: 2 };
    const impactDiff =
      impactOrder[a.combinedImpact] - impactOrder[b.combinedImpact];
    if (impactDiff !== 0) return impactDiff;

    // Then by time
    return (
      new Date(a.timeRange.start).getTime() -
      new Date(b.timeRange.start).getTime()
    );
  });

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Signal Overlaps</h2>
        <p className="text-sm text-muted-foreground">
          Periods where multiple disruptive signals coincide
        </p>
      </div>

      {/* Educational Explainer */}
      <Alert>
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

            return (
              <Card key={overlap.id} className={`${style.bg} ${style.border}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={style.badge} className="text-xs">
                          {overlap.combinedImpact} combined impact
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {formatTimeRange(overlap.timeRange)}
                        </Badge>
                      </div>
                      <CardTitle className="text-sm font-medium">
                        {overlapSignals.length} Signals Overlap
                      </CardTitle>
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
                      {generateCoordinationSuggestion(overlap, overlapSignals)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card className="bg-muted/30">
          <CardContent className="py-8 text-center">
            <CardDescription>
              No significant signal overlaps detected in this time period.
            </CardDescription>
            <p className="text-sm text-muted-foreground mt-2">
              This is generally a positive indicator for outreach planning
              flexibility.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Summary stats */}
      {sortedOverlaps.length > 0 && (
        <>
          <Separator />
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-semibold">{sortedOverlaps.length}</p>
              <p className="text-xs text-muted-foreground">Total Overlaps</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">
                {
                  sortedOverlaps.filter((o) => o.combinedImpact === "high")
                    .length
                }
              </p>
              <p className="text-xs text-muted-foreground">High Impact</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">
                {calculateTotalOverlapHours(sortedOverlaps)}h
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
    <div className="bg-background rounded-md p-2 text-sm">
      <div className="flex items-center gap-2 mb-1">
        <Badge variant="outline" className="text-xs py-0">
          {signal.signalType}
        </Badge>
        <Badge variant="secondary" className="text-xs py-0">
          {signal.impactLevel}
        </Badge>
      </div>
      <p className="text-muted-foreground text-xs">{signal.description}</p>
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
