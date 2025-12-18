/**
 * KOREATOWN GEOGRAPHIC CONSTANTS
 * 
 * ETHICAL DESIGN NOTE - WHY NEIGHBORHOOD-BOUNDED?
 * 
 * This tool intentionally focuses on a single neighborhood (Koreatown)
 * rather than the entire city of Los Angeles. This is a deliberate
 * design choice to:
 * 
 * 1. AVOID SURVEILLANCE POSTURE: A city-wide view would resemble
 *    law enforcement command centers. Neighborhood focus keeps the
 *    tool grounded in community-level awareness.
 * 
 * 2. SUPPORT LOCALIZED RESPONSE: Service organizations work in
 *    specific areas. Citywide data creates noise, not insight.
 * 
 * 3. ENABLE COMMUNITY TRUST: Residents and advocates can verify
 *    that the tool respects geographic boundaries.
 * 
 * EXPANSION NOTE:
 * The architecture supports adding other neighborhoods, but each
 * addition should be a deliberate choice with community input,
 * not an automatic scaling decision.
 */

import type { LngLatBoundsLike } from 'mapbox-gl';

/**
 * Koreatown center coordinates.
 * Approximate center of the K-Town neighborhood.
 */
export const KOREATOWN_CENTER: [number, number] = [
  -118.3009, // longitude
  34.0612    // latitude
];

/**
 * Koreatown bounding box.
 * Defines the hard limits of the map view.
 * 
 * Boundaries (approximate):
 * - North: Beverly Blvd
 * - South: Pico Blvd / Olympic Blvd
 * - East: Vermont Ave
 * - West: Western Ave
 */
export const KOREATOWN_BOUNDS: LngLatBoundsLike = [
  [-118.3189, 34.0472], // Southwest corner [lng, lat]
  [-118.2829, 34.0752]  // Northeast corner [lng, lat]
];

/**
 * Extended bounds with padding for map context.
 * Allows users to see slightly beyond K-Town for orientation,
 * but prevents panning to entirely different areas.
 */
export const KOREATOWN_MAX_BOUNDS: LngLatBoundsLike = [
  [-118.3389, 34.0272], // Southwest with padding
  [-118.2629, 34.0952]  // Northeast with padding
];

/**
 * Default zoom level for the map.
 * Shows the whole neighborhood at a glance.
 */
export const DEFAULT_ZOOM = 14;

/**
 * Minimum zoom level (max zoom out).
 * Prevents zooming out to city/region level.
 */
export const MIN_ZOOM = 13;

/**
 * Maximum zoom level (max zoom in).
 * Allows street-level detail for outreach planning.
 */
export const MAX_ZOOM = 18;

/**
 * Helper: Check if coordinates are within Koreatown bounds.
 */
export function isWithinKoreatown(lng: number, lat: number): boolean {
  const [[swLng, swLat], [neLng, neLat]] = KOREATOWN_BOUNDS as [[number, number], [number, number]];
  return lng >= swLng && lng <= neLng && lat >= swLat && lat <= neLat;
}

/**
 * Helper: Clamp coordinates to Koreatown bounds.
 * Used to ensure generated/mock data stays within scope.
 */
export function clampToKoreatown(lng: number, lat: number): [number, number] {
  const [[swLng, swLat], [neLng, neLat]] = KOREATOWN_BOUNDS as [[number, number], [number, number]];
  return [
    Math.max(swLng, Math.min(neLng, lng)),
    Math.max(swLat, Math.min(neLat, lat))
  ];
}

/**
 * Map style URL.
 * Using Mapbox's light style for a clean, professional appearance.
 * 
 * NOTE: Requires NEXT_PUBLIC_MAPBOX_TOKEN environment variable.
 */
export const MAP_STYLE = 'mapbox://styles/mapbox/light-v11';

/**
 * Neighborhood metadata for display.
 */
export const KOREATOWN_INFO = {
  name: 'Koreatown',
  shortName: 'K-Town',
  city: 'Los Angeles',
  state: 'CA',
  description: 'A densely populated neighborhood in central Los Angeles, known for its vibrant Korean-American community and commercial districts.',
  // Approximate population and area for context
  approximatePopulation: 120000,
  approximateAreaSqMiles: 2.7,
};


