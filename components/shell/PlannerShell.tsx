/**
 * PLANNER SHELL COMPONENT
 *
 * The main layout wrapper for the Outreach Window Planner.
 * Provides:
 * - Top navigation bar with clear tool identity
 * - Persistent ethical reminders/disclaimers
 * - Help dropdown with ethical framework
 * - Consistent page structure
 *
 * ETHICAL DESIGN NOTE:
 * The shell deliberately includes a persistent "simulated data" indicator
 * and access to ethical guidelines. Users should always be aware of
 * the tool's limitations and appropriate use.
 *
 * Unlike the previous AppShell, this version:
 * - Removes authentication/session controls (per prototype decision)
 * - Focuses on temporal planning language, not "displacement pressure"
 * - Emphasizes the redirective practice framing
 */

"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";

interface PlannerShellProps {
  children: React.ReactNode;
}

export function PlannerShell({ children }: PlannerShellProps) {
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="border-b bg-card">
        <div className="flex h-14 items-center justify-between px-4">
          {/* Left: Title and Location */}
          <div className="flex items-center gap-3">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <h1 className="text-sm font-semibold">Outreach Window Planner</h1>
            </Link>
            <Separator orientation="vertical" className="h-5" />
            <span className="text-sm text-muted-foreground">
              Koreatown, Los Angeles
            </span>
          </div>

          {/* Center: Data Status Indicator */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs font-normal">
              Simulated Data
            </Badge>
            <Badge variant="secondary" className="text-xs font-normal">
              24h+ Delay
            </Badge>
          </div>

          {/* Right: Help and Info */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  About & Ethics
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>About This Tool</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex-col items-start cursor-default">
                  <span className="font-medium">Purpose</span>
                  <span className="text-xs text-muted-foreground">
                    Temporal planning for housing/homelessness outreach
                    organizations. Helps identify low-disruption windows for
                    effective outreach.
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex-col items-start cursor-default">
                  <span className="font-medium">Redirective Practice</span>
                  <span className="text-xs text-muted-foreground">
                    This tool reframes displacement as a temporal coordination
                    problem. We ask &quot;when can care be delivered?&quot; not
                    &quot;where are people?&quot;
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex-col items-start cursor-default">
                  <span className="font-medium">Data Policy</span>
                  <span className="text-xs text-muted-foreground">
                    All data is delayed (24h+) or simulated. No real-time
                    tracking. Signals represent institutional activity, never
                    individuals.
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-destructive">
                  This Tool Does NOT
                </DropdownMenuLabel>
                <DropdownMenuItem disabled className="text-xs opacity-70">
                  • Track individuals or their locations
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="text-xs opacity-70">
                  • Show law enforcement activity
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="text-xs opacity-70">
                  • Provide enforcement guidance
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="text-xs opacity-70">
                  • Use real-time data
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex-col items-start cursor-default">
                  <span className="font-medium">Intended Users</span>
                  <span className="text-xs text-muted-foreground">
                    Outreach coordinators, case managers, volunteer organizers,
                    and program directors at housing service organizations.
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 min-h-0 overflow-hidden">{children}</main>

      {/* Footer Disclaimer */}
      <footer className="border-t bg-muted/30 px-4 py-2">
        <p className="text-xs text-muted-foreground text-center">
          Prototype for demonstration purposes. All data is simulated or
          delayed. Designed for outreach planning, not surveillance or
          enforcement.
        </p>
      </footer>
    </div>
  );
}
