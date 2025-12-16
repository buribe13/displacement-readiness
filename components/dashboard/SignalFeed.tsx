/**
 * SIGNAL FEED COMPONENT
 * 
 * Vertical list of recent civic signals with filtering and details.
 * 
 * ETHICAL DESIGN NOTE:
 * Each signal card prominently displays:
 * - Data source and timestamp
 * - Confidence level (so orgs know reliability)
 * - Whether data is simulated
 * - Interpretation context (not just raw data)
 * 
 * This ensures users understand the nature and limitations
 * of the information they're viewing.
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

import type { CivicSignal, SignalKind, ConfidenceLevel } from '@/lib/signals/types';

/**
 * Confidence level badge styles.
 * Using opacity rather than color to maintain neutral aesthetic.
 */
const CONFIDENCE_STYLES: Record<ConfidenceLevel, { variant: 'default' | 'secondary' | 'outline'; label: string }> = {
  low: { variant: 'outline', label: 'Low Confidence' },
  medium: { variant: 'secondary', label: 'Medium Confidence' },
  high: { variant: 'default', label: 'High Confidence' },
};

/**
 * Signal kind labels and icons (using simple text indicators).
 */
const KIND_LABELS: Record<SignalKind, { label: string; short: string }> = {
  sanitation: { label: 'Sanitation Schedule', short: 'SAN' },
  eventPermit: { label: 'Event Permit', short: 'EVT' },
  roadClosure: { label: 'Road Closure', short: 'RD' },
  transitDisruption: { label: 'Transit Disruption', short: 'TR' },
  displacementIndicator: { label: 'Displacement Indicator', short: 'IND' },
};

interface SignalFeedProps {
  signals: CivicSignal[];
  selectedSignalId?: string;
  onSignalSelect?: (signal: CivicSignal) => void;
}

export function SignalFeed({ signals, selectedSignalId, onSignalSelect }: SignalFeedProps) {
  const [kindFilter, setKindFilter] = useState<SignalKind | 'all'>('all');
  const [confidenceFilter, setConfidenceFilter] = useState<ConfidenceLevel | 'all'>('all');

  // Filter signals
  const filteredSignals = signals.filter(signal => {
    if (kindFilter !== 'all' && signal.kind !== kindFilter) return false;
    if (confidenceFilter !== 'all' && signal.confidenceLevel !== confidenceFilter) return false;
    return true;
  });

  // Sort by timestamp (most recent first)
  const sortedSignals = [...filteredSignals].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  /**
   * Format timestamp for display.
   */
  const formatTimestamp = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diffHours = Math.round((date.getTime() - now.getTime()) / (1000 * 60 * 60));
    
    if (diffHours > 0) {
      if (diffHours < 24) return `In ${diffHours}h`;
      const days = Math.round(diffHours / 24);
      return `In ${days}d`;
    } else {
      const pastHours = Math.abs(diffHours);
      if (pastHours < 24) return `${pastHours}h ago`;
      const days = Math.round(pastHours / 24);
      return `${days}d ago`;
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header with filters */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="text-sm font-medium">
          Recent Signals
          <span className="text-muted-foreground ml-2">({sortedSignals.length})</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Kind filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                {kindFilter === 'all' ? 'All Types' : KIND_LABELS[kindFilter].short}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Signal Type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={kindFilter} onValueChange={(v) => setKindFilter(v as SignalKind | 'all')}>
                <DropdownMenuRadioItem value="all">All Types</DropdownMenuRadioItem>
                {(Object.keys(KIND_LABELS) as SignalKind[]).map((kind) => (
                  <DropdownMenuRadioItem key={kind} value={kind}>
                    {KIND_LABELS[kind].label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Confidence filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                {confidenceFilter === 'all' ? 'All Confidence' : confidenceFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Confidence Level</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={confidenceFilter} onValueChange={(v) => setConfidenceFilter(v as ConfidenceLevel | 'all')}>
                <DropdownMenuRadioItem value="all">All Levels</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="high">High</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="medium">Medium</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="low">Low</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Signal List */}
      <div className="flex-1 overflow-auto p-3 space-y-3">
        {sortedSignals.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground py-8">
            No signals match the current filters.
          </div>
        ) : (
          sortedSignals.map((signal) => (
            <SignalCard
              key={signal.id}
              signal={signal}
              isSelected={signal.id === selectedSignalId}
              onClick={() => onSignalSelect?.(signal)}
              formatTimestamp={formatTimestamp}
            />
          ))
        )}
      </div>

      {/* Footer disclaimer */}
      <div className="p-3 border-t bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          All signals are simulated or delayed (24h+). For awareness, not prediction.
        </p>
      </div>
    </div>
  );
}

/**
 * Individual signal card component.
 */
interface SignalCardProps {
  signal: CivicSignal;
  isSelected: boolean;
  onClick: () => void;
  formatTimestamp: (iso: string) => string;
}

function SignalCard({ signal, isSelected, onClick, formatTimestamp }: SignalCardProps) {
  return (
    <Card
      className={`cursor-pointer transition-colors hover:bg-accent/50 ${
        isSelected ? 'ring-2 ring-ring' : ''
      }`}
      onClick={onClick}
    >
      <CardHeader className="p-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs font-normal">
                {KIND_LABELS[signal.kind].short}
              </Badge>
              <Badge
                variant={CONFIDENCE_STYLES[signal.confidenceLevel].variant}
                className="text-xs font-normal"
              >
                {signal.confidenceLevel}
              </Badge>
              {signal.isSimulated && (
                <Badge variant="secondary" className="text-xs font-normal">
                  Simulated
                </Badge>
              )}
            </div>
            <CardTitle className="text-sm font-medium leading-tight">
              {signal.description}
            </CardTitle>
          </div>
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            {formatTimestamp(signal.timestamp)}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <CardDescription className="text-xs leading-relaxed">
          {signal.interpretation}
        </CardDescription>
        <Separator className="my-2" />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Source: {signal.source}</span>
          <span>{signal.dataLatencyHours}h+ delay</span>
        </div>
      </CardContent>
    </Card>
  );
}

