/**
 * LANDING PAGE
 *
 * Calm, accessible entry point to the Outreach Window Planner.
 *
 * ETHICAL DESIGN NOTE:
 * This page establishes context before users access the planning tool.
 * It clearly communicates:
 * - Who this tool is for (outreach organizations)
 * - What it does (temporal planning, not surveillance)
 * - What it does NOT do (no tracking, no real-time data, no enforcement guidance)
 *
 * REDIRECTIVE PRACTICE:
 * We reframe displacement as a temporal coordination problem.
 * Instead of asking "where harm occurs," we help organizations
 * understand "when care can be delivered with less disruption."
 */

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card/50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold">Outreach Window Planner</h1>
            <Badge variant="outline" className="text-xs">
              Prototype
            </Badge>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Simulated Data
            </Badge>
            <Badge variant="secondary" className="text-xs">
              24h+ Delay
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-12 max-w-4xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold tracking-tight mb-4">
            Plan outreach around disruption, not surveillance
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A temporal planning tool that helps outreach organizations identify
            low-disruption windows for safe, effective community engagement.
          </p>
        </div>

        {/* Core Concept Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Time, Not Location</CardTitle>
              <CardDescription>
                This tool focuses on <em>when</em> to conduct outreach, not{" "}
                <em>where</em> people are.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              We model temporal rhythms—sanitation cycles, event schedules,
              shelter hours—to find windows where care can be delivered with
              less disruption.
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Harm Reduction Through Timing
              </CardTitle>
              <CardDescription>
                Avoid high-pressure periods. Coordinate proactively.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              By understanding when multiple disruptive signals overlap,
              organizations can plan outreach that anticipates—rather than
              reacts to—city activity.
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="text-center mb-12">
          <Link href="/planner">
            <Button size="lg" className="px-8">
              Open Planner
            </Button>
          </Link>
          <p className="text-xs text-muted-foreground mt-3">
            Koreatown, Los Angeles • Prototype with simulated data
          </p>
        </div>

        <Separator className="my-8" />

        {/* Ethical Framework */}
        <div className="space-y-6">
          <h3 className="text-lg font-medium text-center">
            What This Tool Does Not Do
          </h3>

          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  No Individual Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                We never track, identify, or locate individuals. Signals
                represent institutional activity and environmental conditions
                only.
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  No Real-Time Data
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                All data is delayed (24h+) or simulated by design. This prevents
                misuse as a surveillance or enforcement tool.
              </CardContent>
            </Card>

            <Card className="bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  No Enforcement Guidance
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-muted-foreground">
                This tool does not show law enforcement activity or provide
                guidance that could enable punitive responses.
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Target Users */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">Designed for:</p>
          <p className="text-sm">
            Outreach coordinators • Case managers • Volunteer organizers •
            Program directors
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            This is a prototype of a proposition, not a production system.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30 px-4 py-4">
        <p className="text-xs text-muted-foreground text-center max-w-2xl mx-auto">
          The Outreach Window Planner reframes displacement as a temporal
          coordination problem. Instead of asking where harm occurs, it helps
          organizations understand when care can be delivered with less
          disruption.
        </p>
      </footer>
    </div>
  );
}
