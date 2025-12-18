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
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CheckCircle2,
  AlertCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Printer,
  BookOpen,
  Target,
  Users,
  Lightbulb,
} from "lucide-react";

import type { OutreachWindow, WindowType } from "@/lib/temporal/aggregate";

// Create a simple Collapsible component if not available
const SimpleCollapsible = ({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}) => {
  return <div>{children}</div>;
};

const SimpleCollapsibleTrigger = ({
  asChild,
  children,
  onClick,
}: {
  asChild?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) => {
  return <div onClick={onClick}>{children}</div>;
};

const SimpleCollapsibleContent = ({
  children,
  isOpen,
}: {
  children: React.ReactNode;
  isOpen: boolean;
}) => {
  if (!isOpen) return null;
  return <div>{children}</div>;
};

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
    icon: React.ElementType;
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
    icon: CheckCircle2,
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
    icon: AlertCircle,
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
    icon: XCircle,
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
    icon: Target,
  },
  {
    title: "Prepare, Don't Predict",
    description:
      "Signals indicate institutional activity patterns, not individual behavior. Use them to prepare resources, not predict outcomes.",
    icon: Lightbulb,
  },
  {
    title: "Coordinate, Don't Compete",
    description:
      "Share timing information with coalition partners to avoid duplication and ensure coverage during challenging periods.",
    icon: Users,
  },
  {
    title: "Respect Autonomy",
    description:
      "Information about timing helps you be present when it's helpful. Individual choices about services remain with the individual.",
    icon: BookOpen,
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
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [expandedPractices, setExpandedPractices] = useState<Set<number>>(
    new Set([0])
  );
  const [showAllWindows, setShowAllWindows] = useState(false);

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

  // Copy guidance to clipboard
  const copyGuidance = (section: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Copy all guidance for selected window
  const copySelectedWindowGuidance = () => {
    if (!selectedWindow) return;

    const guidance = WINDOW_GUIDANCE[selectedWindow.windowType];
    const text = `
${guidance.title}
Time: ${formatTimeRange(selectedWindow.timeRange)}

Overview:
${guidance.overview}

Suggested Strategies:
${guidance.strategies.map((s) => `• ${s}`).join("\n")}

Coordination Ideas:
${guidance.coordination.map((c) => `• ${c}`).join("\n")}

Window-Specific Approach:
${selectedWindow.suggestedApproach}

---
Generated by Outreach Window Planner (simulated data)
    `.trim();

    copyGuidance("selected-window", text);
  };

  // Export all guidance as document
  const exportGuidance = () => {
    const doc = `
OUTREACH WINDOW PLANNER - PLANNING GUIDANCE
Generated: ${new Date().toLocaleDateString()}

===========================================
CURRENT PERIOD OVERVIEW
===========================================
Planning Horizon: ${windows.length} windows

Window Distribution:
- Safer Windows: ${windowCounts.safer}
- Caution Periods: ${windowCounts.caution}
- High Disruption: ${windowCounts.highDisruption}

Predominant Condition: ${formatWindowType(predominantType)}

===========================================
GENERAL BEST PRACTICES
===========================================
${GENERAL_PRACTICES.map((p) => `${p.title}\n${p.description}`).join("\n\n")}

===========================================
WINDOW-TYPE GUIDANCE
===========================================

SAFER WINDOWS:
${WINDOW_GUIDANCE.safer.overview}

Strategies:
${WINDOW_GUIDANCE.safer.strategies.map((s) => `• ${s}`).join("\n")}

Coordination:
${WINDOW_GUIDANCE.safer.coordination.map((c) => `• ${c}`).join("\n")}

---

CAUTION PERIODS:
${WINDOW_GUIDANCE.caution.overview}

Strategies:
${WINDOW_GUIDANCE.caution.strategies.map((s) => `• ${s}`).join("\n")}

Coordination:
${WINDOW_GUIDANCE.caution.coordination.map((c) => `• ${c}`).join("\n")}

---

HIGH DISRUPTION PERIODS:
${WINDOW_GUIDANCE.highDisruption.overview}

Strategies:
${WINDOW_GUIDANCE.highDisruption.strategies.map((s) => `• ${s}`).join("\n")}

Coordination:
${WINDOW_GUIDANCE.highDisruption.coordination.map((c) => `• ${c}`).join("\n")}

===========================================
DISCLAIMER
===========================================
This guidance is based on simulated data and general patterns.
Organizational judgment should always inform final decisions.
This tool is for outreach coordination only, not surveillance or enforcement.
    `.trim();

    const blob = new Blob([doc], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `outreach-guidance-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Print guidance
  const printGuidance = () => {
    window.print();
  };

  // Toggle practice expansion
  const togglePractice = (index: number) => {
    const newExpanded = new Set(expandedPractices);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedPractices(newExpanded);
  };

  const displayedWindows = showAllWindows ? windows : windows.slice(0, 10);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-lg font-semibold">Planning Guidance</h2>
          <p className="text-sm text-muted-foreground">
            Non-prescriptive suggestions for outreach coordination
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={exportGuidance}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </TooltipTrigger>
            <TooltipContent>Download guidance document</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm" onClick={printGuidance}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </TooltipTrigger>
            <TooltipContent>Print guidance</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* Ethical framing reminder */}
      <Alert>
        <BookOpen className="h-4 w-4" />
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
            <button
              onClick={() => {
                const saferWindow = windows.find(
                  (w) => w.windowType === "safer"
                );
                if (saferWindow) onWindowSelect(saferWindow.id);
              }}
              className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-3 hover:ring-2 hover:ring-emerald-300 transition-all"
            >
              <CheckCircle2 className="h-5 w-5 mx-auto mb-1 text-emerald-600 dark:text-emerald-400" />
              <p className="text-2xl font-semibold">{windowCounts.safer}</p>
              <p className="text-xs text-muted-foreground">Safer Windows</p>
            </button>
            <button
              onClick={() => {
                const cautionWindow = windows.find(
                  (w) => w.windowType === "caution"
                );
                if (cautionWindow) onWindowSelect(cautionWindow.id);
              }}
              className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3 hover:ring-2 hover:ring-amber-300 transition-all"
            >
              <AlertCircle className="h-5 w-5 mx-auto mb-1 text-amber-600 dark:text-amber-400" />
              <p className="text-2xl font-semibold">{windowCounts.caution}</p>
              <p className="text-xs text-muted-foreground">Caution Periods</p>
            </button>
            <button
              onClick={() => {
                const disruptionWindow = windows.find(
                  (w) => w.windowType === "highDisruption"
                );
                if (disruptionWindow) onWindowSelect(disruptionWindow.id);
              }}
              className="bg-stone-100 dark:bg-stone-900/50 rounded-lg p-3 hover:ring-2 hover:ring-stone-400 transition-all"
            >
              <XCircle className="h-5 w-5 mx-auto mb-1 text-stone-600 dark:text-stone-400" />
              <p className="text-2xl font-semibold">
                {windowCounts.highDisruption}
              </p>
              <p className="text-xs text-muted-foreground">High Disruption</p>
            </button>
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
        <Card className="border-ring ring-1 ring-ring">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {(() => {
                  const Icon = WINDOW_GUIDANCE[selectedWindow.windowType].icon;
                  return <Icon className="h-5 w-5 text-muted-foreground" />;
                })()}
                <CardTitle className="text-sm">Selected Window</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {formatTimeRange(selectedWindow.timeRange)}
                </Badge>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={copySelectedWindowGuidance}
                    >
                      <Copy
                        className={`h-4 w-4 ${
                          copiedSection === "selected-window"
                            ? "text-green-500"
                            : ""
                        }`}
                      />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {copiedSection === "selected-window"
                      ? "Copied!"
                      : "Copy guidance"}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <CardDescription>
              {WINDOW_GUIDANCE[selectedWindow.windowType].title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {selectedWindow.suggestedApproach}
            </p>

            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-xs font-medium mb-2 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Suggested Strategies
              </p>
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

            <div className="bg-muted/30 rounded-lg p-4">
              <p className="text-xs font-medium mb-2 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Coordination Ideas
              </p>
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

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onWindowSelect(undefined)}
            >
              Clear Selection
            </Button>
          </CardContent>
        </Card>
      )}

      {/* General Best Practices */}
      <div>
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          General Best Practices
        </h3>
        <div className="space-y-2">
          {GENERAL_PRACTICES.map((practice, i) => {
            const Icon = practice.icon;
            const isExpanded = expandedPractices.has(i);

            return (
              <Card key={i} className="bg-muted/30">
                <CardContent className="py-3">
                  <button
                    onClick={() => togglePractice(i)}
                    className="w-full text-left flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">{practice.title}</p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                  {isExpanded && (
                    <p className="text-xs text-muted-foreground mt-2 ml-6">
                      {practice.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Quick Window Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium">Quick Window Selection</h3>
          {windows.length > 10 && (
            <Button
              variant="link"
              size="sm"
              onClick={() => setShowAllWindows(!showAllWindows)}
              className="text-xs"
            >
              {showAllWindows
                ? "Show fewer"
                : `Show all ${windows.length} windows`}
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Select a window to see specific guidance
        </p>
        <div className="space-y-2 max-h-64 overflow-auto">
          {displayedWindows.map((window) => {
            const Icon = WINDOW_GUIDANCE[window.windowType].icon;
            return (
              <button
                key={window.id}
                onClick={() => onWindowSelect(window.id)}
                className={`w-full text-left p-3 rounded-md border transition-all ${
                  selectedWindow?.id === window.id
                    ? "border-ring bg-accent ring-1 ring-ring"
                    : "border-transparent hover:bg-muted hover:border-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <Badge
                      variant={
                        window.windowType === "safer" ? "default" : "secondary"
                      }
                      className="text-xs"
                    >
                      {formatWindowType(window.windowType)}
                    </Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeRange(window.timeRange)}
                  </span>
                </div>
              </button>
            );
          })}
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
