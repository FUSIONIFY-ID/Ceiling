"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLayoutEffect, useRef } from "react";

import { MONADSCAN, PROOF } from "@/lib/proof";
import { PROOF_FLOW } from "@/lib/session";
import { reducedMotion, setupScrollMotion } from "@/lib/motion";

const ROWS = [
  ["CONTRACT", PROOF.contract, `${MONADSCAN}/address/${PROOF.contract}`],
  ["SESSION", PROOF.session, `${MONADSCAN}/tx/${PROOF.commitTx}`],
  ["DEPLOYMENT TX", PROOF.deploymentTx, `${MONADSCAN}/tx/${PROOF.deploymentTx}`],
  ["COMMIT TX", PROOF.commitTx, `${MONADSCAN}/tx/${PROOF.commitTx}`],
  ["OUTCOME TX", PROOF.outcomeTx, `${MONADSCAN}/tx/${PROOF.outcomeTx}`],
  ["POLICY HASH", PROOF.policyHash, `${MONADSCAN}/tx/${PROOF.commitTx}`],
  ["OUTPUT HASH", PROOF.outputHash, `${MONADSCAN}/tx/${PROOF.outcomeTx}`],
] as const;

export function OnchainProofSection() {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const host = root.current;
    if (!host || reducedMotion()) return;
    const gsap = setupScrollMotion();

    const ctx = gsap.context(() => {
      // Transparent document layers drift at different depths.
      gsap.utils.toArray<HTMLElement>("[data-layer]").forEach((layer, index) => {
        gsap.fromTo(
          layer,
          { yPercent: 12 + index * 5, rotateX: 24 },
          {
            yPercent: -10 - index * 4,
            rotateX: 18,
            ease: "none",
            scrollTrigger: { trigger: host, start: "top bottom", end: "bottom top", scrub: 1 },
          },
        );
      });

      gsap.fromTo(
        "[data-proof-line]",
        { opacity: 0, y: 18 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: { trigger: "[data-proof-data]", start: "top 82%", end: "top 40%", scrub: 0.8 },
        },
      );
    }, host);

    return () => ctx.revert();
  }, []);

  return (
    <section className="scene scene-onchain overlap-up" id="proof" ref={root}>
      <div className="onchain-head">
        <p className="eyebrow">
          <span className="monad-mark" aria-hidden="true">
            ◆
          </span>{" "}
          ON-CHAIN / MONAD TESTNET
        </p>
        <h2>
          Recorded once.
          <br />
          Readable by anyone.
        </h2>
        <p className="onchain-lede">
          The registry enforces accepted units within the authorized maximum, and
          a settled amount equal to accepted units multiplied by unit price.
        </p>
      </div>

      <div className="proof-layers" aria-hidden="true">
        {PROOF_FLOW.map((step, index) => (
          <span className="proof-layer" data-layer key={step} style={{ ["--d" as string]: index }}>
            {step}
          </span>
        ))}
      </div>

      <ol className="onchain-data" data-proof-data>
        {ROWS.map(([label, value, href]) => (
          <li data-proof-line key={label}>
            <motion.span whileHover={{ x: 2 }} transition={{ type: "spring", stiffness: 400, damping: 30 }}>
              <Link href={href}>
                <span>{label}</span>
                <code>{value}</code>
                <b aria-hidden="true">↗</b>
              </Link>
            </motion.span>
          </li>
        ))}
      </ol>
    </section>
  );
}
