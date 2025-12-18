/**
 * SIDEBAR COMPONENT
 *
 * Minimal, Cursor-style sidebar for the Outreach Window Planner.
 * Clean navigation with less visual noise.
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CalendarDays,
  Layers,
  Compass,
  MapPin,
  Home,
  ChevronDown,
  Settings2,
} from "lucide-react";

export type ViewType = "timeline" | "overlaps" | "guidance" | "map";

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  overlapsCount: number;
}

// Primary navigation items (always visible)
const PRIMARY_NAV: {
  id: ViewType;
  label: string;
  icon: React.ElementType;
}[] = [
  {
    id: "timeline",
    label: "Timeline",
    icon: CalendarDays,
  },
  {
    id: "overlaps",
    label: "Overlaps",
    icon: Layers,
  },
  {
    id: "map",
    label: "Map",
    icon: MapPin,
  },
];

// Advanced items (collapsed by default)
const ADVANCED_NAV: {
  id: ViewType;
  label: string;
  icon: React.ElementType;
}[] = [
  {
    id: "guidance",
    label: "Guidance",
    icon: Compass,
  },
];

export function Sidebar({
  currentView,
  onViewChange,
  overlapsCount,
}: SidebarProps) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  // Auto-expand advanced if user is viewing guidance
  const isAdvancedActive = ADVANCED_NAV.some((item) => item.id === currentView);

  return (
    <div className="w-56 h-full bg-background border-r flex flex-col relative z-20">
      {/* Header */}
      <div className="p-4 pb-6">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80">
          <Home className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Outreach Planner</span>
        </Link>
      </div>

      {/* Primary Navigation */}
      <nav className="flex-1 px-3">
        <div className="space-y-1">
          {PRIMARY_NAV.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            const showBadge = item.id === "overlaps" && overlapsCount > 0;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  console.log("Sidebar button clicked:", item.id);
                  onViewChange(item.id);
                }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm
                  transition-colors text-left
                  ${
                    isActive
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                {showBadge && (
                  <Badge variant="secondary" className="text-xs h-5 px-1.5">
                    {overlapsCount}
                  </Badge>
                )}
              </button>
            );
          })}
        </div>

        {/* Advanced Section */}
        <Collapsible
          open={advancedOpen || isAdvancedActive}
          onOpenChange={setAdvancedOpen}
          className="mt-4"
        >
          <CollapsibleTrigger asChild>
            <button
              type="button"
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Settings2 className="h-3 w-3" />
              <span>Advanced</span>
              <ChevronDown
                className={`h-3 w-3 ml-auto transition-transform ${
                  advancedOpen || isAdvancedActive ? "rotate-180" : ""
                }`}
              />
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1 mt-1">
            {ADVANCED_NAV.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onViewChange(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm
                    transition-colors text-left
                    ${
                      isActive
                        ? "bg-accent text-accent-foreground font-medium"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </CollapsibleContent>
        </Collapsible>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs text-muted-foreground"
              >
                About this tool
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p className="text-xs">For outreach coordination only</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
