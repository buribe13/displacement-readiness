/**
 * PLANNER SHELL COMPONENT
 *
 * The main layout wrapper for the Outreach Window Planner.
 * Provides a dashboard layout with sidebar navigation.
 *
 * DESIGN PHILOSOPHY:
 * - Dashboard layout with collapsible sidebar
 * - Clear navigation between planning views
 * - Persistent ethical reminders
 * - Responsive design
 *
 * ETHICAL DESIGN NOTE:
 * The shell includes persistent ethical reminders and disclaimers.
 * Users should always be aware of the tool's limitations.
 */

"use client";

import { TooltipProvider } from "@/components/ui/tooltip";

interface PlannerShellProps {
  children: React.ReactNode;
}

export function PlannerShell({ children }: PlannerShellProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <div className="h-screen bg-background flex overflow-hidden">
        {children}
      </div>
    </TooltipProvider>
  );
}
