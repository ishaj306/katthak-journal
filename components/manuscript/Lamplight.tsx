"use client";

import { useEffect } from "react";

/**
 * After dusk the paper warms to lamplight of its own accord. Sets a data
 * attribute on <html>; globals.css does the rest. Cleans up on unmount.
 */
export function Lamplight() {
  useEffect(() => {
    const apply = () => {
      const hour = new Date().getHours();
      const dim = hour >= 18 || hour < 6;
      document.documentElement.setAttribute(
        "data-lamplight",
        dim ? "on" : "off"
      );
    };
    apply();
    const id = window.setInterval(apply, 5 * 60 * 1000);
    return () => {
      window.clearInterval(id);
      document.documentElement.removeAttribute("data-lamplight");
    };
  }, []);

  return null;
}
