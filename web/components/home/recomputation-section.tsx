"use client";

import { useLayoutEffect, useRef } from "react";

import { RECOMPUTE_ROWS, UNITS } from "@/lib/session";
import { pinDistance, reducedMotion, setupScrollMotion } from "@/lib/motion";

export function RecomputationSection() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const host = root.current;
    if (!host || reducedMotion()) return;
    const gsap = setupScrollMotion();

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: host,
          start: "top top",
          end: pinDistance(140, 70),
          scrub: 0.7,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      timeline
        .fromTo("[data-eq='0']", { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 10 }, 0)
        .fromTo("[data-eq='1']", { opacity: 0, x: -12 }, { opacity: 1, x: 0, duration: 8 }, 8)
        .fromTo("[data-eq='2']", { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 10 }, 14)
        .fromTo("[data-eq='3']", { opacity: 0 }, { opacity: 1, duration: 8 }, 22)
        .fromTo(
          "[data-eq='4']",
          { opacity: 0, y: 26, color: "#ffffff" },
          { opacity: 1, y: 0, color: "#5ba7f4", duration: 12 },
          28,
        )
        .fromTo(
          "[data-proof-row]",
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 26, stagger: 5 },
          44,
        )
        .fromTo("[data-pass]", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 12 }, 76);
    }, host);

    return () => ctx.revert();
  }, []);

  return (
    <section className="scene scene-recompute" ref={root}>
      <div className="recompute-inner">
        <header>
          <p className="eyebrow eyebrow-light">RECOMPUTATION</p>
          <h2>The bill is just math.</h2>
        </header>

        <p
          className="big-equation"
          aria-label={`${UNITS.accepted} times ${UNITS.unitPrice} equals ${UNITS.actualShort}`}
        >
          <b data-eq="0">{UNITS.accepted}</b>
          <i data-eq="1">×</i>
          <b data-eq="2">{UNITS.unitPrice}</b>
          <i data-eq="3">=</i>
          <b data-eq="4" className="accent">
            {UNITS.actualShort}
          </b>
        </p>

        <dl className="proof-rows">
          {RECOMPUTE_ROWS.map(([label, state]) => (
            <div data-proof-row key={label}>
              <dt>{label}</dt>
              <dd>{state}</dd>
            </div>
          ))}
        </dl>

        <p className="recompute-pass" data-pass>
          <span>RECOMPUTATION</span>
          <strong>PASS</strong>
        </p>
      </div>
    </section>
  );
}
