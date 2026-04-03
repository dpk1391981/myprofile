"use client";

import { useEffect, useState } from "react";
import Loader from "./Loader";

export default function SmartLoader({ children }: { children: React.ReactNode }) {
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(true); // show only if slow (>300ms)
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {showLoader && <Loader />}
      {children}
    </>
  );
}