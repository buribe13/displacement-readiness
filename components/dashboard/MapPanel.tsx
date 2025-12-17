/**
 * MAP PANEL COMPONENT
 *
 * Interactive map visualization of civic signals in Koreatown.
 *
 * ETHICAL DESIGN DECISIONS:
 *
 * 1. BOUNDED TO KOREATOWN
 *    The map is intentionally limited to a single neighborhood.
 *    This prevents "surveillance creep" and keeps focus on
 *    community-level situational awareness.
 *
 * 2. NO REAL-TIME DATA
 *    All displayed data is delayed or simulated.
 *    The UI prominently labels this.
 *
 * 3. MUTED COLORS
 *    Pressure level colors are intentionally subdued to avoid
 *    alarming visuals. This is a planning tool, not an emergency system.
 *
 * 4. LAYER TOGGLES
 *    Users can control what they see, supporting focused analysis
 *    rather than overwhelming "everything at once" views.
 */

"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

import type {
  CivicSignal,
  SignalKind,
  PressureLevel,
} from "@/lib/signals/types";
import {
  KOREATOWN_CENTER,
  KOREATOWN_MAX_BOUNDS,
  DEFAULT_ZOOM,
  MIN_ZOOM,
  MAX_ZOOM,
  MAP_STYLE,
} from "@/lib/geo/koreatown";

// Set Mapbox access token from environment
// Access token at module level for client component
const MAPBOX_TOKEN =
  typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ""
    : "";
mapboxgl.accessToken = MAPBOX_TOKEN;

/**
 * Color configuration for signal kinds.
 * Intentionally muted to avoid alarming visuals.
 */
const SIGNAL_COLORS: Record<SignalKind, string> = {
  sanitation: "#6B8E7B", // Muted sage green
  eventPermit: "#8B7B6B", // Muted tan/brown
  roadClosure: "#7B7B8B", // Muted slate
  transitDisruption: "#6B7B8B", // Muted blue-gray
  displacementIndicator: "#8B6B6B", // Muted terracotta
};

/**
 * Labels for signal kinds.
 */
const SIGNAL_LABELS: Record<SignalKind, string> = {
  sanitation: "Sanitation Schedules",
  eventPermit: "Event Permits",
  roadClosure: "Road Closures",
  transitDisruption: "Transit Disruptions",
  displacementIndicator: "Displacement Indicators",
};

/**
 * Pressure level colors (for legend display).
 */
const PRESSURE_COLORS: Record<
  PressureLevel,
  { bg: string; text: string; label: string }
> = {
  low: {
    bg: "bg-[oklch(0.95_0.02_145)]",
    text: "text-[oklch(0.35_0.05_145)]",
    label: "Low",
  },
  elevated: {
    bg: "bg-[oklch(0.93_0.03_75)]",
    text: "text-[oklch(0.35_0.08_75)]",
    label: "Elevated",
  },
  high: {
    bg: "bg-[oklch(0.92_0.04_35)]",
    text: "text-[oklch(0.35_0.1_35)]",
    label: "High",
  },
};

interface MapPanelProps {
  signals: CivicSignal[];
  pressureLevel?: PressureLevel;
  onSignalClick?: (signal: CivicSignal) => void;
}

export function MapPanel({
  signals,
  pressureLevel = "low",
  onSignalClick,
}: MapPanelProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [layerVisibility, setLayerVisibility] = useState<
    Record<SignalKind, boolean>
  >({
    sanitation: true,
    eventPermit: true,
    roadClosure: true,
    transitDisruption: true,
    displacementIndicator: true,
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Get token from environment (client-side)
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

    // Debug logging (remove in production)
    if (typeof window !== "undefined") {
      console.log("Mapbox token check:", {
        hasToken: !!token,
        tokenLength: token.length,
        tokenPrefix: token.substring(0, 10) + "...",
      });
    }

    if (!token) {
      console.error("Mapbox token not set. Map will not load.");
      console.error(
        "Please set NEXT_PUBLIC_MAPBOX_TOKEN in your .env.local file"
      );
      console.error("Then restart your development server (npm run dev)");
      return;
    }

    // Set token if not already set
    if (!mapboxgl.accessToken) {
      mapboxgl.accessToken = token;
    }

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: MAP_STYLE,
      center: KOREATOWN_CENTER,
      zoom: DEFAULT_ZOOM,
      minZoom: MIN_ZOOM,
      maxZoom: MAX_ZOOM,
      maxBounds: KOREATOWN_MAX_BOUNDS,
      // Disable rotation for simplicity
      pitchWithRotate: false,
      dragRotate: false,
    });

    map.current.on("load", () => {
      setMapLoaded(true);
    });

    // Add navigation controls (zoom only, no rotation)
    map.current.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-left"
    );

    // Cleanup
    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Add signal layers when map loads
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    // Group signals by kind for layers
    const signalsByKind = signals.reduce((acc, signal) => {
      if (!acc[signal.kind]) acc[signal.kind] = [];
      acc[signal.kind].push(signal);
      return acc;
    }, {} as Record<SignalKind, CivicSignal[]>);

    // Add a source and layer for each signal kind
    Object.entries(signalsByKind).forEach(([kind, kindSignals]) => {
      const sourceId = `signals-${kind}`;
      const layerId = `signals-${kind}-layer`;

      // Create GeoJSON from signals
      const geojson: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: kindSignals.map((s) => ({
          ...s.geography,
          properties: {
            ...s.geography.properties,
            signalId: s.id,
            description: s.description,
            interpretation: s.interpretation,
            confidence: s.confidenceLevel,
            source: s.source,
            isSimulated: s.isSimulated,
          },
        })),
      };

      // Remove existing source/layer if present
      if (map.current!.getLayer(layerId)) {
        map.current!.removeLayer(layerId);
      }
      if (map.current!.getLayer(`${layerId}-line`)) {
        map.current!.removeLayer(`${layerId}-line`);
      }
      if (map.current!.getLayer(`${layerId}-fill`)) {
        map.current!.removeLayer(`${layerId}-fill`);
      }
      if (map.current!.getSource(sourceId)) {
        map.current!.removeSource(sourceId);
      }

      // Add source
      map.current!.addSource(sourceId, {
        type: "geojson",
        data: geojson,
      });

      // Add circle layer for points
      map.current!.addLayer({
        id: layerId,
        type: "circle",
        source: sourceId,
        filter: ["==", "$type", "Point"],
        paint: {
          "circle-radius": 8,
          "circle-color": SIGNAL_COLORS[kind as SignalKind],
          "circle-opacity": 0.8,
          "circle-stroke-width": 2,
          "circle-stroke-color": "#ffffff",
        },
        layout: {
          visibility: layerVisibility[kind as SignalKind] ? "visible" : "none",
        },
      });

      // Add line layer for LineStrings
      map.current!.addLayer({
        id: `${layerId}-line`,
        type: "line",
        source: sourceId,
        filter: ["==", "$type", "LineString"],
        paint: {
          "line-color": SIGNAL_COLORS[kind as SignalKind],
          "line-width": 4,
          "line-opacity": 0.7,
        },
        layout: {
          visibility: layerVisibility[kind as SignalKind] ? "visible" : "none",
        },
      });

      // Add fill layer for Polygons
      map.current!.addLayer({
        id: `${layerId}-fill`,
        type: "fill",
        source: sourceId,
        filter: ["==", "$type", "Polygon"],
        paint: {
          "fill-color": SIGNAL_COLORS[kind as SignalKind],
          "fill-opacity": 0.3,
        },
        layout: {
          visibility: layerVisibility[kind as SignalKind] ? "visible" : "none",
        },
      });

      // Add click handler for popups
      map.current!.on("click", layerId, (e) => {
        if (!e.features?.[0]) return;

        const props = e.features[0].properties;
        const signal = signals.find((s) => s.id === props?.signalId);

        if (signal && onSignalClick) {
          onSignalClick(signal);
        }

        // Show popup
        const coordinates = (
          e.features[0].geometry as GeoJSON.Point
        ).coordinates.slice() as [number, number];

        new mapboxgl.Popup({ closeOnClick: true, maxWidth: "300px" })
          .setLngLat(coordinates)
          .setHTML(
            `
            <div style="font-family: system-ui; font-size: 13px;">
              <div style="font-weight: 600; margin-bottom: 4px;">${
                props?.description || "Signal"
              }</div>
              <div style="color: #666; font-size: 11px; margin-bottom: 8px;">
                Source: ${props?.source || "Unknown"}
                ${
                  props?.isSimulated
                    ? '<span style="background: #f0f0f0; padding: 1px 4px; border-radius: 3px; margin-left: 4px;">Simulated</span>'
                    : ""
                }
              </div>
              <div style="font-size: 12px; color: #444;">${
                props?.interpretation || ""
              }</div>
              <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid #eee; font-size: 10px; color: #888;">
                Confidence: ${
                  props?.confidence || "unknown"
                } · Data is delayed/simulated
              </div>
            </div>
          `
          )
          .addTo(map.current!);
      });

      // Change cursor on hover
      map.current!.on("mouseenter", layerId, () => {
        if (map.current) map.current.getCanvas().style.cursor = "pointer";
      });
      map.current!.on("mouseleave", layerId, () => {
        if (map.current) map.current.getCanvas().style.cursor = "";
      });
    });
  }, [mapLoaded, signals, layerVisibility, onSignalClick]);

  // Update layer visibility
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    Object.entries(layerVisibility).forEach(([kind, visible]) => {
      const visibility = visible ? "visible" : "none";
      const layerId = `signals-${kind}-layer`;

      if (map.current!.getLayer(layerId)) {
        map.current!.setLayoutProperty(layerId, "visibility", visibility);
      }
      if (map.current!.getLayer(`${layerId}-line`)) {
        map.current!.setLayoutProperty(
          `${layerId}-line`,
          "visibility",
          visibility
        );
      }
      if (map.current!.getLayer(`${layerId}-fill`)) {
        map.current!.setLayoutProperty(
          `${layerId}-fill`,
          "visibility",
          visibility
        );
      }
    });
  }, [mapLoaded, layerVisibility]);

  const toggleLayer = useCallback((kind: SignalKind) => {
    setLayerVisibility((prev) => ({
      ...prev,
      [kind]: !prev[kind],
    }));
  }, []);

  return (
    <Card className="h-full flex flex-col min-h-0">
      <CardHeader className="py-3 px-4 flex-none">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">
            Koreatown Map View
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Simulated Data
            </Badge>

            {/* Layer Controls */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Layers
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Toggle Signal Layers</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(Object.keys(SIGNAL_LABELS) as SignalKind[]).map((kind) => (
                  <div
                    key={kind}
                    className="flex items-center gap-2 px-2 py-1.5 cursor-pointer hover:bg-accent"
                    onClick={() => toggleLayer(kind)}
                  >
                    <Checkbox
                      checked={layerVisibility[kind]}
                      onCheckedChange={() => toggleLayer(kind)}
                    />
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: SIGNAL_COLORS[kind] }}
                    />
                    <span className="text-sm">{SIGNAL_LABELS[kind]}</span>
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <Separator />

      <CardContent
        className="flex-1 p-0 relative min-h-0"
        style={{ minHeight: "400px" }}
      >
        {/* Map Container */}
        <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

        {/* No token warning */}
        {!mapboxgl.accessToken && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/80 z-10">
            <div className="text-center p-4">
              <p className="text-sm font-medium">Mapbox Token Required</p>
              <p className="text-xs text-muted-foreground mt-1">
                Set NEXT_PUBLIC_MAPBOX_TOKEN in your .env.local file
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Then restart your development server
              </p>
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-background/95 border rounded-md p-3 text-xs space-y-3 max-w-[200px]">
          {/* Signal Types */}
          <div>
            <div className="font-medium mb-2">Signal Types</div>
            <div className="space-y-1">
              {(Object.keys(SIGNAL_LABELS) as SignalKind[]).map((kind) => (
                <div key={kind} className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: SIGNAL_COLORS[kind] }}
                  />
                  <span className="text-muted-foreground">
                    {SIGNAL_LABELS[kind]}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Pressure Levels */}
          <div>
            <div className="font-medium mb-2">Pressure Levels</div>
            <div className="space-y-1">
              {(Object.keys(PRESSURE_COLORS) as PressureLevel[]).map(
                (level) => (
                  <div key={level} className="flex items-center gap-2">
                    <div
                      className={`w-2.5 h-2.5 rounded ${PRESSURE_COLORS[level].bg}`}
                    />
                    <span className="text-muted-foreground">
                      {PRESSURE_COLORS[level].label}
                    </span>
                  </div>
                )
              )}
            </div>
          </div>

          <Separator />

          {/* Data Notice */}
          <div className="text-muted-foreground">
            All data is simulated or delayed (24h+). Not for real-time
            decisions.
          </div>
        </div>

        {/* Current Pressure Indicator */}
        <div className="absolute top-4 right-4">
          <div
            className={`${PRESSURE_COLORS[pressureLevel].bg} ${PRESSURE_COLORS[pressureLevel].text} px-3 py-1.5 rounded-md text-xs font-medium`}
          >
            Pressure: {PRESSURE_COLORS[pressureLevel].label}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
