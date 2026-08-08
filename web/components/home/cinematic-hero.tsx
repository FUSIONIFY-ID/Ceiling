"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLayoutEffect, useRef } from "react";

import { BillingRail } from "@/components/home/billing-rail";
import { LaunchLink } from "@/components/launch-transition";
import { MONADSCAN, PROOF } from "@/lib/proof";
import { UNITS } from "@/lib/session";
import { isCompact, pinDistance, reducedMotion, setupScrollMotion } from "@/lib/motion";

export function CinematicHero() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const host = root.current;
    if (!host) return;
    const gsap = setupScrollMotion();

    const pick = <T extends Element = HTMLElement>(selector: string) =>
      Array.from(host.querySelectorAll<T>(selector));
    const one = (selector: string) => host.querySelector<HTMLElement>(selector);

    const ctx = gsap.context(() => {
      const units = pick("[data-rail-unit]");
      const accepted = units.slice(0, UNITS.accepted);
      const rejected = units[UNITS.rejectedAt - 1];
      const uncharged = units.slice(UNITS.rejectedAt);

      // Reduced motion — paint the resolved state, skip every scrubbed transform.
      if (reducedMotion()) {
        gsap.set(accepted, { "--lit": 1 });
        if (rejected) gsap.set(rejected, { "--rej": 1 });
        gsap.set(uncharged, { "--dim": 1 });
        gsap.set([one("[data-rail-readout]"), one("[data-rail-cut]")], { opacity: 1, y: 0 });
        gsap.set(one("[data-rail-stage]"), { rotateX: 26 });
        return;
      }

      // The plane rises out of the stage, so its travel must shrink on
      // narrow screens or it overlaps the copy stacked above it.
      const compact = isCompact();
      const ceilingFrom = compact ? 96 : 190;
      const ceilingTo = compact ? 58 : 112;

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: host,
          start: "top top",
          end: pinDistance(200, 90),
          scrub: 0.6,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      timeline
        // 0–20 — camera eases toward the rail.
        .fromTo(
          "[data-rail-stage]",
          { scale: 0.9, y: 36, rotateX: 58 },
          { scale: 1.05, y: 0, rotateX: 52, duration: 20 },
          0,
        )
        // 20–40 — the authorization plane descends toward the track (translateZ
        // is vertical here because the stage is rotated on X).
        .fromTo(
          "[data-rail-ceiling]",
          { z: ceilingFrom, opacity: 0.45 },
          { z: ceilingTo, opacity: 1, duration: 20 },
          20,
        )
        // 40–65 — units 01–17 illuminate sequentially.
        .fromTo(
          accepted,
          { "--lit": 0 },
          { "--lit": 1, duration: 8, stagger: { each: 17 / accepted.length } },
          40,
        )
        // 65–72 — unit 18 fails; the cut marker drops in.
        .fromTo(rejected ?? {}, { "--rej": 0 }, { "--rej": 1, duration: 4 }, 65)
        .fromTo(
          "[data-rail-cut]",
          { opacity: 0, scaleY: 0.35 },
          { opacity: 1, scaleY: 1, duration: 7 },
          65,
        )
        // 72–85 — everything after the cut goes inactive.
        .fromTo(
          uncharged,
          { "--dim": 0 },
          { "--dim": 1, duration: 8, stagger: { each: 5 / Math.max(uncharged.length, 1) } },
          72,
        )
        // 85–100 — flatten into a diagram, reveal the readout.
        .to("[data-rail-stage]", { rotateX: 16, scale: 0.97, y: -14, duration: 15 }, 85)
        .fromTo(
          "[data-rail-readout]",
          { opacity: 0, y: 26 },
          { opacity: 1, y: 0, duration: 12 },
          88,
        )
        .to("[data-hero-copy]", { opacity: 0.2, duration: 15 }, 85);

      // Pointer parallax — capped at ~1.5°, desktop only.
      const stage = one("[data-rail-stage]");
      if (stage && !compact) {
        const spin = gsap.quickTo(stage, "rotateY", { duration: 0.9, ease: "power3.out" });
        const slide = gsap.quickTo(stage, "x", { duration: 0.9, ease: "power3.out" });
        const onMove = (event: PointerEvent) => {
          const ratio = event.clientX / window.innerWidth - 0.5;
          spin(ratio * 3);
          slide(ratio * 14);
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
      }
      return undefined;
    }, host);

    return () => ctx.revert();
  }, []);

  return (
    <section className="scene scene-hero" ref={root}>
      <div className="grid-veil" aria-hidden="true" />

      <div className="hero-grid">
        <div className="hero-copy" data-hero-copy>
          <motion.p
            className="eyebrow"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            FUSIONIFY / CEILING
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.06, ease: [0.22, 1, 0.36, 1] }}
          >
            Metered billing
            <br />
            you can recompute.
          </motion.h1>

          <motion.p
            className="hero-lede"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
          >
            You authorize a ceiling. Ceiling publishes what counted. You pay only
            for output that held up.
          </motion.p>

          <motion.div
            className="button-row"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            <LaunchLink className="button">Launch App</LaunchLink>
            <Link className="text-link" href={`${MONADSCAN}/address/${PROOF.contract}`}>
              View On-chain Proof <span aria-hidden="true">↗</span>
            </Link>
          </motion.div>

          <dl className="hero-facts">
            <div>
              <dt>MAX UNITS</dt>
              <dd>{UNITS.max}</dd>
            </div>
            <div>
              <dt>UNIT PRICE</dt>
              <dd>{UNITS.unitPrice}</dd>
            </div>
            <div>
              <dt>CEILING</dt>
              <dd>{UNITS.ceilingShort}</dd>
            </div>
          </dl>
        </div>

        <div className="hero-stage">
          <BillingRail />
        </div>
      </div>

      <div className="hero-foot" aria-hidden="true">
        <span>PRECOMMITTED POLICY</span>
        <span>DETERMINISTIC VALIDATOR</span>
        <span>PUBLISHED OUTPUT</span>
        <span>RECOMPUTABLE BILL</span>
      </div>
    </section>
  );
}
