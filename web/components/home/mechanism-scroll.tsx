"use client";

import { useLayoutEffect, useRef } from "react";

import { POLICY_LINES, UNITS } from "@/lib/session";
import { PROOF } from "@/lib/proof";
import { pinDistance, reducedMotion, setupScrollMotion } from "@/lib/motion";

const STEPS = ["COMMIT", "AUTHORIZE", "METER", "SETTLE"] as const;

export function MechanismScroll() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const host = root.current;
    if (!host) return;
    const gsap = setupScrollMotion();

    const ctx = gsap.context(() => {
      const units = Array.from(host.querySelectorAll<HTMLElement>("[data-mech-unit]"));
      const accepted = units.slice(0, UNITS.accepted);
      const rejected = units[UNITS.rejectedAt - 1];
      const uncharged = units.slice(UNITS.rejectedAt);

      if (reducedMotion()) {
        gsap.set("[data-mech-panel]", { opacity: 1, position: "relative", y: 0 });
        gsap.set(accepted, { "--lit": 1 });
        if (rejected) gsap.set(rejected, { "--rej": 1 });
        gsap.set(uncharged, { "--dim": 1 });
        return;
      }

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: host,
          start: "top top",
          end: pinDistance(260, 120),
          scrub: 0.65,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      const show = (index: number, at: number) => {
        timeline.to(`[data-mech-panel='${index}']`, { opacity: 1, y: 0, duration: 6 }, at);
        timeline.to(`[data-mech-step='${index}']`, { opacity: 1, duration: 4 }, at);
      };
      const hide = (index: number, at: number) => {
        timeline.to(`[data-mech-panel='${index}']`, { opacity: 0, y: -26, duration: 6 }, at);
        timeline.to(`[data-mech-step='${index}']`, { opacity: 0.3, duration: 4 }, at);
      };

      // 01 COMMIT — policy lines assemble, then collapse into the hash.
      show(0, 0);
      timeline.fromTo(
        "[data-policy-line]",
        { opacity: 0, x: -18 },
        { opacity: 1, x: 0, duration: 14, stagger: 2 },
        1,
      );
      timeline.to("[data-policy-line]", { opacity: 0.25, y: -6, duration: 6 }, 17);
      timeline.fromTo(
        "[data-policy-hash]",
        { opacity: 0, scale: 0.94 },
        { opacity: 1, scale: 1, duration: 7 },
        18,
      );
      hide(0, 25);

      // 02 AUTHORIZE — the ceiling bracket.
      show(1, 26);
      timeline.fromTo(
        "[data-auth-bracket]",
        { scaleX: 0.2, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 9 },
        28,
      );
      timeline.fromTo(
        "[data-auth-term]",
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 12, stagger: 3 },
        30,
      );
      hide(1, 47);

      // 03 METER — 25 markers resolve faster than the hero.
      show(2, 48);
      timeline.fromTo(
        accepted,
        { "--lit": 0 },
        { "--lit": 1, duration: 14, stagger: { each: 14 / accepted.length } },
        50,
      );
      timeline.fromTo(rejected ?? {}, { "--rej": 0 }, { "--rej": 1, duration: 3 }, 65);
      timeline.fromTo(
        "[data-mech-cut]",
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 5 },
        65,
      );
      timeline.fromTo(
        uncharged,
        { "--dim": 0 },
        { "--dim": 1, duration: 6, stagger: { each: 4 / Math.max(uncharged.length, 1) } },
        69,
      );
      hide(2, 76);

      // 04 SETTLE — the rail becomes arithmetic.
      show(3, 77);
      timeline.fromTo(
        "[data-settle-term]",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 14, stagger: 3 },
        79,
      );
      // The final amount carries down into the dark recomputation scene.
      timeline.to("[data-settle-carry]", { scale: 1.06, duration: 8 }, 92);
    }, host);

    return () => ctx.revert();
  }, []);

  return (
    <section className="scene scene-mechanism" id="mechanism" ref={root}>
      <div className="mech-grid">
        <div className="mech-head">
          <p className="eyebrow">THE MECHANISM</p>
          <h2>
            One commitment.
            <br />
            One verifiable path.
          </h2>
          <ol className="mech-steps">
            {STEPS.map((step, index) => (
              <li data-mech-step={index} key={step}>
                <b>.00{index + 1}</b>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div className="mech-stage">
          {/* 01 COMMIT */}
          <article className="mech-panel" data-mech-panel="0">
            <p className="panel-label">.001 / COMMIT</p>
            <dl className="policy-block">
              {POLICY_LINES.map(([label, value], index) => (
                <div data-policy-line key={`${label}-${index}`}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <p className="policy-hash" data-policy-hash>
              <span>policyHash</span>
              <code>{PROOF.policyHash.slice(0, 10)}…{PROOF.policyHash.slice(-4)}</code>
            </p>
          </article>

          {/* 02 AUTHORIZE */}
          <article className="mech-panel" data-mech-panel="1">
            <p className="panel-label">.002 / AUTHORIZE</p>
            <div className="auth-bracket" data-auth-bracket aria-hidden="true">
              <span>CEILING</span>
            </div>
            <p className="auth-equation">
              <b data-auth-term>{UNITS.max}</b>
              <i data-auth-term>×</i>
              <b data-auth-term>{UNITS.unitPrice}</b>
              <i data-auth-term>=</i>
              <b data-auth-term className="accent">
                {UNITS.ceilingShort}
              </b>
            </p>
            <p className="panel-note">
              x402 payment path — integration READY, facilitator preflight PASS,
              live settlement WAITING FOR TEST USDC.
            </p>
          </article>

          {/* 03 METER */}
          <article className="mech-panel" data-mech-panel="2">
            <p className="panel-label">.003 / METER</p>
            <ol className="mech-units">
              {Array.from({ length: UNITS.max }, (_, index) => (
                <li data-mech-unit={index + 1} key={index}>
                  <i />
                  <small>{String(index + 1).padStart(2, "0")}</small>
                </li>
              ))}
            </ol>
            <p className="mech-cut" data-mech-cut>
              <b>STREAM CUT</b>
              <i>{UNITS.rejectReason}</i>
            </p>
          </article>

          {/* 04 SETTLE */}
          <article className="mech-panel" data-mech-panel="3">
            <p className="panel-label">.004 / SETTLE</p>
            <p className="settle-equation">
              <b data-settle-term>{UNITS.accepted}</b>
              <i data-settle-term>×</i>
              <b data-settle-term>{UNITS.unitPrice}</b>
              <i data-settle-term>=</i>
              <b data-settle-term data-settle-carry className="accent">
                {UNITS.actualShort}
              </b>
            </p>
            <p className="settle-equation settle-secondary">
              <b data-settle-term>{UNITS.ceilingShort}</b>
              <i data-settle-term>−</i>
              <b data-settle-term>{UNITS.actualShort}</b>
              <i data-settle-term>=</i>
              <b data-settle-term>{UNITS.unusedShort}</b>
              <em data-settle-term>UNUSED</em>
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
