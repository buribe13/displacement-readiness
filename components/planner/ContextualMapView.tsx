/**
 * CONTEXTUAL MAP VIEW COMPONENT
 *
 * An OPTIONAL, SECONDARY map view for geographic context.
 * This is explicitly de-emphasized—the Timeline is the primary interface.
 *
 * DESIGN PHILOSOPHY:
 * - Maps are not required to use this tool
 * - Geography is context, not the primary dimension
 * - Only shows aggregated/generalized areas, never individuals
 * - Clearly labeled as optional/secondary
 *
 * ETHICAL SAFEGUARDS:
 * - No real-time location data
 * - No individual tracking
 * - Generalized neighborhood-level visualization only
 * - All data is delayed (24h+) or simulated
 *
 * WHY THIS EXISTS:
 * Some coordinators find spatial context helpful for understanding
 * which areas may be affected by signals. The map provides this
 * context without making geography the primary lens.
 */

"use client";

import { useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";

import type { TemporalSignal } from "@/lib/temporal/types";
import type { OutreachWindow } from "@/lib/temporal/aggregate";

interface ContextualMapViewProps {
  signals: TemporalSignal[];
  windows: OutreachWindow[];
}

export function ContextualMapView({ signals }: ContextualMapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);

  // Check for Mapbox token - computed once, not in effect
  const hasToken =
    typeof window !== "undefined"
      ? !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN
      : false;

  // Get signals with geography hints
  const signalsWithGeography = signals.filter((s) => s.geographyHint);

  // Count signals by area description
  const areaSignalCounts = signalsWithGeography.reduce((acc, signal) => {
    const area = signal.geographyHint?.description || "General Koreatown";
    acc[area] = (acc[area] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="h-full flex flex-col">
      {/* Header with de-emphasis */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-lg font-semibold">Geographic Context</h2>
          <Badge variant="outline" className="text-xs">
            Optional
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Supplementary view showing generalized signal areas. The Timeline tab
          is the primary planning interface.
        </p>
      </div>

      {/* Important Notice */}
      <div className="p-4">
        <Alert>
          <AlertTitle className="text-sm font-medium">
            About This Map
          </AlertTitle>
          <AlertDescription className="text-sm text-muted-foreground space-y-2">
            <p>
              This map shows <strong>generalized areas</strong> affected by
              institutional signals—sanitation routes, event zones, transit
              areas. It does NOT show:
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Individual locations or movements</li>
              <li>Real-time data (all data is 24h+ delayed)</li>
              <li>Enforcement activity</li>
              <li>Precise boundaries</li>
            </ul>
            <p className="text-xs">
              Geography is context for timing decisions, not the primary
              dimension of this tool.
            </p>
          </AlertDescription>
        </Alert>
      </div>

      {/* Map Area */}
      <div className="flex-1 p-4 pt-0">
        {hasToken ? (
          // Map placeholder - would integrate with Mapbox here
          <Card className="h-full">
            <CardContent className="h-full flex items-center justify-center">
              <div className="text-center space-y-4">
                <div
                  ref={mapContainer}
                  className="w-full h-64 bg-muted/30 rounded-lg flex items-center justify-center"
                >
                  <p className="text-sm text-muted-foreground">
                    Map view available with Mapbox integration
                  </p>
                </div>

                {/* Text-based area summary as fallback */}
                <div className="max-w-md mx-auto">
                  <h3 className="text-sm font-medium mb-3">
                    Signal Areas Summary
                  </h3>
                  <div className="space-y-2">
                    {Object.entries(areaSignalCounts).map(([area, count]) => (
                      <div
                        key={area}
                        className="flex items-center justify-between bg-muted/30 rounded-md px-3 py-2"
                      >
                        <span className="text-sm">{area}</span>
                        <Badge variant="secondary">
                          {count} signal{count !== 1 ? "s" : ""}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          // No token - show text-based view
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-sm">
                Signal Areas (Text View)
              </CardTitle>
              <CardDescription>
                Geographic context without map visualization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Map visualization requires a Mapbox token. Below is a text-based
                summary of signal areas. This information is also available in
                the Timeline view.
              </p>

              <Separator />

              {/* Area list */}
              <div className="space-y-3">
                {Object.entries(areaSignalCounts).length > 0 ? (
                  Object.entries(areaSignalCounts)
                    .sort((a, b) => b[1] - a[1])
                    .map(([area, count]) => (
                      <AreaCard
                        key={area}
                        area={area}
                        count={count}
                        signals={signals}
                      />
                    ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No signals with geographic context in this period.
                  </p>
                )}
              </div>

              <Separator />

              {/* Koreatown context */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2">About Koreatown</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Koreatown (K-Town) is a neighborhood in central Los Angeles,
                  roughly bounded by Beverly Blvd (north), Olympic Blvd (south),
                  Vermont Ave (east), and Western Ave (west).
                </p>
                <p className="text-xs text-muted-foreground">
                  This prototype focuses on K-Town as a geographic scope.
                  Geography is contextual—the tool works primarily through
                  temporal signals rather than location tracking.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          All geographic data is generalized to neighborhood level. For detailed
          planning, use the Timeline and Guidance tabs.
        </p>
      </div>
    </div>
  );
}

/**
 * Area card showing signals for a geographic area.
 */
function AreaCard({
  area,
  count,
  signals,
}: {
  area: string;
  count: number;
  signals: TemporalSignal[];
}) {
  // Get signals for this area
  const areaSignals = signals.filter(
    (s) =>
      s.geographyHint?.description === area ||
      (area === "General Koreatown" &&
        !s.geographyHint?.description &&
        s.geographyHint)
  );

  // Group by signal type
  const typeGroups = areaSignals.reduce((acc, signal) => {
    acc[signal.signalType] = (acc[signal.signalType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className="bg-muted/20">
      <CardContent className="py-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-medium">{area}</h4>
          <Badge variant="outline">
            {count} signal{count !== 1 ? "s" : ""}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-1">
          {Object.entries(typeGroups).map(([type, typeCount]) => (
            <Badge key={type} variant="secondary" className="text-xs">
              {formatSignalType(type)}: {typeCount}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Format signal type for display.
 */
function formatSignalType(type: string): string {
  const labels: Record<string, string> = {
    sanitationCycle: "Sanitation",
    publicEvent: "Event",
    shelterIntakeHours: "Shelter",
    transitDisruption: "Transit",
    serviceBottleneck: "Bottleneck",
  };
  return labels[type] || type;
}
