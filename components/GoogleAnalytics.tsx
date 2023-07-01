"use client";

import { pageview } from "@/lib/gtag";
import NavigationEvent from "./NavigationEvent";
import { Suspense } from "react";

export default function GoogleAnalytics() {
  function handleNavigation(url: URL) {
    if (process.env.NODE_ENV === "development") return;
    pageview(url);
  }

  return (
    <Suspense>
      <NavigationEvent onNavigation={handleNavigation} />
    </Suspense>
  );
}
