"use client";

/**
 * Turns on the `?view_show=true` preview by stamping the document root.
 *
 * Mounted once in the root layout. Costs one attribute write per navigation and
 * ships no markup, so leaving it in production is cheaper than remembering to
 * add it to each page that shows a count.
 *
 * Reads window.location rather than useSearchParams(): that hook forces every
 * statically-rendered route that mounts it into a Suspense boundary, and the
 * whole point of doing this client-side was to leave static rendering alone.
 */

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { isViewPreview } from "@/components/utils/engagement-config";

export default function ViewPreviewFlag() {
  // usePathname re-runs this after a client-side navigation, when the search
  // string may have changed but the component never unmounted.
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    if (isViewPreview(window.location.search)) root.dataset.viewPreview = "1";
    else delete root.dataset.viewPreview;
  }, [pathname]);

  return null;
}
