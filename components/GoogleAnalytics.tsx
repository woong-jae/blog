"use client";

import { Suspense } from "react";
import { pageview } from "@/lib/gtag";
import NavigationEvent from "./NavigationEvent";

export default function GoogleAnalytics() {
  function handleNavigation(url: URL) {
    if (process.env.NODE_ENV === "development") return;
    pageview(url);
  }

  return (
    <Suspense fallback={null}>
      <NavigationEvent onNavigation={handleNavigation} />
    </Suspense>
  );
}
