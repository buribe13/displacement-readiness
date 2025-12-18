/**
 * PLANNER LAYOUT
 *
 * Layout wrapper for the Outreach Window Planner pages.
 *
 * ETHICAL DESIGN NOTE:
 * The shell includes persistent ethical reminders and disclaimers.
 * Users should always be aware of the tool's limitations and appropriate use.
 *
 * Unlike the previous dashboard, this layout does NOT require authentication.
 * Access control is handled through UI disclaimers and org-only framing,
 * not technical gates (per prototype design decision).
 */

import { PlannerShell } from "@/components/shell/PlannerShell";

export default function PlannerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PlannerShell>{children}</PlannerShell>;
}

