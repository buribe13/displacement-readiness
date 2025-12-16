/**
 * ROOT PAGE
 * 
 * Redirects to the dashboard. The middleware will handle
 * access control and redirect unauthorized users to /access.
 */

import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/dashboard');
}
