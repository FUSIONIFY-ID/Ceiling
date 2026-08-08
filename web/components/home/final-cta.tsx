"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { LaunchLink } from "@/components/launch-transition";
import { UNITS } from "@/lib/session";

const TECH = [
  ["MONAD", "high-performance execution"],
  ["x402", "machine payment protocol"],
  ["USDC", "settlement asset"],
  ["PERMIT2", "authorization infrastructure"],
] as const;

export function TechStrip() {
  return (
    <section className="tech-strip" aria-label="Technology">
      {TECH.map(([name, note]) => (
        <div key={name}>
          <strong>{name}</strong>
          <span>{note}</span>
        </div>
      ))}
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="scene scene-final">
      <div className="final-copy">
        <p className="eyebrow eyebrow-light">CEILING / LIVE DEMO</p>
        <h2>
          Pay for valid output.
          <br />
          Recompute every bill.
        </h2>
        <p>
          Run the deterministic session and inspect the same arithmetic committed
          on Monad Testnet.
        </p>
        <div className="button-row">
          <motion.span whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
            <LaunchLink className="button button-white">Launch App</LaunchLink>
          </motion.span>
          <motion.span whileHover={{ x: 3 }}>
            <Link className="text-link text-link-light" href="/docs">
              Read the Docs <span aria-hidden="true">↗</span>
            </Link>
          </motion.span>
        </div>
      </div>

      {/* Frozen closing state of the hero rail — narrative bookend, no canvas. */}
      <div className="final-rail" aria-hidden="true">
        <span className="final-ceiling">
          CEILING <b>{UNITS.ceilingShort}</b>
        </span>
        <ol>
          {Array.from({ length: UNITS.max }, (_, index) => {
            const unit = index + 1;
            const state =
              unit <= UNITS.accepted
                ? "accepted"
                : unit === UNITS.rejectedAt
                  ? "rejected"
                  : "uncharged";
            return <li className={`final-unit final-unit-${state}`} key={unit} />;
          })}
        </ol>
        <span className="final-total">
          ACTUAL <b>{UNITS.actualShort}</b> · UNUSED <b>{UNITS.unusedShort}</b>
        </span>
      </div>
    </section>
  );
}
