/**
 * SIGNALS SUMMARY API ROUTE
 * 
 * Returns aggregated statistics about signals for dashboard overview.
 * 
 * ETHICAL DESIGN DECISIONS:
 * 
 * 1. AGGREGATE DATA ONLY
 *    This endpoint returns counts and summaries, never individual signals.
 *    The pressure level is a coarse assessment, not a prediction.
 * 
 * 2. PRESSURE LEVEL IS CONTEXTUAL
 *    The "pressure" metric represents environmental conditions that
 *    CORRELATE with displacement, not a forecast of individual outcomes.
 * 
 * 3. EXPLANATION REQUIRED
 *    Every pressure assessment includes a human-readable explanation
 *    that acknowledges uncertainty and limitations.
 */

import { NextResponse } from 'next/server';
import type { SignalsSummary, SignalKind, ConfidenceLevel, PressureLevel } from '@/lib/signals/types';
import { mockSignals } from '@/lib/signals/mock';

/**
 * Calculate pressure level based on signal patterns.
 * 
 * IMPORTANT: This is a COARSE heuristic for demonstration.
 * A real implementation would need careful calibration with
 * community input and validation.
 * 
 * Factors considered:
 * - Number of active signals
 * - Confidence levels (high confidence signals weigh more)
 * - Signal types (sanitation + events = higher concern)
 */
function calculatePressureLevel(signals: typeof mockSignals): {
  level: PressureLevel;
  explanation: string;
} {
  // Count high-concern signal combinations
  const sanitationCount = signals.filter(s => s.kind === 'sanitation').length;
  const eventCount = signals.filter(s => s.kind === 'eventPermit').length;
  const highConfidenceCount = signals.filter(s => s.confidenceLevel === 'high').length;
  const indicatorCount = signals.filter(s => s.kind === 'displacementIndicator').length;
  
  // Simple heuristic (would need real calibration)
  const score = 
    (sanitationCount * 2) + 
    (eventCount * 2) + 
    (highConfidenceCount * 1) + 
    (indicatorCount * 1);
  
  if (score >= 8) {
    return {
      level: 'high',
      explanation: `Multiple overlapping signals detected (${sanitationCount} sanitation, ${eventCount} events). This DOES NOT predict individual displacement, but suggests increased institutional activity in the area. Consider proactive outreach coordination.`,
    };
  }
  
  if (score >= 4) {
    return {
      level: 'elevated',
      explanation: `Moderate signal activity detected. Some scheduled institutional activity may affect the area. Routine awareness recommended. This is contextual information, not an alert.`,
    };
  }
  
  return {
    level: 'low',
    explanation: `Current signal activity is within baseline levels. No unusual institutional activity patterns detected. Continue normal operations and community engagement.`,
  };
}

export async function GET() {
  // Get current signals (in a real app, would filter by time range)
  const signals = mockSignals;
  
  // Count by kind
  const byKind: Record<SignalKind, number> = {
    sanitation: 0,
    eventPermit: 0,
    roadClosure: 0,
    transitDisruption: 0,
    displacementIndicator: 0,
  };
  
  signals.forEach(s => {
    byKind[s.kind]++;
  });
  
  // Count by confidence
  const byConfidence: Record<ConfidenceLevel, number> = {
    low: 0,
    medium: 0,
    high: 0,
  };
  
  signals.forEach(s => {
    byConfidence[s.confidenceLevel]++;
  });
  
  // Calculate pressure
  const { level, explanation } = calculatePressureLevel(signals);
  
  // Determine time range of signals
  const timestamps = signals.map(s => new Date(s.timestamp).getTime());
  const timeRange = {
    start: new Date(Math.min(...timestamps)).toISOString(),
    end: new Date(Math.max(...timestamps)).toISOString(),
  };
  
  const summary: SignalsSummary = {
    byKind,
    byConfidence,
    pressureLevel: level,
    pressureExplanation: explanation,
    timeRange,
  };
  
  return NextResponse.json(summary);
}

