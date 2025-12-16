/**
 * PROTECTED LAYOUT
 * 
 * This layout wraps all protected routes (dashboard, etc.).
 * The middleware handles actual access control - this layout
 * provides the shared UI shell for authenticated views.
 * 
 * ETHICAL DESIGN NOTE:
 * The shell includes persistent ethical reminders and disclaimers.
 * Users should never forget they're working with sensitive tools.
 */

import { AppShell } from '@/components/shell/AppShell';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}

