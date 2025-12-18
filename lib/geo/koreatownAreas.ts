/**
 * KOREATOWN AREAS
 *
 * Registry of known areas in Koreatown that map to signal geography hints.
 * Used to position signals on the static map.
 */

import { latLngToPixel } from "./koreatownStaticMap";

/**
 * A known area in Koreatown.
 */
export interface KoreatownArea {
  id: string;
  label: string;
  aliases: string[]; // Match against geographyHint.description
  centerLngLat: [number, number]; // [lng, lat]
  centerPixel?: { x: number; y: number }; // Computed from centerLngLat
}

/**
 * Known areas with approximate centers.
 * These match the geographyHint.description values in mock signals.
 */
export const KOREATOWN_AREAS: KoreatownArea[] = [
  {
    id: "vermont-wilshire",
    label: "Vermont & Wilshire",
    aliases: [
      "Vermont Ave between Wilshire and 6th",
      "Near Wilshire/Western Metro station",
      "Near Wilshire/Vermont",
    ],
    centerLngLat: [-118.2917, 34.0618],
  },
  {
    id: "wilshire-corridor",
    label: "Wilshire Corridor",
    aliases: [
      "Wilshire Blvd, Western to Vermont",
      "Wilshire Blvd commercial area",
      "Wilshire corridor",
    ],
    centerLngLat: [-118.3009, 34.0618],
  },
  {
    id: "normandie-residential",
    label: "Normandie Residential",
    aliases: ["Normandie Ave residential area"],
    centerLngLat: [-118.3003, 34.0552],
  },
  {
    id: "6th-st-district",
    label: "6th St District",
    aliases: ["6th St between Western and Normandie"],
    centerLngLat: [-118.3089, 34.0632],
  },
  {
    id: "olympic-vermont",
    label: "Olympic & Vermont",
    aliases: ["Near Olympic/Vermont"],
    centerLngLat: [-118.2917, 34.0537],
  },
  {
    id: "bridge-housing",
    label: "Bridge Housing Area",
    aliases: ["Bridge housing facility"],
    centerLngLat: [-118.305, 34.058],
  },
  {
    id: "general-koreatown",
    label: "General Koreatown",
    aliases: ["General Koreatown area", "General Koreatown area (speculative)"],
    centerLngLat: [-118.3009, 34.0612],
  },
];

// Compute pixel coordinates for each area
KOREATOWN_AREAS.forEach((area) => {
  area.centerPixel = latLngToPixel(area.centerLngLat[0], area.centerLngLat[1]);
});

/**
 * Find an area by its description (fuzzy match against aliases).
 */
export function findAreaByDescription(
  description: string | undefined
): KoreatownArea | undefined {
  if (!description) return undefined;

  const normalizedDesc = description.toLowerCase().trim();

  for (const area of KOREATOWN_AREAS) {
    for (const alias of area.aliases) {
      if (
        alias.toLowerCase().includes(normalizedDesc) ||
        normalizedDesc.includes(alias.toLowerCase())
      ) {
        return area;
      }
    }
  }

  // Fallback to general koreatown
  return KOREATOWN_AREAS.find((a) => a.id === "general-koreatown");
}

/**
 * Group signals by area.
 */
export function groupSignalsByArea(
  signals: { geographyHint?: { description?: string } }[]
): Map<KoreatownArea, typeof signals> {
  const groups = new Map<KoreatownArea, typeof signals>();

  for (const signal of signals) {
    const area = findAreaByDescription(signal.geographyHint?.description);
    if (area) {
      const existing = groups.get(area) || [];
      existing.push(signal);
      groups.set(area, existing);
    }
  }

  return groups;
}
