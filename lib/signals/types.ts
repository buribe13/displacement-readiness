/**
 * CANONICAL SIGNAL TYPES
 * 
 * These types define the shape of civic signals displayed in the dashboard.
 * All data sources (real or mocked) must be normalized to this schema.
 * 
 * ETHICAL DESIGN DECISIONS:
 * 
 * 1. NO INDIVIDUAL TRACKING: Signals represent institutional activity,
 *    environmental conditions, or aggregated patterns - never individuals.
 * 
 * 2. MANDATORY LATENCY DISCLOSURE: Every signal must declare how delayed
 *    the data is (`dataLatencyHours`) and whether it's simulated (`isSimulated`).
 *    This prevents misuse as a real-time surveillance tool.
 * 
 * 3. CONFIDENCE LEVELS: Organizations must understand data reliability.
 *    Low-confidence signals should inform awareness, not drive action.
 * 
 * 4. INTERPRETATION FIELD: Raw data without context is dangerous.
 *    Every signal includes a brief interpretation for service providers.
 */

import type { Feature, FeatureCollection, Point, Polygon, LineString } from 'geojson';

/**
 * Signal categories - types of civic activity we track.
 * These are intentionally LIMITED to institutional/environmental factors.
 * 
 * EXPLICITLY EXCLUDED (by design):
 * - Individual locations or movements
 * - Real-time law enforcement positions
 * - ICE or immigration enforcement activity
 * - Personal identifying information
 */
export type SignalKind =
  | 'sanitation'           // Scheduled cleanups (often precede sweeps)
  | 'eventPermit'          // Large events that may trigger enforcement
  | 'roadClosure'          // Security perimeters, construction
  | 'transitDisruption'    // Service changes affecting mobility
  | 'displacementIndicator'; // Historical patterns, aggregated data

/**
 * Confidence levels for signal data.
 * Organizations should weight decisions accordingly.
 */
export type ConfidenceLevel = 'low' | 'medium' | 'high';

/**
 * Pressure levels - aggregated displacement risk assessment.
 * These are NEVER about individuals - they represent environmental conditions.
 */
export type PressureLevel = 'low' | 'elevated' | 'high';

/**
 * GeoJSON geometry types we support for signal visualization.
 */
export type SignalGeometry = Feature<Point | Polygon | LineString>;

/**
 * The canonical civic signal type.
 * All data sources must normalize to this shape.
 */
export interface CivicSignal {
  /** Unique identifier for the signal */
  id: string;
  
  /** Category of civic activity */
  kind: SignalKind;
  
  /** 
   * Data source identifier.
   * Examples: "LA Sanitation", "FilmLA", "Metro", "LADOT"
   */
  source: string;
  
  /** 
   * When the event/activity is scheduled or was recorded (ISO 8601).
   * This is the timestamp of the EVENT, not when we received the data.
   */
  timestamp: string;
  
  /**
   * REQUIRED: How many hours old is this data?
   * 0 = live (which we generally avoid)
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
   * Explains WHY this signal matters for displacement readiness.
   * Should suggest awareness, not prescribe action.
   */
  interpretation: string;
  
  /** Geographic representation of the signal */
  geography: SignalGeometry;
  
  /** Optional: Related signals or cross-references */
  relatedSignalIds?: string[];
}

/**
 * API response wrapper for signals.
 * Includes mandatory metadata about data freshness and ethics.
 */
export interface SignalsResponse {
  /** The signals themselves */
  signals: CivicSignal[];
  
  /** Response metadata */
  meta: {
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
    
    /**
     * REQUIRED DISCLAIMER
     * Must be displayed in UI whenever signals are shown.
     */
    disclaimer: string;
  };
}

/**
 * Summary statistics for the dashboard overview.
 * Aggregated, non-individual data only.
 */
export interface SignalsSummary {
  /** Counts by signal kind */
  byKind: Record<SignalKind, number>;
  
  /** Counts by confidence level */
  byConfidence: Record<ConfidenceLevel, number>;
  
  /**
   * Overall displacement pressure assessment.
   * This is a COARSE, aggregate measure - not predictive of
   * individual outcomes.
   */
  pressureLevel: PressureLevel;
  
  /**
   * Human-readable explanation of the pressure assessment.
   * Must acknowledge limitations and uncertainty.
   */
  pressureExplanation: string;
  
  /** Time range of signals included in summary */
  timeRange: {
    start: string;
    end: string;
  };
}

/**
 * Layer toggle configuration for the map.
 * Each layer corresponds to a signal kind.
 */
export interface MapLayerConfig {
  kind: SignalKind;
  label: string;
  description: string;
  enabled: boolean;
  color: string;
}

