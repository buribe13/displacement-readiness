/**
 * PLANNER CLIENT COMPONENT
 *
 * Handles client-side interactivity for the Outreach Window Planner.
 * Data is pre-fetched server-side and passed as props.
 *
 * DESIGN PHILOSOPHY:
 * - Timeline is the PRIMARY interface (default tab)
 * - Map is SECONDARY and de-emphasized (optional tab)
 * - All data is clearly labeled as simulated/delayed
 * - Overlaps and guidance are accessible but not overwhelming
 */

"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  meta: _meta, // Reserved for future use (e.g., displaying disclaimer)
}: PlannerClientProps) {
  const [selectedWindowId, setSelectedWindowId] = useState<
    string | undefined
  >();
  const [scenarioMode, setScenarioMode] = useState(false);

  // Find the selected window for guidance panel
  const selectedWindow = selectedWindowId
    ? initialWindows.find((w) => w.id === selectedWindowId)
    : undefined;

  return (
    <div className="h-full flex flex-col min-h-0">
      {/* Tabs Navigation */}
      <Tabs defaultValue="timeline" className="flex-1 flex flex-col min-h-0">
        <div className="border-b px-4">
          <TabsList className="h-auto p-0 bg-transparent">
            <TabsTrigger
              value="timeline"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground px-4 py-3 text-sm"
            >
              Timeline
            </TabsTrigger>
            <TabsTrigger
              value="overlaps"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground px-4 py-3 text-sm"
            >
              Overlaps
              {initialOverlaps.length > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {initialOverlaps.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="guidance"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground px-4 py-3 text-sm"
            >
              Guidance
            </TabsTrigger>
            <TabsTrigger
              value="map"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground px-4 py-3 text-sm text-muted-foreground"
            >
              Map
              <Badge variant="outline" className="ml-2 text-xs">
                Optional
              </Badge>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Timeline View - Primary Interface */}
        <TabsContent
          value="timeline"
          className="flex-1 m-0 data-[state=inactive]:hidden overflow-auto"
        >
          <TimelineView
            windows={initialWindows}
            signals={initialSignals}
            selectedWindowId={selectedWindowId}
            onWindowSelect={setSelectedWindowId}
            scenarioMode={scenarioMode}
            onScenarioModeChange={setScenarioMode}
          />
        </TabsContent>

        {/* Overlap Viewer */}
        <TabsContent
          value="overlaps"
          className="flex-1 m-0 data-[state=inactive]:hidden overflow-auto"
        >
          <OverlapViewer overlaps={initialOverlaps} signals={initialSignals} />
        </TabsContent>

        {/* Guidance Panel */}
        <TabsContent
          value="guidance"
          className="flex-1 m-0 data-[state=inactive]:hidden overflow-auto"
        >
          <GuidancePanel
            windows={initialWindows}
            selectedWindow={selectedWindow}
            onWindowSelect={setSelectedWindowId}
          />
        </TabsContent>

        {/* Contextual Map - Secondary/Optional */}
        <TabsContent
          value="map"
          className="flex-1 m-0 data-[state=inactive]:hidden"
        >
          <ContextualMapView
            signals={initialSignals}
            windows={initialWindows}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
