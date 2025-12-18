/**
 * CONTEXTUAL MAP VIEW COMPONENT
 *
 * Interactive map view using the static Koreatown basemap.
 * Shows area markers with signal counts and supports creating alerts.
 */

"use client";

import { useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MapPin, Clock, BellPlus, ChevronDown, X } from "lucide-react";
import { StaticKoreatownMap } from "./StaticKoreatownMap";
import {
  KOREATOWN_AREAS,
  findAreaByDescription,
  type KoreatownArea,
} from "@/lib/geo/koreatownAreas";

import type { TemporalSignal, TemporalSignalType } from "@/lib/temporal/types";
import type { OutreachWindow } from "@/lib/temporal/aggregate";
import type { AlertDraft } from "@/lib/alerts/types";

interface ContextualMapViewProps {
  signals: TemporalSignal[];
  windows: OutreachWindow[];
  onCreateAlert?: (draft: AlertDraft) => void;
}

const SIGNAL_TYPE_LABELS: Record<TemporalSignalType, string> = {
  sanitationCycle: "Sanitation",
  publicEvent: "Event",
  shelterIntakeHours: "Shelter",
  transitDisruption: "Transit",
  serviceBottleneck: "Bottleneck",
};

export function ContextualMapView({
  signals,
  onCreateAlert,
}: ContextualMapViewProps) {
  const [selectedArea, setSelectedArea] = useState<KoreatownArea | null>(null);
  const [filterType, setFilterType] = useState<TemporalSignalType | null>(null);

  // Filter signals
  const filteredSignals = useMemo(() => {
    let result = signals.filter((s) => s.geographyHint);
    if (filterType) {
      result = result.filter((s) => s.signalType === filterType);
    }
    return result;
  }, [signals, filterType]);

  // Group signals by area
  const signalsByArea = useMemo(() => {
    const groups = new Map<string, TemporalSignal[]>();

    for (const signal of filteredSignals) {
      const area = findAreaByDescription(signal.geographyHint?.description);
      if (area) {
        const existing = groups.get(area.id) || [];
        existing.push(signal);
        groups.set(area.id, existing);
      }
    }

    return groups;
  }, [filteredSignals]);

  // Get areas with signals
  const areasWithSignals = useMemo(() => {
    return KOREATOWN_AREAS.filter((area) => signalsByArea.has(area.id)).map(
      (area) => ({
        area,
        signals: signalsByArea.get(area.id) || [],
        nextSignal: getNextSignal(signalsByArea.get(area.id) || []),
      })
    );
  }, [signalsByArea]);

  // Create alert from area
  const createAlertFromArea = (
    area: KoreatownArea,
    areaSignals: TemporalSignal[]
  ) => {
    if (!onCreateAlert || areaSignals.length === 0) return;

    const nextSignal = getNextSignal(areaSignals);
    if (!nextSignal) return;

    onCreateAlert({
      title: `Area: ${area.label}`,
      notes: `${areaSignals.length} signal(s) in this area.\n\nNext: ${nextSignal.description}`,
      timeRange: nextSignal.timeRange,
      source: "map",
      relatedIds: {
        signalIds: areaSignals.map((s) => s.id),
      },
      areaLabel: area.label,
    });
  };

  // Create alert from specific signal
  const createAlertFromSignal = (signal: TemporalSignal) => {
    if (!onCreateAlert) return;

    const area = findAreaByDescription(signal.geographyHint?.description);

    onCreateAlert({
      title: `Signal: ${SIGNAL_TYPE_LABELS[signal.signalType]}`,
      notes: `${signal.description}\n\n${signal.interpretationNotes}`,
      timeRange: signal.timeRange,
      source: "map",
      relatedIds: {
        signalIds: [signal.id],
      },
      areaLabel: area?.label,
    });
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="p-4 border-b flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {areasWithSignals.length} area
            {areasWithSignals.length !== 1 ? "s" : ""} with signals
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
              {filterType ? SIGNAL_TYPE_LABELS[filterType] : "All types"}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilterType(null)}>
              All types
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {(Object.keys(SIGNAL_TYPE_LABELS) as TemporalSignalType[]).map(
              (type) => (
                <DropdownMenuItem
                  key={type}
                  onClick={() => setFilterType(type)}
                >
                  {SIGNAL_TYPE_LABELS[type]}
                </DropdownMenuItem>
              )
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Map Area */}
      <div className="flex-1 relative">
        <StaticKoreatownMap className="h-full">
          {/* Area Markers */}
          {areasWithSignals.map(({ area, signals: areaSignals }) => {
            if (!area.centerPixel) return null;

            const isSelected = selectedArea?.id === area.id;

            return (
              <div
                key={area.id}
                style={{
                  position: "absolute",
                  left: area.centerPixel.x,
                  top: area.centerPixel.y,
                  transform: "translate(-50%, -50%)",
                  zIndex: 10, // Ensure markers are above map
                }}
                onMouseDown={(e) => e.stopPropagation()} // Prevent map drag
                onClick={(e) => e.stopPropagation()} // Prevent map click if any
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedArea(isSelected ? null : area);
                  }}
                  className={`
                    relative flex items-center justify-center
                    min-w-[32px] h-8 px-2 rounded-full
                    transition-all shadow-md cursor-pointer
                    ${
                      isSelected
                        ? "bg-primary text-primary-foreground scale-110"
                        : "bg-background border hover:scale-105"
                    }
                  `}
                >
                  <span className="text-xs font-medium">
                    {areaSignals.length}
                  </span>
                </button>
              </div>
            );
          })}
        </StaticKoreatownMap>

        {/* Selected Area Panel */}
        {selectedArea && (
          <AreaDetailPanel
            area={selectedArea}
            signals={signalsByArea.get(selectedArea.id) || []}
            onClose={() => setSelectedArea(null)}
            onCreateAlert={onCreateAlert ? createAlertFromArea : undefined}
            onCreateAlertFromSignal={
              onCreateAlert ? createAlertFromSignal : undefined
            }
          />
        )}
      </div>

      {/* Legend */}
      <div className="p-3 border-t bg-muted/30">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Click markers to see area details · Simulated data (24h+ delay)
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 rounded-full bg-background border flex items-center justify-center text-[10px]">
                3
              </div>
              <span>= 3 signals</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Area detail panel.
 */
function AreaDetailPanel({
  area,
  signals,
  onClose,
  onCreateAlert,
  onCreateAlertFromSignal,
}: {
  area: KoreatownArea;
  signals: TemporalSignal[];
  onClose: () => void;
  onCreateAlert?: (area: KoreatownArea, signals: TemporalSignal[]) => void;
  onCreateAlertFromSignal?: (signal: TemporalSignal) => void;
}) {
  const nextSignal = getNextSignal(signals);

  return (
    <div className="absolute top-4 left-4 w-80 max-h-[calc(100%-2rem)] overflow-auto">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className="font-medium text-sm">{area.label}</h3>
              <p className="text-xs text-muted-foreground">
                {signals.length} signal{signals.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex items-center gap-1">
              {onCreateAlert && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => onCreateAlert(area, signals)}
                    >
                      <BellPlus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Create alert for area</TooltipContent>
                </Tooltip>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {nextSignal && (
            <div className="mb-3 p-2 bg-muted/50 rounded-md">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Next signal: {formatRelativeTime(nextSignal.timeRange.start)}
              </p>
            </div>
          )}

          <div className="space-y-2">
            {signals.slice(0, 5).map((signal) => (
              <SignalCard
                key={signal.id}
                signal={signal}
                onCreateAlert={onCreateAlertFromSignal}
              />
            ))}
            {signals.length > 5 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                +{signals.length - 5} more signals
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Signal card within area panel.
 */
function SignalCard({
  signal,
  onCreateAlert,
}: {
  signal: TemporalSignal;
  onCreateAlert?: (signal: TemporalSignal) => void;
}) {
  return (
    <div className="p-2 border rounded-md bg-background">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <Badge variant="outline" className="text-[10px] px-1 py-0">
              {SIGNAL_TYPE_LABELS[signal.signalType]}
            </Badge>
            <Badge
              variant={
                signal.impactLevel === "high" ? "destructive" : "secondary"
              }
              className="text-[10px] px-1 py-0"
            >
              {signal.impactLevel}
            </Badge>
          </div>
          <p className="text-xs line-clamp-2">{signal.description}</p>
          <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatTimeRange(signal.timeRange)}
          </p>
        </div>
        {onCreateAlert && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 shrink-0"
                onClick={() => onCreateAlert(signal)}
              >
                <BellPlus className="h-3 w-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Create alert</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

/**
 * Get the next upcoming signal from a list.
 */
function getNextSignal(signals: TemporalSignal[]): TemporalSignal | undefined {
  const now = new Date();
  const upcoming = signals
    .filter((s) => new Date(s.timeRange.start) > now)
    .sort(
      (a, b) =>
        new Date(a.timeRange.start).getTime() -
        new Date(b.timeRange.start).getTime()
    );
  return upcoming[0];
}

/**
 * Format relative time.
 */
function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));

  if (diffHours < 0) return "Past";
  if (diffHours < 1) return "< 1 hour";
  if (diffHours < 24) return `${diffHours}h`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d`;
}

/**
 * Format time range for display.
 */
function formatTimeRange(timeRange: { start: string; end: string }): string {
  const start = new Date(timeRange.start);
  const end = new Date(timeRange.end);

  const dateOpts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };

  if (start.toDateString() === end.toDateString()) {
    return start.toLocaleDateString("en-US", dateOpts);
  }

  return `${start.toLocaleDateString(
    "en-US",
    dateOpts
  )} - ${end.toLocaleDateString("en-US", dateOpts)}`;
}
