"use client";

import { useRef, useEffect } from "react";

export default function Comments() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || ref.current.hasChildNodes()) return;

    const scriptElem = document.createElement("script");
    scriptElem.src = "https://giscus.app/client.js";
    scriptElem.async = true;
    scriptElem.crossOrigin = "anonymous";

    scriptElem.setAttribute("data-repo", "woong-jae/blog");
    scriptElem.setAttribute("data-repo-id", "R_kgDOJyPvuA");
    scriptElem.setAttribute("data-category", "Announcements");
    scriptElem.setAttribute("data-category-id", "DIC_kwDOJyPvuM4CXrI6");
    scriptElem.setAttribute("data-mapping", "pathname");
    scriptElem.setAttribute("data-strict", "0");
    scriptElem.setAttribute("data-reactions-enabled", "1");
    scriptElem.setAttribute("data-emit-metadata", "0");
    scriptElem.setAttribute("data-input-position", "bottom");
    scriptElem.setAttribute("data-theme", "noborder_light");
    scriptElem.setAttribute("data-lang", "ko");

    ref.current.appendChild(scriptElem);
  }, []);

  return <section ref={ref} />;
}
