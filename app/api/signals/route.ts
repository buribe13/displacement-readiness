/**
 * SIGNALS API ROUTE
 * 
 * Returns normalized civic signals for the dashboard.
 * 
 * ETHICAL DESIGN DECISIONS:
 * 
 * 1. ALL DATA IS DELAYED OR SIMULATED
 *    This endpoint will never return real-time data.
 *    The minimumLatencyHours in the response confirms this.
 * 
 * 2. MANDATORY DISCLAIMER
 *    Every response includes a disclaimer that must be
 *    displayed in the UI.
 * 
 * 3. NO INDIVIDUAL DATA
 *    Signals represent institutional activity and environmental
 *    conditions, never individual people or their locations.
 * 
 * 4. GEOGRAPHIC BOUNDS
 *    Only signals within Koreatown are returned.
 */

import { NextResponse } from 'next/server';
import type { SignalsResponse, SignalKind, ConfidenceLevel } from '@/lib/signals/types';
import { mockSignals, DATA_DISCLAIMER } from '@/lib/signals/mock';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  // Optional filters
  const kindFilter = searchParams.get('kind') as SignalKind | null;
  const confidenceFilter = searchParams.get('confidence') as ConfidenceLevel | null;
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? parseInt(limitParam, 10) : undefined;
  
  // Filter signals
  let signals = [...mockSignals];
  
  if (kindFilter) {
    signals = signals.filter(s => s.kind === kindFilter);
  }
  
  if (confidenceFilter) {
    signals = signals.filter(s => s.confidenceLevel === confidenceFilter);
  }
  
  // Sort by timestamp (most recent first)
  signals.sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  // Apply limit if specified
  if (limit && limit > 0) {
    signals = signals.slice(0, limit);
  }
  
  // Calculate minimum latency across all signals
  const minimumLatencyHours = signals.length > 0
    ? Math.min(...signals.map(s => s.dataLatencyHours))
    : 24; // Default to 24 if no signals
  
  // Check if any signals are simulated
  const containsSimulatedData = signals.some(s => s.isSimulated);
  
  const response: SignalsResponse = {
    signals,
    meta: {
      generatedAt: new Date().toISOString(),
      count: signals.length,
      minimumLatencyHours,
      containsSimulatedData,
      disclaimer: DATA_DISCLAIMER,
    },
  };
  
  return NextResponse.json(response);
}

/**
 * HEAD request for checking API availability without fetching data.
 */
export async function HEAD() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'X-Data-Simulated': 'true',
      'X-Minimum-Latency-Hours': '24',
    },
  });
}

