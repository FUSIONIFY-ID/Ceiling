"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

/** Registers ScrollTrigger exactly once, client-side only. */
export function setupScrollMotion(): typeof gsap {
  if (typeof window === "undefined") return gsap;
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
  }
  return gsap;
}

export function reducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isCompact(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 768px)").matches;
}

/** Scroll distance for a pinned scene, shortened on small screens. */
export function pinDistance(desktop: number, compact: number): string {
  return `+=${isCompact() ? compact : desktop}%`;
}

export { gsap, ScrollTrigger };
