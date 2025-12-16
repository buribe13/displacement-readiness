/**
 * APP SHELL COMPONENT
 * 
 * The main layout wrapper for protected pages.
 * Provides:
 * - Top navigation bar
 * - Ethical reminder/disclaimer
 * - Help dropdown
 * - Consistent page structure
 * 
 * ETHICAL DESIGN NOTE:
 * The shell deliberately includes a persistent "simulated data" indicator
 * and access to ethical guidelines. Users should always be aware of
 * the tool's limitations and appropriate use.
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { KOREATOWN_INFO } from '@/lib/geo/koreatown';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="border-b bg-card">
        <div className="flex h-14 items-center justify-between px-4">
          {/* Left: Title and Location */}
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold">
              Displacement Readiness
            </h1>
            <Separator orientation="vertical" className="h-5" />
            <span className="text-sm text-muted-foreground">
              {KOREATOWN_INFO.name}, {KOREATOWN_INFO.city}
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

          {/* Right: Help and Settings */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  Help & Ethics
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-72">
                <DropdownMenuLabel>About This Tool</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex-col items-start">
                  <span className="font-medium">Purpose</span>
                  <span className="text-xs text-muted-foreground">
                    Situational awareness for housing/homelessness service providers
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex-col items-start">
                  <span className="font-medium">Data Policy</span>
                  <span className="text-xs text-muted-foreground">
                    All data is delayed (24h+) or simulated. No real-time tracking.
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-destructive">
                  This Tool Does NOT
                </DropdownMenuLabel>
                <DropdownMenuItem disabled className="text-xs opacity-70">
                  • Track individuals
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="text-xs opacity-70">
                  • Show law enforcement locations
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="text-xs opacity-70">
                  • Predict individual outcomes
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex-col items-start">
                  <span className="font-medium">Geographic Scope</span>
                  <span className="text-xs text-muted-foreground">
                    Limited to {KOREATOWN_INFO.name} ({KOREATOWN_INFO.approximateAreaSqMiles} sq mi)
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Org Access
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Session</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs text-muted-foreground">
                  Demo session active
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    // Clear the access cookie and redirect
                    document.cookie = 'org_access=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
                    window.location.href = '/access';
                  }}
                  className="text-destructive"
                >
                  End Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 min-h-0 overflow-auto">
        {children}
      </main>

      {/* Footer Disclaimer */}
      <footer className="border-t bg-muted/30 px-4 py-2">
        <p className="text-xs text-muted-foreground text-center">
          This is a prototype for demonstration purposes. All data is simulated or delayed.
          Not intended for real-time decision making or individual tracking.
        </p>
      </footer>
    </div>
  );
}

