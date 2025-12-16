/**
 * CONTEXT & GUIDANCE PANEL
 * 
 * Provides contextual information and suggested responses for organizations.
 * 
 * ETHICAL DESIGN NOTE:
 * This panel is purely informational - it suggests awareness and coordination,
 * never specific enforcement-style actions. Language is carefully chosen to:
 * - Emphasize community engagement over control
 * - Acknowledge uncertainty and limitations
 * - Support harm reduction, not surveillance
 */

'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import type { PressureLevel, SignalsSummary } from '@/lib/signals/types';

interface ContextPanelProps {
  summary?: SignalsSummary;
}

/**
 * Suggested organizational responses based on pressure level.
 * These are GENERAL GUIDANCE, not prescriptive actions.
 */
const PRESSURE_GUIDANCE: Record<PressureLevel, {
  title: string;
  description: string;
  suggestions: string[];
}> = {
  low: {
    title: 'Routine Awareness',
    description: 'Signal activity is within baseline levels. Continue normal community engagement and service delivery.',
    suggestions: [
      'Maintain regular outreach schedules',
      'Review upcoming events calendar for planning',
      'Continue building trust with community members',
      'Document any changes in local conditions for future reference',
    ],
  },
  elevated: {
    title: 'Enhanced Awareness',
    description: 'Moderate signal activity detected. Some institutional activity may affect the area in coming days.',
    suggestions: [
      'Increase communication with partner organizations',
      'Consider proactive outreach to known encampment areas',
      'Prepare resources for potential increased demand',
      'Brief staff on upcoming scheduled activities in the area',
      'Ensure contact information for clients is current',
    ],
  },
  high: {
    title: 'Coordinated Readiness',
    description: 'Multiple overlapping signals detected. Elevated institutional activity likely. This is NOT a prediction of displacement events.',
    suggestions: [
      'Coordinate with coalition partners on response capacity',
      'Deploy proactive outreach teams to affected areas',
      'Prepare rapid response resources (storage, referrals, contacts)',
      'Document activities and outcomes for advocacy',
      'Maintain direct communication with affected community members',
      'Consider community notification if appropriate',
    ],
  },
};

export function ContextPanel({ summary }: ContextPanelProps) {
  const pressureLevel = summary?.pressureLevel || 'low';
  const guidance = PRESSURE_GUIDANCE[pressureLevel];

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b">
        <div className="text-sm font-medium">Context & Guidance</div>
        <div className="text-xs text-muted-foreground mt-1">
          Suggested organizational awareness
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-3 space-y-4">
        {/* Current Pressure Assessment */}
        <Card>
          <CardHeader className="p-3 pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Current Assessment</CardTitle>
              <Badge
                variant={pressureLevel === 'high' ? 'destructive' : pressureLevel === 'elevated' ? 'default' : 'secondary'}
                className="capitalize"
              >
                {pressureLevel}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <p className="text-sm text-muted-foreground">
              {summary?.pressureExplanation || guidance.description}
            </p>
          </CardContent>
        </Card>

        {/* Guidance Section */}
        <Card>
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm">{guidance.title}</CardTitle>
            <CardDescription className="text-xs">
              {guidance.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <ul className="space-y-2">
              {guidance.suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-muted-foreground flex gap-2">
                  <span className="text-foreground">•</span>
                  {suggestion}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Signal Summary */}
        {summary && (
          <Card>
            <CardHeader className="p-3 pb-2">
              <CardTitle className="text-sm">Signal Summary</CardTitle>
            </CardHeader>
            <CardContent className="p-3 pt-0 space-y-3">
              <div>
                <div className="text-xs font-medium mb-1">By Type</div>
                <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                  <span>Sanitation: {summary.byKind.sanitation}</span>
                  <span>Events: {summary.byKind.eventPermit}</span>
                  <span>Road Closures: {summary.byKind.roadClosure}</span>
                  <span>Transit: {summary.byKind.transitDisruption}</span>
                  <span className="col-span-2">Indicators: {summary.byKind.displacementIndicator}</span>
                </div>
              </div>
              <Separator />
              <div>
                <div className="text-xs font-medium mb-1">By Confidence</div>
                <div className="flex gap-3 text-xs text-muted-foreground">
                  <span>High: {summary.byConfidence.high}</span>
                  <span>Medium: {summary.byConfidence.medium}</span>
                  <span>Low: {summary.byConfidence.low}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ethical Reminder */}
        <Alert>
          <AlertTitle className="text-sm">Remember</AlertTitle>
          <AlertDescription className="text-xs">
            <ul className="space-y-1 mt-2">
              <li>• This tool provides <strong>situational awareness</strong>, not prediction</li>
              <li>• Data is always delayed (24h+) or simulated</li>
              <li>• Individual outcomes cannot be predicted from aggregate signals</li>
              <li>• Community engagement should lead any response</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* What This Tool Doesn't Do */}
        <Card className="border-dashed">
          <CardHeader className="p-3 pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              This Tool Does NOT
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Track individuals or their locations</li>
              <li>• Show real-time law enforcement activity</li>
              <li>• Predict when/where displacement will occur</li>
              <li>• Replace direct community relationships</li>
              <li>• Enable or support enforcement actions</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="p-3 border-t bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          Guidance is general awareness. Adapt to your organization's context.
        </p>
      </div>
    </div>
  );
}

