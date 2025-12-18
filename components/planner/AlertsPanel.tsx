"use client";

/**
 * ALERTS PANEL
 *
 * Side panel for managing outreach alerts.
 * Supports creating from draft, marking done, and deleting.
 */

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  X,
  Check,
  RotateCcw,
  Trash2,
  Copy,
  Bell,
  Plus,
  Clock,
  MapPin,
} from "lucide-react";
import { useAlerts } from "@/lib/alerts/useAlerts";
import type { AlertDraft, OutreachAlert } from "@/lib/alerts/types";

interface AlertsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  draft?: AlertDraft | null;
  onDraftConsumed: () => void;
}

export function AlertsPanel({
  isOpen,
  onClose,
  draft,
  onDraftConsumed,
}: AlertsPanelProps) {
  const { alerts, openCount, createAlert, toggleStatus, deleteAlert } =
    useAlerts();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Track last processed draft ID to avoid re-processing
  const processedDraftIdRef = useRef<string | null>(null);

  // Handle draft prefill when draft changes
  // This effect runs when a new draft is provided
  useEffect(() => {
    if (!draft || !isOpen) return;

    // Create a unique ID for this draft to track if we've processed it
    const draftId = `${draft.title}-${draft.timeRange.start}`;
    if (processedDraftIdRef.current === draftId) return;

    processedDraftIdRef.current = draftId;
    setFormTitle(draft.title);
    setFormNotes(draft.notes || "");
    setFormStart(draft.timeRange.start.slice(0, 16)); // datetime-local format
    setFormEnd(draft.timeRange.end.slice(0, 16));
    setShowCreateForm(true);
    onDraftConsumed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, isOpen]);

  const resetForm = () => {
    setFormTitle("");
    setFormNotes("");
    setFormStart("");
    setFormEnd("");
    setShowCreateForm(false);
  };

  const handleCreate = () => {
    if (!formTitle.trim() || !formStart || !formEnd) return;

    createAlert({
      title: formTitle.trim(),
      notes: formNotes.trim() || undefined,
      timeRange: {
        start: new Date(formStart).toISOString(),
        end: new Date(formEnd).toISOString(),
      },
      source: draft?.source || "manual",
      relatedIds: draft?.relatedIds,
      areaLabel: draft?.areaLabel,
    });

    resetForm();
  };

  const copyAlert = (alert: OutreachAlert) => {
    const text = `
Outreach Alert: ${alert.title}
Status: ${alert.status}
Time: ${formatTimeRange(alert.timeRange)}
${alert.areaLabel ? `Area: ${alert.areaLabel}` : ""}
${alert.notes ? `\nNotes:\n${alert.notes}` : ""}

---
Created: ${new Date(alert.createdAt).toLocaleDateString()}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedId(alert.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="w-80 h-full border-l bg-background flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <h2 className="font-medium text-sm">Alerts</h2>
          {openCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {openCount} open
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Create Form or Button */}
        {showCreateForm ? (
          <Card>
            <CardContent className="p-4 space-y-3">
              <p className="text-xs font-medium text-muted-foreground">
                New Alert
              </p>
              <input
                type="text"
                placeholder="Title"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm border rounded-md bg-background"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Start</label>
                  <input
                    type="datetime-local"
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                    className="w-full px-2 py-1 text-xs border rounded-md bg-background"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">End</label>
                  <input
                    type="datetime-local"
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                    className="w-full px-2 py-1 text-xs border rounded-md bg-background"
                  />
                </div>
              </div>
              <textarea
                placeholder="Notes (optional)"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 text-sm border rounded-md bg-background resize-none"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreate} className="flex-1">
                  Create
                </Button>
                <Button size="sm" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => setShowCreateForm(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Alert
          </Button>
        )}

        {/* Alerts List */}
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">No alerts yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create alerts from Timeline, Overlaps, or Map
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onToggle={() => toggleStatus(alert.id)}
                onDelete={() => deleteAlert(alert.id)}
                onCopy={() => copyAlert(alert)}
                isCopied={copiedId === alert.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Individual alert card.
 */
function AlertCard({
  alert,
  onToggle,
  onDelete,
  onCopy,
  isCopied,
}: {
  alert: OutreachAlert;
  onToggle: () => void;
  onDelete: () => void;
  onCopy: () => void;
  isCopied: boolean;
}) {
  const isDone = alert.status === "done";

  return (
    <Card className={isDone ? "opacity-60" : ""}>
      <CardContent className="p-3">
        <div className="flex items-start gap-2">
          {/* Toggle button */}
          <button
            onClick={onToggle}
            className={`
              mt-0.5 h-5 w-5 rounded border flex items-center justify-center shrink-0
              ${
                isDone
                  ? "bg-primary border-primary"
                  : "border-muted-foreground/30 hover:border-primary"
              }
            `}
          >
            {isDone && <Check className="h-3 w-3 text-primary-foreground" />}
          </button>

          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-medium ${
                isDone ? "line-through text-muted-foreground" : ""
              }`}
            >
              {alert.title}
            </p>

            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Badge
                variant={alert.source === "manual" ? "outline" : "secondary"}
                className="text-xs"
              >
                {alert.source}
              </Badge>
              {alert.areaLabel && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {alert.areaLabel}
                </span>
              )}
            </div>

            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatTimeRange(alert.timeRange)}
            </p>

            {alert.notes && (
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                {alert.notes}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={onCopy}
                >
                  <Copy
                    className={`h-3 w-3 ${isCopied ? "text-green-500" : ""}`}
                  />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isCopied ? "Copied!" : "Copy"}</TooltipContent>
            </Tooltip>

            {isDone && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={onToggle}
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Reopen</TooltipContent>
              </Tooltip>
            )}

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={onDelete}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Format time range for display.
 */
function formatTimeRange(timeRange: { start: string; end: string }): string {
  const start = new Date(timeRange.start);
  const end = new Date(timeRange.end);

  const dateOpts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
  };
  const timeOpts: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
  };

  if (start.toDateString() === end.toDateString()) {
    return `${start.toLocaleDateString(
      "en-US",
      dateOpts
    )}, ${start.toLocaleTimeString(
      "en-US",
      timeOpts
    )} - ${end.toLocaleTimeString("en-US", timeOpts)}`;
  }

  return `${start.toLocaleDateString(
    "en-US",
    dateOpts
  )} - ${end.toLocaleDateString("en-US", dateOpts)}`;
}
