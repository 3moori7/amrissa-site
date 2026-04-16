'use client';

import { useEffect, useState } from "react";

const MOBILE_BREAKPOINT = 768;

export const useIsMobileViewport = () => {
  const [isMobileViewport, setIsMobileViewport] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);

    const updateViewportState = () => setIsMobileViewport(mediaQuery.matches);
    updateViewportState();

    mediaQuery.addEventListener("change", updateViewportState);
    return () => mediaQuery.removeEventListener("change", updateViewportState);
  }, []);

  return isMobileViewport;
};

