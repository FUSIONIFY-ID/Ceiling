"use client";

import { useLayoutEffect, useRef } from "react";

import { pinDistance, reducedMotion, setupScrollMotion } from "@/lib/motion";

export function ProblemStory() {
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
          end: pinDistance(130, 60),
          scrub: 0.7,
          pin: "[data-problem-pin]",
          invalidateOnRefresh: true,
        },
      });

      // Authority shifts from the vendor column to the Ceiling column.
      timeline
        .to("[data-problem-side='traditional']", { opacity: 0.4, duration: 40 }, 20)
        .fromTo(
          "[data-problem-side='ceiling']",
          { opacity: 0.45, y: 26 },
          { opacity: 1, y: 0, duration: 40 },
          20,
        )
        .fromTo("[data-problem-thread]", { scaleX: 0 }, { scaleX: 1, duration: 70 }, 10)
        .fromTo(
          "[data-thread-step]",
          { opacity: 0.25 },
          { opacity: 1, duration: 18, stagger: 16 },
          14,
        );
    }, host);

    return () => ctx.revert();
  }, []);

  return (
    <section className="scene scene-problem" id="product" ref={root}>
      <div data-problem-pin>
        <div className="problem-inner">
          <header>
            <p className="eyebrow">THE PROBLEM</p>
            <h2>
              The problem isn&apos;t usage billing.
              <br />
              It&apos;s trusting the meter.
            </h2>
          </header>

          <div className="thread" aria-hidden="true">
            <span className="thread-line" data-problem-thread />
            <span data-thread-step>TRUST</span>
            <span data-thread-step>VERIFY</span>
            <span data-thread-step>RECOMPUTE</span>
          </div>

          <div className="problem-columns">
            <article data-problem-side="traditional">
              <p className="chapter">TRADITIONAL USAGE BILLING</p>
              <p>
                Vendor defines the unit.
                <br />
                Vendor runs the meter.
                <br />
                Vendor produces the invoice.
              </p>
              <strong className="verdict verdict-muted">TRUST THE NUMBER</strong>
            </article>
            <article data-problem-side="ceiling">
              <p className="chapter">CEILING</p>
              <p>
                Unit committed before output exists.
                <br />
                Validator deterministic.
                <br />
                Output published.
                <br />
                Arithmetic recomputable.
              </p>
              <strong className="verdict">RECOMPUTE THE NUMBER</strong>
            </article>
          </div>
        </div>
      </div>
    </section>
  );
}
