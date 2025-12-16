/**
 * MOCK CIVIC SIGNALS
 * 
 * This file contains SIMULATED data shaped like real LA civic datasets.
 * All data here is fictional and intended for prototype demonstration only.
 * 
 * DATA SOURCES SIMULATED:
 * - LA Sanitation cleanup schedules
 * - FilmLA / Special Events permits
 * - LADOT road closures
 * - Metro service advisories
 * - Historical displacement pattern indicators
 * 
 * ETHICAL NOTES:
 * - All timestamps are in the past or near future (no real-time)
 * - All locations are approximate/generalized within Koreatown
 * - No individual-level data is included
 * - All signals are marked as `isSimulated: true`
 */

import type { CivicSignal, SignalKind, ConfidenceLevel } from './types';
import { KOREATOWN_CENTER } from '../geo/koreatown';

/**
 * Generate a random point within Koreatown bounds.
 * Used for creating mock geographic data.
 */
function randomKoreatownPoint(): [number, number] {
  // Koreatown approximate bounds
  const lngMin = -118.3150;
  const lngMax = -118.2870;
  const latMin = -118.3150;
  const latMax = 34.0700;
  
  return [
    lngMin + Math.random() * (lngMax - lngMin),
    34.0520 + Math.random() * (latMax - 34.0520)
  ];
}

/**
 * Generate a date string offset from now.
 * Negative hours = past, positive = future.
 */
function offsetDate(hoursFromNow: number): string {
  const date = new Date();
  date.setHours(date.getHours() + hoursFromNow);
  return date.toISOString();
}

/**
 * MOCK SANITATION SIGNALS
 * Simulates LA Sanitation cleanup schedules.
 * These often correlate with encampment clearing activity.
 */
const sanitationSignals: CivicSignal[] = [
  {
    id: 'san-001',
    kind: 'sanitation',
    source: 'LA Sanitation (Simulated)',
    timestamp: offsetDate(48), // 2 days from now
    dataLatencyHours: 24,
    isSimulated: true,
    confidenceLevel: 'high',
    description: 'Scheduled cleanup: 700 block S Vermont Ave',
    interpretation: 'Scheduled cleanups in this area have historically preceded outreach needs. Consider proactive engagement 24-48 hours before.',
    geography: {
      type: 'Feature',
      properties: { signalId: 'san-001' },
      geometry: {
        type: 'Point',
        coordinates: [-118.2915, 34.0573]
      }
    }
  },
  {
    id: 'san-002',
    kind: 'sanitation',
    source: 'LA Sanitation (Simulated)',
    timestamp: offsetDate(72),
    dataLatencyHours: 24,
    isSimulated: true,
    confidenceLevel: 'high',
    description: 'Scheduled cleanup: Wilshire Blvd corridor, Western to Vermont',
    interpretation: 'Major corridor cleanup. High-traffic commercial area. Multiple service providers typically engage.',
    geography: {
      type: 'Feature',
      properties: { signalId: 'san-002' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-118.3089, 34.0622],
          [-118.2915, 34.0622]
        ]
      }
    }
  },
  {
    id: 'san-003',
    kind: 'sanitation',
    source: 'LA Sanitation (Simulated)',
    timestamp: offsetDate(24),
    dataLatencyHours: 48,
    isSimulated: true,
    confidenceLevel: 'medium',
    description: 'Cleanup completed: 600 block S Normandie Ave',
    interpretation: 'Recent cleanup in residential area. May see temporary relocation patterns.',
    geography: {
      type: 'Feature',
      properties: { signalId: 'san-003' },
      geometry: {
        type: 'Point',
        coordinates: [-118.3004, 34.0585]
      }
    }
  }
];

/**
 * MOCK EVENT PERMIT SIGNALS
 * Simulates FilmLA and special event permits.
 * Large events can trigger security enforcement affecting unhoused residents.
 */
const eventPermitSignals: CivicSignal[] = [
  {
    id: 'evt-001',
    kind: 'eventPermit',
    source: 'FilmLA (Simulated)',
    timestamp: offsetDate(96), // 4 days from now
    dataLatencyHours: 48,
    isSimulated: true,
    confidenceLevel: 'high',
    description: 'Film production: "Street Scene" - 3000 block Wilshire Blvd, 3-day permit',
    interpretation: 'Film productions typically request "clean" streets. Security presence increases. Consider outreach to nearby encampments.',
    geography: {
      type: 'Feature',
      properties: { signalId: 'evt-001' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-118.2980, 34.0635],
          [-118.2940, 34.0635],
          [-118.2940, 34.0610],
          [-118.2980, 34.0610],
          [-118.2980, 34.0635]
        ]]
      }
    }
  },
  {
    id: 'evt-002',
    kind: 'eventPermit',
    source: 'LA Special Events (Simulated)',
    timestamp: offsetDate(168), // 7 days from now
    dataLatencyHours: 72,
    isSimulated: true,
    confidenceLevel: 'medium',
    description: 'Street festival: K-Town Night Market - 6th St between Western and Normandie',
    interpretation: 'Community event with security perimeter. Temporary displacement likely in immediate area. Good opportunity for service outreach at event periphery.',
    geography: {
      type: 'Feature',
      properties: { signalId: 'evt-002' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-118.3089, 34.0637],
          [-118.3004, 34.0637]
        ]
      }
    }
  }
];

/**
 * MOCK ROAD CLOSURE SIGNALS
 * Simulates LADOT closures and security perimeters.
 */
const roadClosureSignals: CivicSignal[] = [
  {
    id: 'road-001',
    kind: 'roadClosure',
    source: 'LADOT (Simulated)',
    timestamp: offsetDate(36),
    dataLatencyHours: 24,
    isSimulated: true,
    confidenceLevel: 'high',
    description: 'Utility work: Olympic Blvd at Irolo St, lane closures 7am-5pm',
    interpretation: 'Construction activity may displace individuals from nearby rest areas. Daytime impact only.',
    geography: {
      type: 'Feature',
      properties: { signalId: 'road-001' },
      geometry: {
        type: 'Point',
        coordinates: [-118.2978, 34.0533]
      }
    }
  },
  {
    id: 'road-002',
    kind: 'roadClosure',
    source: 'LAPD Special Events (Simulated)',
    timestamp: offsetDate(240), // 10 days - Olympics prep scenario
    dataLatencyHours: 168,
    isSimulated: true,
    confidenceLevel: 'low',
    description: 'Preliminary notice: Security perimeter planning for international event venue access routes',
    interpretation: 'EARLY INDICATOR: Major event security planning begins months ahead. This is a signal to monitor, not act on immediately. Coordinate with coalition partners.',
    geography: {
      type: 'Feature',
      properties: { signalId: 'road-002' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-118.3100, 34.0700],
          [-118.2850, 34.0700],
          [-118.2850, 34.0500],
          [-118.3100, 34.0500],
          [-118.3100, 34.0700]
        ]]
      }
    }
  }
];

/**
 * MOCK TRANSIT DISRUPTION SIGNALS
 * Simulates Metro service advisories.
 */
const transitSignals: CivicSignal[] = [
  {
    id: 'transit-001',
    kind: 'transitDisruption',
    source: 'LA Metro (Simulated)',
    timestamp: offsetDate(12),
    dataLatencyHours: 6,
    isSimulated: true,
    confidenceLevel: 'high',
    description: 'Purple Line station closure: Wilshire/Western, weekend maintenance',
    interpretation: 'Station closures affect mobility for all residents. Unhoused individuals may need to relocate from station areas during closure.',
    geography: {
      type: 'Feature',
      properties: { signalId: 'transit-001' },
      geometry: {
        type: 'Point',
        coordinates: [-118.3089, 34.0622]
      }
    }
  },
  {
    id: 'transit-002',
    kind: 'transitDisruption',
    source: 'LA Metro (Simulated)',
    timestamp: offsetDate(720), // 30 days - future scenario
    dataLatencyHours: 48,
    isSimulated: true,
    confidenceLevel: 'medium',
    description: 'Service enhancement: Extended hours for major event access (Olympics prep)',
    interpretation: 'Extended transit service during major events can both help and complicate situations. More activity = more visibility = potential enforcement. Also more mobility options.',
    geography: {
      type: 'Feature',
      properties: { signalId: 'transit-002' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-118.3200, 34.0622],
          [-118.2700, 34.0622]
        ]
      }
    }
  }
];

/**
 * MOCK DISPLACEMENT INDICATOR SIGNALS
 * Simulates historical pattern data and aggregated indicators.
 * These are NOT predictive of individual outcomes.
 */
const displacementIndicatorSignals: CivicSignal[] = [
  {
    id: 'ind-001',
    kind: 'displacementIndicator',
    source: 'Historical Pattern Analysis (Simulated)',
    timestamp: offsetDate(-24), // 1 day ago
    dataLatencyHours: 72,
    isSimulated: true,
    confidenceLevel: 'low',
    description: 'Elevated 311 complaint activity: 500-800 blocks S Western Ave (7-day rolling)',
    interpretation: 'PATTERN SIGNAL: Increased complaints often precede institutional response. This is contextual awareness, not prediction. Complaints may or may not lead to action.',
    geography: {
      type: 'Feature',
      properties: { signalId: 'ind-001' },
      geometry: {
        type: 'LineString',
        coordinates: [
          [-118.3089, 34.0650],
          [-118.3089, 34.0550]
        ]
      }
    }
  },
  {
    id: 'ind-002',
    kind: 'displacementIndicator',
    source: 'Encampment Count Trends (Simulated)',
    timestamp: offsetDate(-168), // 1 week ago
    dataLatencyHours: 168,
    isSimulated: true,
    confidenceLevel: 'low',
    description: 'Population shift: Decrease in MacArthur Park area, increase in central K-Town',
    interpretation: 'TREND SIGNAL: Population movements often indicate displacement from other areas. Central K-Town services may see increased demand.',
    geography: {
      type: 'Feature',
      properties: { signalId: 'ind-002' },
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [-118.3050, 34.0650],
          [-118.2950, 34.0650],
          [-118.2950, 34.0550],
          [-118.3050, 34.0550],
          [-118.3050, 34.0650]
        ]]
      }
    }
  }
];

/**
 * All mock signals combined.
 * Export for use in API routes.
 */
export const mockSignals: CivicSignal[] = [
  ...sanitationSignals,
  ...eventPermitSignals,
  ...roadClosureSignals,
  ...transitSignals,
  ...displacementIndicatorSignals
];

/**
 * Get signals filtered by kind.
 */
export function getSignalsByKind(kind: SignalKind): CivicSignal[] {
  return mockSignals.filter(signal => signal.kind === kind);
}

/**
 * Get signals filtered by confidence level.
 */
export function getSignalsByConfidence(level: ConfidenceLevel): CivicSignal[] {
  return mockSignals.filter(signal => signal.confidenceLevel === level);
}

/**
 * Get signals within a time range.
 */
export function getSignalsInRange(startDate: Date, endDate: Date): CivicSignal[] {
  return mockSignals.filter(signal => {
    const signalDate = new Date(signal.timestamp);
    return signalDate >= startDate && signalDate <= endDate;
  });
}

/**
 * The standard disclaimer that MUST accompany all signal data.
 */
export const DATA_DISCLAIMER = `
This dashboard displays SIMULATED and DELAYED data for demonstration purposes.
It is designed for situational awareness by housing/homelessness service organizations.

THIS TOOL DOES NOT:
• Track individuals
• Show real-time law enforcement locations
• Predict individual displacement events
• Replace direct community engagement

Data should inform awareness and planning, not drive reactive enforcement-style responses.
All signals are at least 24 hours delayed by design.
`.trim();

