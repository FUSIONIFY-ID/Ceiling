"use client";

import { useLayoutEffect, useRef } from "react";

import { UNITS } from "@/lib/session";
import { reducedMotion, setupScrollMotion } from "@/lib/motion";

const VALUES = [
  ["MAX UNITS", String(UNITS.max)],
  ["UNIT", "JSON RECORD"],
  ["UNIT PRICE", UNITS.unitPrice],
  ["MAX AUTHORIZATION", UNITS.ceilingShort],
] as const;

export function UpperBoundSection() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const host = root.current;
    if (!host || reducedMotion()) return;
    const gsap = setupScrollMotion();

    const ctx = gsap.context(() => {
      // The rule line reads as the hero's ceiling plane arriving in the document.
      gsap.fromTo(
        "[data-bound-rule]",
        { scaleX: 0.12, opacity: 0 },
        {
          scaleX: 1,
          opacity: 1,
          ease: "power3.out",
          scrollTrigger: { trigger: host, start: "top 88%", end: "top 40%", scrub: 0.8 },
        },
      );

      gsap.fromTo(
        "[data-bound-value]",
        { y: 34, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          stagger: 0.14,
          ease: "power3.out",
          scrollTrigger: { trigger: host, start: "top 72%", end: "bottom 78%", scrub: 0.9 },
        },
      );

      // Type drifts slower than the rails — restrained parallax.
      gsap.fromTo(
        "[data-bound-title]",
        { y: 28 },
        {
          y: -18,
          ease: "none",
          scrollTrigger: { trigger: host, start: "top bottom", end: "bottom top", scrub: 1 },
        },
      );
    }, host);

    return () => ctx.revert();
  }, []);

  return (
    <section className="scene scene-bound overlap-up" ref={root}>
      <span className="bound-rule" data-bound-rule aria-hidden="true" />
      <div className="bound-grid">
        <h2 data-bound-title>
          The upper bound
          <br />
          exists before
          <br />
          the output.
        </h2>
        <dl className="bound-values">
          {VALUES.map(([label, value]) => (
            <div data-bound-value key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
