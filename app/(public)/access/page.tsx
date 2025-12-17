/**
 * ACCESS REQUIRED PAGE
 *
 * This page is shown when users attempt to access the dashboard
 * without proper organization credentials. It explains:
 * - What the tool is for
 * - Why access is restricted
 * - How to get access (for legitimate organizations)
 *
 * ETHICAL DESIGN NOTE:
 * This page is intentionally transparent about the tool's purpose
 * and limitations. We don't hide what it does - we explain why
 * it's restricted and how that protects vulnerable populations.
 */

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DemoAccessButton } from "./DemoAccessButton";

export default function AccessPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">
            Displacement Readiness Dashboard
          </h1>
          <p className="text-muted-foreground">
            A situational awareness tool for housing and homelessness service
            providers
          </p>
          <Badge variant="outline" className="mt-2">
            Organization Access Only
          </Badge>
        </div>

        <Separator />

        {/* Purpose Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What is this tool?</CardTitle>
            <CardDescription>
              Understanding the purpose and appropriate use
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              This dashboard aggregates public and delayed civic data to help
              housing and homelessness service organizations anticipate
              displacement pressure in Koreatown, Los Angeles.
            </p>
            <p>
              It is designed for{" "}
              <strong>harm reduction and preparedness</strong>, helping
              organizations coordinate outreach and resources before
              displacement events occur.
            </p>
          </CardContent>
        </Card>

        {/* Ethical Boundaries */}
        <Alert>
          <AlertTitle>This tool is NOT for:</AlertTitle>
          <AlertDescription>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Tracking individuals or their locations</li>
              <li>Real-time law enforcement monitoring</li>
              <li>Immigration enforcement coordination</li>
              <li>Public access or general curiosity</li>
              <li>Journalistic investigation without partnership</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Access Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Why is access restricted?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <p>
              Restricting access protects vulnerable populations. Even
              well-intentioned tools can cause harm if misused. By limiting
              access to verified service organizations, we ensure the tool
              serves its intended purpose.
            </p>
            <p className="text-muted-foreground">
              If you represent a housing or homelessness service organization
              operating in Los Angeles and would like access, please contact the
              project administrators.
            </p>
          </CardContent>
        </Card>

        {/* Demo Access */}
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              Demo Access
              <Badge variant="secondary">Prototype</Badge>
            </CardTitle>
            <CardDescription>
              Enable temporary access to view the dashboard prototype
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DemoAccessButton />
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Sets a session cookie to access the dashboard for demonstration
              purposes.
            </p>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center text-xs text-muted-foreground pt-4">
          <p>Koreatown, Los Angeles · Prototype · Not for production use</p>
          <p className="mt-1">
            Built with harm reduction principles · Data is simulated/delayed
          </p>
        </div>
      </div>
    </main>
  );
}
