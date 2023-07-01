"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function NavigationEvent({ onNavigation }: { onNavigation: (url: URL) => void }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const url = `${pathname}?${searchParams}`;
    onNavigation(new URL(url, window.location.origin));
  }, [pathname, searchParams]);

  return null;
}
