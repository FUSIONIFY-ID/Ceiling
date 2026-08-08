"use client";

import { useLayoutEffect, useRef } from "react";

import { reducedMotion, setupScrollMotion } from "@/lib/motion";

/** Deterministic lane widths — no runtime randomness, no hydration drift. */
const LANES = [86, 67, 92, 74, 81, 62, 89, 70, 95, 78, 65, 84, 71, 90, 68, 83];

export function ConcurrencySection() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const host = root.current;
    if (!host || reducedMotion()) return;
    const gsap = setupScrollMotion();

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-lane]").forEach((lane, index) => {
        const odd = index % 2 === 1;
        const depth = 1 - index / (LANES.length * 1.6);
        gsap.fromTo(
          lane,
          { xPercent: odd ? 4 : -4, opacity: 0.45 },
          {
            xPercent: odd ? -3 * depth : 3 * depth,
            opacity: 1,
            ease: "none",
            scrollTrigger: { trigger: host, start: "top bottom", end: "bottom top", scrub: 1.1 },
          },
        );
        gsap.fromTo(
          lane.querySelector("[data-lane-fill]"),
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: host,
              start: "top 74%",
              end: `bottom-=${index * 6}% 62%`,
              scrub: 0.9,
            },
          },
        );
      });
    }, host);

    return () => ctx.revert();
  }, []);

  return (
    <section className="scene scene-concurrency" ref={root}>
      <div className="concurrency-head">
        <p className="eyebrow eyebrow-light">WHY MONAD</p>
        <h2>
          Many sessions.
          <br />
          Independent state.
          <br />
          Parallel settlement.
        </h2>
        <p>
          A single Ceiling session could run on many chains. Monad becomes
          especially useful when many independent machine-payment sessions are
          committed and settled concurrently.
        </p>
      </div>

      <div className="lanes">
        <p className="lanes-label">SIMULATED CONCURRENCY VISUALIZATION — NOT LIVE TRANSACTIONS</p>
        {LANES.map((width, index) => (
          <div className="lane" data-lane key={index}>
            <code>sess_{String(index + 1).padStart(2, "0")}</code>
            <span className="lane-track">
              <i data-lane-fill style={{ width: `${width}%` }} />
            </span>
            <b>SETTLED</b>
          </div>
        ))}
      </div>
    </section>
  );
}
