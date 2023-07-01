"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { pageview } from "@/lib/gtag";

export default function GoogleAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    if (process.env.NODE_ENV === "development") return;
    pageview(new URL(pathname, globalThis.location.origin));
  }, [pathname]);

  return null;
}
