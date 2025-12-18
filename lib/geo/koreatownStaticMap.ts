/**
 * KOREATOWN STATIC MAP CONFIGURATION
 *
 * This module provides configuration and coordinate transformation utilities
 * for the static image-based map of Koreatown. It replaces the live Mapbox
 * tile system with a single high-resolution basemap image.
 *
 * The coordinate transforms use Web Mercator (EPSG:3857) math to ensure
 * accurate positioning of geographic features on the image.
 */

// =============================================================================
// IMAGE CONFIGURATION
// =============================================================================

/**
 * Path to the static basemap image (served from public/).
 * WebP format for optimal file size with high quality.
 */
export const KOREATOWN_IMAGE_URL = "/maps/koreatown.webp";

/**
 * Fallback PNG for browsers without WebP support.
 */
export const KOREATOWN_IMAGE_URL_FALLBACK = "/maps/koreatown.png";

/**
 * Image dimensions in pixels.
 * Generated at zoom level 16 with @2x tiles (512px each).
 */
export const KOREATOWN_IMAGE_WIDTH = 7168;
export const KOREATOWN_IMAGE_HEIGHT = 8192;

/**
 * Geographic bounds of the image (WGS84 coordinates).
 * These are the exact bounds covered by the tile grid, not the
 * original requested bounds.
 */
export const KOREATOWN_IMAGE_BOUNDS = {
  west: -118.3392333984375,
  east: -118.2623291015625,
  north: 34.098159345215535,
  south: 34.02534773814794,
} as const;

/**
 * Map attribution text (required for OpenStreetMap/CARTO data).
 */
export const KOREATOWN_ATTRIBUTION =
  "© OpenStreetMap contributors, © CARTO";

// =============================================================================
// COORDINATE TRANSFORMATION
// =============================================================================

/**
 * Convert longitude to Web Mercator X coordinate.
 */
function lngToMercatorX(lng: number): number {
  return ((lng + 180) / 360) * 256;
}

/**
 * Convert latitude to Web Mercator Y coordinate.
 */
function latToMercatorY(lat: number): number {
  const latRad = (lat * Math.PI) / 180;
  return (
    ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) *
    256
  );
}

/**
 * Convert geographic coordinates (WGS84) to pixel coordinates on the static image.
 *
 * @param lng - Longitude in degrees
 * @param lat - Latitude in degrees
 * @returns {x, y} pixel coordinates relative to the image top-left corner
 */
export function latLngToPixel(
  lng: number,
  lat: number
): { x: number; y: number } {
  const { west, east, north, south } = KOREATOWN_IMAGE_BOUNDS;

  // Convert bounds to Mercator
  const mercWest = lngToMercatorX(west);
  const mercEast = lngToMercatorX(east);
  const mercNorth = latToMercatorY(north);
  const mercSouth = latToMercatorY(south);

  // Convert point to Mercator
  const mercX = lngToMercatorX(lng);
  const mercY = latToMercatorY(lat);

  // Normalize to [0, 1] within bounds
  const normalizedX = (mercX - mercWest) / (mercEast - mercWest);
  const normalizedY = (mercY - mercNorth) / (mercSouth - mercNorth);

  // Scale to image pixels
  const x = normalizedX * KOREATOWN_IMAGE_WIDTH;
  const y = normalizedY * KOREATOWN_IMAGE_HEIGHT;

  return { x, y };
}

/**
 * Convert pixel coordinates on the static image to geographic coordinates (WGS84).
 *
 * @param x - X pixel coordinate
 * @param y - Y pixel coordinate
 * @returns {lng, lat} geographic coordinates in degrees
 */
export function pixelToLatLng(
  x: number,
  y: number
): { lng: number; lat: number } {
  const { west, east, north, south } = KOREATOWN_IMAGE_BOUNDS;

  // Convert bounds to Mercator
  const mercWest = lngToMercatorX(west);
  const mercEast = lngToMercatorX(east);
  const mercNorth = latToMercatorY(north);
  const mercSouth = latToMercatorY(south);

  // Normalize pixel coordinates to [0, 1]
  const normalizedX = x / KOREATOWN_IMAGE_WIDTH;
  const normalizedY = y / KOREATOWN_IMAGE_HEIGHT;

  // Convert to Mercator
  const mercX = mercWest + normalizedX * (mercEast - mercWest);
  const mercY = mercNorth + normalizedY * (mercSouth - mercNorth);

  // Convert Mercator to geographic
  const lng = (mercX / 256) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * mercY) / 256;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));

  return { lng, lat };
}

/**
 * Check if a geographic coordinate is within the image bounds.
 */
export function isWithinImageBounds(lng: number, lat: number): boolean {
  const { west, east, north, south } = KOREATOWN_IMAGE_BOUNDS;
  return lng >= west && lng <= east && lat >= south && lat <= north;
}

/**
 * Clamp geographic coordinates to the image bounds.
 */
export function clampToImageBounds(
  lng: number,
  lat: number
): { lng: number; lat: number } {
  const { west, east, north, south } = KOREATOWN_IMAGE_BOUNDS;
  return {
    lng: Math.max(west, Math.min(east, lng)),
    lat: Math.max(south, Math.min(north, lat)),
  };
}

// =============================================================================
// VIEW CONFIGURATION
// =============================================================================

/**
 * Default view center (pixel coordinates).
 * Centered on the Koreatown core.
 */
export const DEFAULT_CENTER = latLngToPixel(-118.3009, 34.0612);

/**
 * Default zoom scale for initial view.
 * 1.0 = fit entire image, higher = zoomed in.
 */
export const DEFAULT_SCALE = 1.0;

/**
 * Zoom constraints.
 */
export const MIN_SCALE = 0.5; // Can zoom out to see 2x the area
export const MAX_SCALE = 4.0; // Can zoom in to 4x detail

/**
 * Zoom step multiplier for scroll/pinch.
 */
export const ZOOM_STEP = 1.15;


