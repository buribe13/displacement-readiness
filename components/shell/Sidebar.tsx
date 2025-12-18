/**
 * SIDEBAR COMPONENT
 *
 * Dashboard sidebar for the Outreach Window Planner.
 * Provides navigation, quick actions, and ethical reminders.
 *
 * DESIGN PHILOSOPHY:
 * - Clear navigation between planning views
 * - Persistent ethical reminders
 * - Quick access to actions (export, refresh)
 * - Calm, professional aesthetic
 */

"use client";

import { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CalendarDays,
  Layers,
  Compass,
  MapPin,
  Download,
  RefreshCw,
  Moon,
  Sun,
  Info,
  Home,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";

export type ViewType = "timeline" | "overlaps" | "guidance" | "map";

interface SidebarProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  overlapsCount: number;
  onExport: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  darkMode: boolean;
  onDarkModeChange: (enabled: boolean) => void;
}

const NAV_ITEMS: {
  id: ViewType;
  label: string;
  icon: React.ElementType;
  description: string;
  badge?: string;
}[] = [
  {
    id: "timeline",
    label: "Timeline",
    icon: CalendarDays,
    description: "View outreach windows by time",
  },
  {
    id: "overlaps",
    label: "Overlaps",
    icon: Layers,
    description: "See when signals coincide",
  },
  {
    id: "guidance",
    label: "Guidance",
    icon: Compass,
    description: "Planning suggestions",
  },
  {
    id: "map",
    label: "Map",
    icon: MapPin,
    description: "Geographic context",
    badge: "Optional",
  },
];

export function Sidebar({
  currentView,
  onViewChange,
  overlapsCount,
  onExport,
  onRefresh,
  isRefreshing = false,
  darkMode,
  onDarkModeChange,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      className={`
        h-full bg-sidebar border-r border-sidebar-border flex flex-col
        transition-all duration-200
        ${isCollapsed ? "w-16" : "w-64"}
      `}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <Link href="/" className="flex items-center gap-2 hover:opacity-80">
              <Home className="h-5 w-5" />
              <div>
                <h1 className="text-sm font-semibold">Outreach Planner</h1>
                <p className="text-xs text-muted-foreground">Koreatown, LA</p>
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Data Status */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-b border-sidebar-border bg-muted/30">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-xs">
              Simulated Data
            </Badge>
            <Badge variant="secondary" className="text-xs">
              24h+ Delay
            </Badge>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          const showBadge = item.id === "overlaps" && overlapsCount > 0;

          const handleClick = () => {
            onViewChange(item.id);
          };

          const buttonClassName = `
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
            transition-colors text-left cursor-pointer
            ${
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
            }
            ${isCollapsed ? "justify-center" : ""}
          `;

          // Only wrap in Tooltip when sidebar is collapsed
          if (isCollapsed) {
            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    onClick={handleClick}
                    className={buttonClassName}
                  >
                    <Icon className="h-5 w-5 shrink-0" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{item.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.description}
                  </p>
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={handleClick}
              className={buttonClassName}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="flex-1 text-sm font-medium">{item.label}</span>
              {showBadge && (
                <Badge variant="secondary" className="text-xs">
                  {overlapsCount}
                </Badge>
              )}
              {item.badge && (
                <Badge
                  variant="outline"
                  className="text-xs text-muted-foreground"
                >
                  {item.badge}
                </Badge>
              )}
            </button>
          );
        })}
      </nav>

      <Separator />

      {/* Actions */}
      <div className="p-2 space-y-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={`w-full ${
                isCollapsed ? "px-0 justify-center" : "justify-start"
              }`}
              onClick={onRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {!isCollapsed && (
                <span className="ml-3 text-sm">
                  {isRefreshing ? "Refreshing..." : "Refresh Data"}
                </span>
              )}
            </Button>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right">
              <p>Refresh Data</p>
            </TooltipContent>
          )}
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              className={`w-full ${
                isCollapsed ? "px-0 justify-center" : "justify-start"
              }`}
              onClick={onExport}
            >
              <Download className="h-4 w-4" />
              {!isCollapsed && (
                <span className="ml-3 text-sm">Export Data</span>
              )}
            </Button>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right">
              <p>Export Data</p>
            </TooltipContent>
          )}
        </Tooltip>
      </div>

      <Separator />

      {/* Dark Mode Toggle */}
      <div className="p-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={`flex items-center gap-3 ${
                isCollapsed ? "justify-center" : ""
              }`}
            >
              {!isCollapsed && (
                <span className="text-sm text-muted-foreground">Dark Mode</span>
              )}
              <div className="flex items-center gap-2">
                <Sun className="h-4 w-4 text-muted-foreground" />
                <Switch
                  checked={darkMode}
                  onCheckedChange={onDarkModeChange}
                  className="data-[state=checked]:bg-sidebar-primary"
                />
                <Moon className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right">
              <p>Toggle Dark Mode</p>
            </TooltipContent>
          )}
        </Tooltip>
      </div>

      <Separator />

      {/* Ethical Reminder */}
      {!isCollapsed && (
        <div className="p-3 bg-muted/30">
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium mb-1">Ethical Use</p>
              <p>
                This tool is for outreach coordination only. Not for
                surveillance or enforcement.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* About Link */}
      <div className="p-2 border-t border-sidebar-border">
        <Tooltip>
          <TooltipTrigger asChild>
            <Link href="/">
              <Button
                variant="ghost"
                className={`w-full ${
                  isCollapsed ? "px-0 justify-center" : "justify-start"
                }`}
              >
                <Info className="h-4 w-4" />
                {!isCollapsed && (
                  <span className="ml-3 text-sm">About & Ethics</span>
                )}
              </Button>
            </Link>
          </TooltipTrigger>
          {isCollapsed && (
            <TooltipContent side="right">
              <p>About & Ethics</p>
            </TooltipContent>
          )}
        </Tooltip>
      </div>
    </div>
  );
}
