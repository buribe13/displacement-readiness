"use client";

/**
 * STATIC KOREATOWN MAP
 *
 * Interactive static map using the pre-rendered basemap image.
 * Supports pan and zoom via CSS transforms.
 */

import { useState, useRef, useCallback, useEffect } from "react";
import {
  KOREATOWN_IMAGE_URL,
  KOREATOWN_IMAGE_URL_FALLBACK,
  KOREATOWN_IMAGE_WIDTH,
  KOREATOWN_IMAGE_HEIGHT,
  KOREATOWN_ATTRIBUTION,
  MIN_SCALE,
  MAX_SCALE,
  ZOOM_STEP,
} from "@/lib/geo/koreatownStaticMap";

interface StaticKoreatownMapProps {
  children?: React.ReactNode;
  className?: string;
}

export function StaticKoreatownMap({
  children,
  className = "",
}: StaticKoreatownMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.15); // Start zoomed out to fit the view
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);

  // Center the map initially
  useEffect(() => {
    if (containerRef.current && imageLoaded) {
      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Calculate initial offset to center the map
      const scaledWidth = KOREATOWN_IMAGE_WIDTH * scale;
      const scaledHeight = KOREATOWN_IMAGE_HEIGHT * scale;

      setOffset({
        x: (containerWidth - scaledWidth) / 2,
        y: (containerHeight - scaledHeight) / 2,
      });
    }
  }, [imageLoaded, scale]);

  // Handle wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();

      const container = containerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calculate new scale
      const direction = e.deltaY < 0 ? 1 : -1;
      const newScale = Math.min(
        MAX_SCALE,
        Math.max(MIN_SCALE, scale * (direction > 0 ? ZOOM_STEP : 1 / ZOOM_STEP))
      );

      if (newScale === scale) return;

      // Adjust offset to zoom toward mouse position
      const scaleRatio = newScale / scale;
      const newOffsetX = mouseX - (mouseX - offset.x) * scaleRatio;
      const newOffsetY = mouseY - (mouseY - offset.y) * scaleRatio;

      setScale(newScale);
      setOffset({ x: newOffsetX, y: newOffsetY });
    },
    [scale, offset]
  );

  // Handle drag start
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return; // Left click only
      setIsDragging(true);
      setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
    },
    [offset]
  );

  // Handle drag move
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return;
      setOffset({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    },
    [isDragging, dragStart]
  );

  // Handle drag end
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-muted/30 ${className}`}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ cursor: isDragging ? "grabbing" : "grab" }}
    >
      {/* Map Image */}
      <div
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: "0 0",
          width: KOREATOWN_IMAGE_WIDTH,
          height: KOREATOWN_IMAGE_HEIGHT,
          position: "absolute",
        }}
      >
        <picture>
          <source srcSet={KOREATOWN_IMAGE_URL} type="image/webp" />
          <img
            src={KOREATOWN_IMAGE_URL_FALLBACK}
            alt="Koreatown Map"
            width={KOREATOWN_IMAGE_WIDTH}
            height={KOREATOWN_IMAGE_HEIGHT}
            onLoad={() => setImageLoaded(true)}
            style={{ display: "block" }}
            draggable={false}
          />
        </picture>

        {/* Overlay children (markers, etc.) */}
        {children}
      </div>

      {/* Loading state */}
      {!imageLoaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-sm text-muted-foreground">Loading map...</p>
        </div>
      )}

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1">
        <button
          onClick={() => setScale((s) => Math.min(MAX_SCALE, s * ZOOM_STEP))}
          onMouseDown={(e) => e.stopPropagation()}
          className="h-8 w-8 bg-background border rounded-md flex items-center justify-center hover:bg-accent text-lg"
          title="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => setScale((s) => Math.max(MIN_SCALE, s / ZOOM_STEP))}
          onMouseDown={(e) => e.stopPropagation()}
          className="h-8 w-8 bg-background border rounded-md flex items-center justify-center hover:bg-accent text-lg"
          title="Zoom out"
        >
          −
        </button>
      </div>

      {/* Attribution */}
      <div className="absolute bottom-2 left-2 text-[10px] text-muted-foreground bg-background/80 px-1 rounded">
        {KOREATOWN_ATTRIBUTION}
      </div>
    </div>
  );
}
