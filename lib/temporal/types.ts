/**
 * TEMPORAL SIGNAL TYPES
 *
 * These types define the shape of temporal signals used in the Outreach Window Planner.
 * Unlike the previous GeoJSON-first CivicSignal, these are TIME-FIRST by design.
 *
 * ETHICAL DESIGN DECISIONS:
 *
 * 1. TIME OVER SPACE: Geography is optional context, not the primary dimension.
 *    This prevents the tool from being used as a location tracker.
 *
 * 2. NO INDIVIDUAL DATA: Signals represent institutional activity, environmental
 *    conditions, or aggregated patterns—never individuals.
 *
 * 3. MANDATORY LATENCY: Every signal must declare how delayed the data is
 *    (`dataLatencyHours`) and whether it's simulated (`isSimulated`).
 *
 * 4. INTERPRETATION REQUIRED: Raw data without context is dangerous.
 *    Every signal includes interpretation notes for service providers.
 *
 * 5. IMPACT FRAMING: We use "impact" (on outreach effectiveness) rather than
 *    "pressure" or "risk" to avoid surveillance/enforcement connotations.
 */

import type { Feature, Point, Polygon, LineString } from "geojson";

/**
 * Types of temporal signals that affect outreach timing.
 * These represent institutional/environmental rhythms, not individual activity.
 *
 * EXPLICITLY EXCLUDED (by design):
 * - Individual locations or movements
 * - Real-time law enforcement positions
 * - ICE or immigration enforcement activity
 * - Personal identifying information
 */
export type TemporalSignalType =
  | "sanitationCycle" // Regular cleanup schedules
  | "publicEvent" // Permitted events that may affect area
  | "shelterIntakeHours" // Shelter availability windows
  | "transitDisruption" // Service changes affecting mobility
  | "serviceBottleneck"; // Known service capacity constraints

/**
 * Impact levels for outreach timing.
 * - low: Minor effect on outreach effectiveness
 * - medium: Moderate effect, plan accordingly
 * - high: Significant effect, consider alternative timing
 */
export type ImpactLevel = "low" | "medium" | "high";

/**
 * Confidence levels for signal data.
 * Organizations should weight decisions accordingly.
 */
export type ConfidenceLevel = "low" | "medium" | "high";

/**
 * Time range with timezone (always LA for this prototype).
 */
export interface TimeRange {
  start: string; // ISO 8601
  end: string; // ISO 8601
  timezone: "America/Los_Angeles";
}

/**
 * Optional geographic context for a signal.
 * This is SECONDARY information—the tool works without it.
 *
 * ETHICAL NOTE: Geography is generalized (neighborhood-level) and optional.
 * It provides context, not tracking capability.
 */
export interface GeographyHint {
  neighborhood: "Koreatown"; // Fixed for prototype
  description?: string; // e.g., "Near Wilshire/Vermont"
  geometry?: Feature<Point | Polygon | LineString>;
}

/**
 * The canonical temporal signal type.
 * All data sources must normalize to this shape.
 */
export interface TemporalSignal {
  /** Unique identifier for the signal */
  id: string;

  /** Category of temporal activity */
  signalType: TemporalSignalType;

  /**
   * Data source identifier.
   * Examples: "LA Sanitation", "FilmLA", "Metro", "LAHSA"
   */
  source: string;

  /**
   * When this signal is active.
   * This is the PRIMARY dimension of the tool.
   */
  timeRange: TimeRange;

  /**
   * How much this signal affects outreach effectiveness.
   * NOT about "risk" or "danger"—about timing suitability.
   */
  impactLevel: ImpactLevel;

  /**
   * How reliable is this data?
   * - low: Unverified, pattern-based, or historical inference
   * - medium: From official source but may change
   * - high: Confirmed, from authoritative source
   */
  confidenceLevel: ConfidenceLevel;

  /** Brief factual description of the signal */
  description: string;

  /**
   * REQUIRED: Contextual interpretation for service providers.
   * Explains WHY this signal matters for outreach timing.
   * Should suggest awareness and coordination, not enforcement.
   */
  interpretationNotes: string;

  /**
   * REQUIRED: How many hours old is this data?
   * 24+ = acceptable for this tool
   *
   * ETHICAL NOTE: We intentionally use delayed data to prevent
   * this tool from enabling real-time surveillance or targeting.
   */
  dataLatencyHours: number;

  /**
   * REQUIRED: Is this data simulated/synthetic?
   * Must be true for all demo/prototype data.
   * UI must clearly label simulated data.
   */
  isSimulated: boolean;

  /**
   * Optional geographic context.
   * Generalized, not precise. For contextual understanding only.
   */
  geographyHint?: GeographyHint;

  /** Optional: Related signals or cross-references */
  relatedSignalIds?: string[];
}

/**
 * API response wrapper for temporal signals.
 * Includes mandatory metadata about data freshness and ethics.
 */
export interface TemporalSignalsResponse {
  /** The signals themselves */
  signals: TemporalSignal[];

  /** Response metadata */
  meta: TemporalSignalsMeta;
}

/**
 * Metadata included with all signal responses.
 */
export interface TemporalSignalsMeta {
  /** When this response was generated */
  generatedAt: string;

  /** Total count of signals returned */
  count: number;

  /**
   * Minimum data latency across all signals (hours).
   * UI should display this prominently.
   */
  minimumLatencyHours: number;

  /** Whether ANY signals in response are simulated */
  containsSimulatedData: boolean;

  /** Time horizon covered by these signals */
  timeHorizon: {
    start: string;
    end: string;
  };

  /**
   * REQUIRED DISCLAIMER
   * Must be displayed in UI whenever signals are shown.
   */
  disclaimer: string;
}

/**
 * Labels and descriptions for signal types.
 * Used for UI display and filtering.
 */
export const SIGNAL_TYPE_INFO: Record<
  TemporalSignalType,
  { label: string; description: string; short: string }
> = {
  sanitationCycle: {
    label: "Sanitation Cycle",
    description: "Scheduled cleanup activities that may affect area access",
    short: "SAN",
  },
  publicEvent: {
    label: "Public Event",
    description:
      "Permitted events that may increase activity and restrict areas",
    short: "EVT",
  },
  shelterIntakeHours: {
    label: "Shelter Intake",
    description: "Shelter availability windows for referrals",
    short: "SHL",
  },
  transitDisruption: {
    label: "Transit Disruption",
    description: "Service changes affecting mobility options",
    short: "TRN",
  },
  serviceBottleneck: {
    label: "Service Bottleneck",
    description: "Known capacity constraints at service points",
    short: "BTL",
  },
};

/**
 * Impact level display configuration.
 * Colors are intentionally muted to avoid alarming visuals.
 */
export const IMPACT_LEVEL_INFO: Record<
  ImpactLevel,
  { label: string; description: string }
> = {
  low: {
    label: "Low Impact",
    description: "Minor effect on outreach timing",
  },
  medium: {
    label: "Medium Impact",
    description: "Consider timing adjustments",
  },
  high: {
    label: "High Impact",
    description: "Significant timing considerations",
  },
};
