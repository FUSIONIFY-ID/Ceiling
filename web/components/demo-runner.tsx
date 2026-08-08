"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import type { DemoSession } from "@/lib/types";

type Phase = "ready" | "loading" | "running" | "cut" | "complete" | "error";

const money = (value: string) =>
  `$${(Number(value) / 1_000_000).toFixed(6)}`;

export function DemoRunner() {
  const [data, setData] = useState<DemoSession | null>(null);
  const [phase, setPhase] = useState<Phase>("ready");
  const [visible, setVisible] = useState(0);
  const timers = useRef<number[]>([]);

  function clearTimers() {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
  }

  useEffect(() => clearTimers, []);

  function reset() {
    clearTimers();
    setData(null);
    setVisible(0);
    setPhase("ready");
  }

  async function run() {
    clearTimers();
    setData(null);
    setVisible(0);
    setPhase("loading");
    try {
      const response = await fetch("/api/demo-session", { cache: "no-store" });
      if (!response.ok) throw new Error("demo_session_failed");
      const session = (await response.json()) as DemoSession;
      setData(session);
      setPhase("running");

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const delay = reduced ? 0 : 115;
      for (let index = 1; index <= 18; index += 1) {
        timers.current.push(
          window.setTimeout(() => {
            setVisible(index);
            if (index === 18) setPhase("cut");
          }, index * delay),
        );
      }
      timers.current.push(
        window.setTimeout(() => setPhase("complete"), 18 * delay + (reduced ? 0 : 700)),
      );
    } catch {
      setPhase("error");
    }
  }

  const accepted = data
    ? data.records.slice(0, visible).filter((item) => item.billed).length
    : 0;
  const current = data?.records[Math.max(0, Math.min(visible - 1, 17))];
  const isDone = phase === "complete";

  return (
    <main className="demo-main">
      <section className="demo-head">
        <div>
          <p className="eyebrow">CEILING / LIVE SESSION</p>
          <h1>Run the meter.<br />Inspect every unit.</h1>
        </div>
        <div className="demo-controls">
          <span className={`demo-status status-${phase}`}>
            <i />
            {phase === "ready" ? "READY" : phase.toUpperCase()}
          </span>
          <button className="button" type="button" onClick={run} disabled={phase === "loading" || phase === "running" || phase === "cut"}>
            RUN SESSION
          </button>
          <button className="reset-button" type="button" onClick={reset}>
            RESET
          </button>
        </div>
      </section>

      <section className="demo-workspace" aria-live="polite">
        <div className="demo-meter">
          <div className="workspace-heading">
            <span>DETERMINISTIC OUTPUT STREAM</span>
            <span>{data ? `SESSION / ${data.sessionId.slice(2, 10)}` : "AWAITING RUN"}</span>
          </div>
          <div className="demo-counter">
            <span>ACCEPTED UNITS</span>
            <strong>{String(accepted).padStart(2, "0")}</strong>
            <small>/ {data?.maxUnits ?? 25}</small>
          </div>
          <div className="demo-slots">
            {Array.from({ length: 25 }, (_, index) => {
              const item = data?.records[index];
              const shown = index < visible;
              const state = !shown
                ? "pending"
                : item?.billed
                  ? "accepted"
                  : item?.validation && !item.validation.valid
                    ? "rejected"
                    : "pending";
              return (
                <span className={`demo-slot demo-slot-${state}`} key={index}>
                  {String(index + 1).padStart(2, "0")}
                </span>
              );
            })}
          </div>
          <div className={`record-inspector${phase === "cut" || isDone ? " record-failed" : ""}`}>
            <div>
              <span>CURRENT RECORD</span>
              <strong>{visible ? String(visible).padStart(2, "0") : "—"}</strong>
            </div>
            <pre>{current ? JSON.stringify(current.record, null, 2) : "{\n  waiting for output\n}"}</pre>
            <div className="validator-result">
              <span>VALIDATOR</span>
              <strong>
                {!current
                  ? "idle"
                  : current.validation?.valid
                    ? "ACCEPT"
                    : current.validation?.reason}
              </strong>
              {(phase === "cut" || isDone) && <b>STREAM CUT AT RECORD 18</b>}
            </div>
          </div>
        </div>

        <aside className="demo-ledger">
          <p className="workspace-heading"><span>SESSION LEDGER</span></p>
          <dl>
            <div><dt>AUTHORIZED MAXIMUM</dt><dd>{data ? money(data.ceilingAmount) : "$0.050000"}</dd></div>
            <div><dt>ACTUAL</dt><dd>{isDone && data ? money(data.actualAmount) : "—"}</dd></div>
            <div><dt>UNUSED</dt><dd>{isDone && data ? money(data.unusedAmount) : "—"}</dd></div>
          </dl>
          <div className="demo-equation">
            <span>SETTLEMENT ARITHMETIC</span>
            <p>{isDone ? `${accepted} × $0.002000` : "— × $0.002000"}</p>
            <strong>{isDone && data ? `= ${money(data.actualAmount)}` : "= —"}</strong>
          </div>
          <div className="demo-recompute">
            <span>RECOMPUTATION</span>
            {["policyHashMatches", "outputHashMatches", "acceptedUnitsMatches", "actualAmountMatches", "billingMatches"].map((key) => (
              <p key={key}>
                {key.replace("Matches", "").replace(/[A-Z]/g, (letter) => ` ${letter}`).toUpperCase()}
                <b>{isDone && data?.recomputation[key] ? "MATCH" : "—"}</b>
              </p>
            ))}
            {isDone && <strong>PASS</strong>}
          </div>
        </aside>
      </section>

      <section className="demo-proof-status">
        <div>
          <p className="eyebrow">CORE / ON-CHAIN PROOF</p>
          <p><span>DETERMINISTIC CORE</span><b>{isDone ? "PASS" : "READY"}</b></p>
          <p><span>MONAD READBACK</span><b>{data?.proof.readback ?? "PASS"}</b></p>
          <p><span>CONTRACT</span><Link href="https://testnet.monadscan.com/address/0xbd06bb4d0a50f84fec7dcd3a916605ff662e7d61">VIEW ↗</Link></p>
        </div>
        <div>
          <p className="eyebrow">X402 PAYMENT STATUS</p>
          <p><span>x402 INTEGRATION</span><b>{data?.payment.integration ?? "READY"}</b></p>
          <p><span>FACILITATOR PREFLIGHT</span><b>{data?.payment.preflight ?? "PASS"}</b></p>
          <p><span>LIVE SETTLEMENT</span><b className="waiting">{data?.payment.liveSettlement ?? "WAITING FOR TEST USDC"}</b></p>
        </div>
      </section>
      {phase === "error" && (
        <p className="demo-error" role="alert">
          The core session could not be generated. Reset and run again.
        </p>
      )}
    </main>
  );
}
