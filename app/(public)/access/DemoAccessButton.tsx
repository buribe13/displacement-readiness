'use client';

import { Button } from '@/components/ui/button';

export function DemoAccessButton() {
  // Using a form POST to the API endpoint for better reliability
  return (
    <form action="/api/auth/demo" method="POST">
      <Button type="submit" variant="outline" className="w-full">
        Enable Demo Access (24 hours)
      </Button>
    </form>
  );
}

