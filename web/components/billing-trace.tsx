"use client";

import { useEffect, useRef, useState } from "react";

type TraceProps = {
  compact?: boolean;
  activeUnits?: number;
  rejected?: boolean;
};

export function UnitRail({
  compact = false,
  activeUnits = 17,
  rejected = true,
}: TraceProps) {
  return (
    <div className={`unit-rail${compact ? " unit-rail-compact" : ""}`}>
      {Array.from({ length: 25 }, (_, index) => {
        const unit = index + 1;
        const state =
          unit <= activeUnits
            ? "accepted"
            : unit === 18 && rejected
              ? "rejected"
              : "uncharged";
        return (
          <span className={`unit unit-${state}`} key={unit}>
            <i />
            <small>{String(unit).padStart(2, "0")}</small>
          </span>
        );
      })}
      {rejected && <span className="cut-label">STREAM CUT</span>}
    </div>
  );
}

export function BillingTrace() {
  return (
    <div className="billing-trace" aria-label="Live billing trace">
      <div className="trace-heading">
        <span>
          <i aria-hidden="true" />
          LIVE BILLING TRACE
        </span>
        <span>SESSION / 001</span>
      </div>
      <div className="trace-authorized">
        <span>AUTHORIZED MAXIMUM</span>
        <strong>$0.050000</strong>
      </div>
      <UnitRail />
      <div className="trace-legend">
        <span><i className="legend-accepted" />17 ACCEPTED</span>
        <span><i className="legend-rejected" />1 REJECTED</span>
        <span><i className="legend-uncharged" />7 NOT CHARGED</span>
      </div>
      <div className="trace-total">
        <div><span>ACTUAL</span><strong>$0.034000</strong></div>
        <div><span>UNUSED</span><strong>$0.016000</strong></div>
      </div>
    </div>
  );
}

const STORY = [
  {
    state: "AUTHORIZED",
    eyebrow: "01 / PRECOMMITTED POLICY",
    title: "The upper bound exists before the output.",
    copy: "A canonical record, a deterministic validator, and a fixed unit price define what can count.",
  },
  {
    state: "PROCESSING",
    eyebrow: "02 / DETERMINISTIC METER",
    title: "Each record earns its place in the bill.",
    copy: "Validation runs sequentially. Accepted units increment one at a time—never from a vendor-supplied total.",
  },
  {
    state: "REJECTED",
    eyebrow: "03 / FAILURE POLICY",
    title: "Record 18 fails. The stream stops.",
    copy: "The score is not finite. Cut-on-first-invalid prevents every later record from being charged.",
  },
  {
    state: "SETTLEMENT",
    eyebrow: "04 / RECOMPUTABLE BILL",
    title: "Only accepted output reaches settlement.",
    copy: "Seventeen accepted records multiplied by the committed unit price produces the final amount.",
  },
] as const;

export function MeterStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const update = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const scrollable = section.offsetHeight - window.innerHeight;
      const progress = Math.min(0.999, Math.max(0, -rect.top / scrollable));
      setActive(Math.floor(progress * STORY.length));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  const story = STORY[active];
  const visibleUnits = active === 0 ? 0 : active === 1 ? 17 : 17;

  return (
    <section className="meter-story" id="product" ref={sectionRef}>
      <div className="meter-sticky">
        <div className="story-copy" aria-live="polite">
          <p className="eyebrow">{story.eyebrow}</p>
          <p className="story-step">0{active + 1} / 04</p>
          <h2>{story.title}</h2>
          <p>{story.copy}</p>
          <div className="story-index" aria-hidden="true">
            {STORY.map((item, index) => (
              <span className={index === active ? "active" : ""} key={item.state}>
                {item.state}
              </span>
            ))}
          </div>
        </div>

        <div className={`meter-machine meter-state-${active}`}>
          <div className="machine-topline">
            <span>LIVE METER / {story.state}</span>
            <span>validator.v1</span>
          </div>
          {active === 0 && (
            <div className="authorized-grid">
              <div><span>MAXIMUM</span><strong>25</strong><small>UNITS</small></div>
              <div><span>UNIT</span><strong>JSON</strong><small>CANONICAL RECORD</small></div>
              <div><span>UNIT PRICE</span><strong>$0.002</strong><small>USDC</small></div>
              <div><span>CEILING</span><strong>$0.050</strong><small>AUTHORIZED</small></div>
            </div>
          )}
          {active > 0 && (
            <>
              <UnitRail activeUnits={visibleUnits} rejected={active >= 2} />
              <div className="machine-counter">
                <span>ACCEPTED UNITS</span>
                <strong>{String(visibleUnits).padStart(2, "0")}</strong>
              </div>
            </>
          )}
          {active === 2 && (
            <div className="rejected-record">
              <pre>{`{\n  "name": "record-18",\n  "score": null\n}`}</pre>
              <div>
                <span>VALIDATOR</span>
                <strong>score_not_finite</strong>
                <b>STREAM CUT</b>
              </div>
            </div>
          )}
          {active === 3 && (
            <div className="settlement-machine">
              <div><span>AUTHORIZED</span><strong>$0.050</strong></div>
              <div><span>ACTUAL</span><strong>$0.034</strong></div>
              <div><span>NEVER CHARGED / UNUSED</span><strong>$0.016</strong></div>
              <p>17 × $0.002 <b>= $0.034</b></p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
