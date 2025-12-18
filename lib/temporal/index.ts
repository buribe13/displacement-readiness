/**
 * TEMPORAL MODULE INDEX
 *
 * Central export for all temporal signal types, mock data, and aggregation.
 *
 * DESIGN PHILOSOPHY:
 * This module provides the core data layer for the Outreach Window Planner.
 * All exports are time-first by design—geography is optional context.
 */

// Types
export type {
  TemporalSignalType,
  ImpactLevel,
  ConfidenceLevel,
  TimeRange,
  GeographyHint,
  TemporalSignal,
  TemporalSignalsResponse,
  TemporalSignalsMeta,
} from "./types";

export { SIGNAL_TYPE_INFO, IMPACT_LEVEL_INFO } from "./types";

// Mock data
export {
  mockTemporalSignals,
  getSignalsByType,
  getSignalsInRange,
  getSignalsByImpact,
  TEMPORAL_DATA_DISCLAIMER,
} from "./mock";

// Aggregation
export type {
  WindowType,
  OutreachWindow,
  SignalOverlap,
  OutreachWindowsResponse,
} from "./aggregate";

export {
  findSignalOverlaps,
  computeOutreachWindows,
  applyScenarioMode,
} from "./aggregate";
