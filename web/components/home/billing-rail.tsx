import { UNITS } from "@/lib/session";

type BillingRailProps = {
  /** `hero` carries the full 3D stage, `closing` is the frozen final state. */
  variant?: "hero" | "closing";
};

/**
 * CSS-3D metering rail. Pure markup + transforms — no WebGL.
 * Scroll choreography is applied by the parent scene via GSAP.
 */
export function BillingRail({ variant = "hero" }: BillingRailProps) {
  return (
    <div className={`rail-viewport rail-${variant}`} aria-hidden="true">
      <div className="rail-stage" data-rail-stage>
        <div className="rail-plane" data-rail-ceiling>
          <span className="rail-plane-edge" />
          <span className="rail-plane-label">
            AUTHORIZED CEILING
            <b>$0.050000</b>
            <i>25 × $0.002</i>
          </span>
        </div>

        <div className="rail-deck">
          <span className="rail-track" />
          <span className="rail-track rail-track-far" />
          <ol className="rail-units">
            {Array.from({ length: UNITS.max }, (_, index) => {
              const unit = index + 1;
              return (
                <li
                  className="rail-unit"
                  data-rail-unit={unit}
                  key={unit}
                  style={{ ["--i" as string]: index }}
                >
                  <i className="rail-unit-post" />
                  <i className="rail-unit-dot" />
                  <small>{String(unit).padStart(2, "0")}</small>
                </li>
              );
            })}
          </ol>
          <span className="rail-cut" data-rail-cut>
            <b>REJECTED</b>
            <i>score_not_finite</i>
          </span>
        </div>
      </div>

      <div className="rail-readout" data-rail-readout>
        <div>
          <span>ACCEPTED</span>
          <strong>{UNITS.accepted}</strong>
        </div>
        <div>
          <span>ACTUAL</span>
          <strong>{UNITS.actual}</strong>
        </div>
        <div>
          <span>UNUSED</span>
          <strong>{UNITS.unused}</strong>
        </div>
      </div>
    </div>
  );
}
