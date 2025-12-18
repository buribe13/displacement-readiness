/**
 * OUTREACH ALERT TYPES
 *
 * Alerts are saved tasks created from Timeline windows, Overlaps, or Map areas.
 * They help organizers track and coordinate outreach activities.
 */

/**
 * Source of the alert (where it was created from).
 */
export type AlertSource = "timeline" | "overlap" | "map" | "manual";

/**
 * Status of the alert.
 */
export type AlertStatus = "open" | "done";

/**
 * Related IDs linking the alert to its source data.
 */
export interface AlertRelatedIds {
  windowId?: string;
  overlapId?: string;
  signalIds?: string[];
}

/**
 * An Outreach Alert represents a saved task for coordination.
 */
export interface OutreachAlert {
  /** Unique identifier */
  id: string;

  /** Alert title */
  title: string;

  /** Optional notes */
  notes?: string;

  /** Status */
  status: AlertStatus;

  /** When the alert was created */
  createdAt: string;

  /** Time range the alert covers */
  timeRange: {
    start: string;
    end: string;
  };

  /** Source of the alert */
  source: AlertSource;

  /** Related IDs for linking back to source data */
  relatedIds?: AlertRelatedIds;

  /** Optional area label (e.g., "Wilshire corridor") */
  areaLabel?: string;
}

/**
 * Draft for creating a new alert (used for prefilling).
 */
export interface AlertDraft {
  title: string;
  notes?: string;
  timeRange: {
    start: string;
    end: string;
  };
  source: AlertSource;
  relatedIds?: AlertRelatedIds;
  areaLabel?: string;
}

/**
 * Generate a simple UUID for alerts.
 */
export function generateAlertId(): string {
  return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create an alert from a draft.
 */
export function createAlertFromDraft(draft: AlertDraft): OutreachAlert {
  return {
    id: generateAlertId(),
    title: draft.title,
    notes: draft.notes,
    status: "open",
    createdAt: new Date().toISOString(),
    timeRange: draft.timeRange,
    source: draft.source,
    relatedIds: draft.relatedIds,
    areaLabel: draft.areaLabel,
  };
}
