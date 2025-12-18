/**
 * GUIDANCE PANEL COMPONENT
 *
 * Provides non-prescriptive planning guidance for outreach coordination.
 *
 * DESIGN PHILOSOPHY:
 * - Guidance is framed as suggestions, not orders
 * - Focus on coordination and preparation, not enforcement
 * - Respects organizational autonomy
 * - Never suggests punitive or surveillance actions
 *
 * ETHICAL NOTE:
 * This panel explicitly DOES NOT provide:
 * - Enforcement guidance
 * - Predictions of individual behavior
 * - Recommendations that could enable harm
 *
 * All suggestions are about timing, coordination, and resource preparation.
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

import type { OutreachWindow, WindowType } from "@/lib/temporal/aggregate";

/**
 * General guidance for each window type.
 */
const WINDOW_GUIDANCE: Record<
  WindowType,
  {
    title: string;
    overview: string;
    strategies: string[];
    coordination: string[];
  }
> = {
  safer: {
    title: "Safer Window Guidance",
    overview:
      "These periods have lower institutional activity and fewer disruptions. Good conditions for meaningful outreach work.",
    strategies: [
      "Prioritize relationship-building conversations over transactional interactions",
      "Take time for thorough needs assessments",
      "Follow up on previous contacts and referrals",
      "Conduct new area assessments if planning expansion",
    ],
    coordination: [
      "Schedule team check-ins and case consultations",
      "Prepare materials and resources for upcoming high-activity periods",
      "Connect with partner organizations for joint outreach opportunities",
    ],
  },
  caution: {
    title: "Caution Period Guidance",
    overview:
      "Moderate activity expected. Outreach is feasible but may require adjusted timing or approach.",
    strategies: [
      "Consider early morning or late afternoon timing",
      "Have backup locations for conversations if primary areas are busy",
      "Keep interactions focused and efficient",
      "Be prepared for interruptions",
    ],
    coordination: [
      "Coordinate with partners to avoid duplicating efforts",
      "Share real-time observations with coalition members",
      "Have referral resources ready for quick connections",
    ],
  },
  highDisruption: {
    title: "High Disruption Period Guidance",
    overview:
      "Multiple factors may affect outreach effectiveness. Consider proactive approaches before this period.",
    strategies: [
      "Focus on proactive outreach 24-48 hours before this period",
      "Share advance information about upcoming activity with community",
      "Prioritize connecting people with resources they may need",
      "Use this time for internal coordination rather than field outreach",
    ],
    coordination: [
      "Alert partner organizations to coordinate coverage",
      "Prepare alternative service referrals",
      "Document observations for post-period follow-up planning",
      "Schedule post-period check-ins with frequent contacts",
    ],
  },
};

/**
 * General best practices (always visible).
 */
const GENERAL_PRACTICES = [
  {
    title: "Time Your Approach",
    description:
      "Use temporal signals to inform when—not where—to conduct outreach. The goal is effective connection, not surveillance.",
  },
  {
    title: "Prepare, Don't Predict",
    description:
      "Signals indicate institutional activity patterns, not individual behavior. Use them to prepare resources, not predict outcomes.",
  },
  {
    title: "Coordinate, Don't Compete",
    description:
      "Share timing information with coalition partners to avoid duplication and ensure coverage during challenging periods.",
  },
  {
    title: "Respect Autonomy",
    description:
      "Information about timing helps you be present when it's helpful. Individual choices about services remain with the individual.",
  },
];

interface GuidancePanelProps {
  windows: OutreachWindow[];
  selectedWindow?: OutreachWindow;
  onWindowSelect: (windowId: string | undefined) => void;
}

export function GuidancePanel({
  windows,
  selectedWindow,
  onWindowSelect,
}: GuidancePanelProps) {
  // Calculate window distribution
  const windowCounts = {
    safer: windows.filter((w) => w.windowType === "safer").length,
    caution: windows.filter((w) => w.windowType === "caution").length,
    highDisruption: windows.filter((w) => w.windowType === "highDisruption")
      .length,
  };

  // Get predominant window type
  const predominantType = (
    Object.entries(windowCounts) as [WindowType, number][]
  ).sort((a, b) => b[1] - a[1])[0][0];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold">Planning Guidance</h2>
        <p className="text-sm text-muted-foreground">
          Non-prescriptive suggestions for outreach coordination
        </p>
      </div>

      {/* Ethical framing reminder */}
      <Alert>
        <AlertTitle className="text-sm font-medium">
          Guidance Philosophy
        </AlertTitle>
        <AlertDescription className="text-sm text-muted-foreground">
          This guidance focuses on <em>when</em> and <em>how</em> to coordinate
          outreach for effectiveness—not where people are or how to respond to
          enforcement. All suggestions respect individual autonomy and
          organizational judgment.
        </AlertDescription>
      </Alert>

      <Separator />

      {/* Current Period Overview */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Current Period Overview</CardTitle>
          <CardDescription>
            Based on {windows.length} windows in the planning horizon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center mb-4">
            <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-3">
              <p className="text-2xl font-semibold">{windowCounts.safer}</p>
              <p className="text-xs text-muted-foreground">Safer Windows</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3">
              <p className="text-2xl font-semibold">{windowCounts.caution}</p>
              <p className="text-xs text-muted-foreground">Caution Periods</p>
            </div>
            <div className="bg-stone-100 dark:bg-stone-900/50 rounded-lg p-3">
              <p className="text-2xl font-semibold">
                {windowCounts.highDisruption}
              </p>
              <p className="text-xs text-muted-foreground">High Disruption</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            This period is predominantly{" "}
            <strong>{formatWindowType(predominantType)}</strong>.
            {predominantType === "safer" &&
              " Good conditions for substantive outreach work."}
            {predominantType === "caution" &&
              " Plan timing carefully for optimal effectiveness."}
            {predominantType === "highDisruption" &&
              " Focus on preparation and coordination."}
          </p>
        </CardContent>
      </Card>

      {/* Selected Window Guidance */}
      {selectedWindow && (
        <Card className="border-ring">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Selected Window</CardTitle>
              <Badge variant="outline" className="text-xs">
                {formatTimeRange(selectedWindow.timeRange)}
              </Badge>
            </div>
            <CardDescription>
              {WINDOW_GUIDANCE[selectedWindow.windowType].title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {selectedWindow.suggestedApproach}
            </p>

            <div>
              <p className="text-xs font-medium mb-2">Suggested Strategies</p>
              <ul className="space-y-1">
                {WINDOW_GUIDANCE[selectedWindow.windowType].strategies.map(
                  (strategy, i) => (
                    <li
                      key={i}
                      className="text-sm text-muted-foreground flex gap-2"
                    >
                      <span className="text-muted-foreground/50">•</span>
                      {strategy}
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <p className="text-xs font-medium mb-2">Coordination Ideas</p>
              <ul className="space-y-1">
                {WINDOW_GUIDANCE[selectedWindow.windowType].coordination.map(
                  (coord, i) => (
                    <li
                      key={i}
                      className="text-sm text-muted-foreground flex gap-2"
                    >
                      <span className="text-muted-foreground/50">•</span>
                      {coord}
                    </li>
                  )
                )}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* General Best Practices */}
      <div>
        <h3 className="text-sm font-medium mb-3">General Best Practices</h3>
        <div className="grid gap-3">
          {GENERAL_PRACTICES.map((practice, i) => (
            <Card key={i} className="bg-muted/30">
              <CardContent className="py-3">
                <p className="text-sm font-medium mb-1">{practice.title}</p>
                <p className="text-xs text-muted-foreground">
                  {practice.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* Quick Window Selection */}
      <div>
        <h3 className="text-sm font-medium mb-3">Quick Window Selection</h3>
        <p className="text-xs text-muted-foreground mb-3">
          Select a window to see specific guidance
        </p>
        <div className="space-y-2 max-h-48 overflow-auto">
          {windows.slice(0, 10).map((window) => (
            <button
              key={window.id}
              onClick={() => onWindowSelect(window.id)}
              className={`w-full text-left p-2 rounded-md border transition-colors ${
                selectedWindow?.id === window.id
                  ? "border-ring bg-accent"
                  : "border-transparent hover:bg-muted"
              }`}
            >
              <div className="flex items-center justify-between">
                <Badge
                  variant={
                    window.windowType === "safer" ? "default" : "secondary"
                  }
                  className="text-xs"
                >
                  {formatWindowType(window.windowType)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {formatTimeRange(window.timeRange)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <Card className="bg-muted/30 border-muted">
        <CardContent className="py-3">
          <p className="text-xs text-muted-foreground text-center">
            Guidance is based on simulated data and general patterns.
            Organizational judgment should always inform final decisions.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Format window type for display.
 */
function formatWindowType(type: WindowType): string {
  switch (type) {
    case "safer":
      return "Safer";
    case "caution":
      return "Caution";
    case "highDisruption":
      return "High Disruption";
  }
}

/**
 * Format a time range for display.
 */
function formatTimeRange(timeRange: { start: string; end: string }): string {
  const start = new Date(timeRange.start);
  const end = new Date(timeRange.end);

  // Same day
  if (start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  // Different days
  return `${start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })} - ${end.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  })}`;
}
