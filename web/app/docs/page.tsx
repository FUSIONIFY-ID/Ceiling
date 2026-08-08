import type { Metadata } from "next";
import Link from "next/link";

import { DocsNav, DocsToc } from "@/components/docs/docs-nav";
import { Footer } from "@/components/site-shell";
import { GITHUB, MONADSCAN, PROOF } from "@/lib/proof";
import { UNITS } from "@/lib/session";

import "../home.css";
import "./docs.css";

export const metadata: Metadata = {
  title: "Docs — Ceiling",
  description:
    "How Ceiling commits a billing policy, meters output deterministically, and produces a bill anyone can recompute.",
};

const SECTIONS = [
  ["overview", "Overview"],
  ["mechanism", "Mechanism"],
  ["policy", "Policy and validator"],
  ["metering", "Metering and failure"],
  ["arithmetic", "Money arithmetic"],
  ["recomputation", "Recomputation"],
  ["registry", "On-chain registry"],
  ["payment", "Payment paths"],
  ["running", "Running locally"],
  ["limitations", "Limitations"],
] as const;

export default function DocsPage() {
  return (
    <>
      <DocsNav />

      <main className="docs">
        <header className="docs-hero">
          <p className="eyebrow">DOCUMENTATION</p>
          <h1>How Ceiling bills.</h1>
          <p className="docs-lede">
            Ceiling commits pricing and acceptance rules before output exists,
            meters only the output that satisfies them, and publishes everything
            needed to recompute the bill independently.
          </p>
          <div className="docs-meta">
            <div>
              <span>NETWORK</span>
              <b>Monad Testnet · 10143</b>
            </div>
            <div>
              <span>REGISTRY</span>
              <b>
                <Link href={`${MONADSCAN}/address/${PROOF.contract}`}>
                  {PROOF.contract.slice(0, 10)}…{PROOF.contract.slice(-6)} ↗
                </Link>
              </b>
            </div>
            <div>
              <span>SOURCE</span>
              <b>
                <Link href={GITHUB}>github.com/FUSIONIFY-ID/Ceiling ↗</Link>
              </b>
            </div>
          </div>
        </header>

        <div className="docs-body">
          <DocsToc sections={SECTIONS} />

          <article className="docs-content">
            <section id="overview">
              <h2>Overview</h2>
              <p>
                Normal usage billing asks the buyer to trust how the vendor
                defines a unit, counts usage, treats invalid output, and
                calculates the final invoice. The buyer receives one number and
                has no way to check it.
              </p>
              <p>
                Ceiling precommits five things before processing begins: the
                unit definition, the deterministic validator, the failure
                policy, the unit price, and the maximum number of units. After
                processing, it publishes the output and billing metadata needed
                to rerun the same validator and recompute the charge.
              </p>
              <div className="callout">
                <b>The core claim</b>
                <p>
                  A Ceiling invoice is derived from a published session artifact
                  rather than accepted as an opaque vendor total.
                </p>
              </div>
            </section>

            <section id="mechanism">
              <h2>Mechanism</h2>
              <ol className="docs-steps">
                <li>
                  <b>.001 Commit</b>
                  <p>
                    Canonicalize the policy, hash it with Keccak-256, and record
                    the hash on-chain before any output exists.
                  </p>
                </li>
                <li>
                  <b>.002 Authorize</b>
                  <p>
                    The buyer authorizes no more than{" "}
                    <code>maxUnits × unitPrice</code>. In the reference session
                    that is {UNITS.max} × {UNITS.unitPrice} ={" "}
                    {UNITS.ceilingShort}. No valid execution can bill more.
                  </p>
                </li>
                <li>
                  <b>.003 Meter</b>
                  <p>
                    Records are validated in order. Only accepted units are
                    counted. The first invalid record ends the billable stream.
                  </p>
                </li>
                <li>
                  <b>.004 Settle</b>
                  <p>
                    The actual bill is computed, the outcome is recorded, and
                    the session artifact is published for recomputation.
                  </p>
                </li>
              </ol>
            </section>

            <section id="policy">
              <h2>Policy and validator</h2>
              <p>
                The policy is versioned and serialized canonically — object keys
                are sorted recursively so that insertion order cannot change the
                hash. Including <code>maxUnits</code> in the policy prevents the
                billing ceiling from being changed after the policy is accepted.
              </p>
              <pre>
                <code>{`{
  "failurePolicy": "cut-on-first-invalid",
  "maxUnits": 25,
  "schema": { "name": "string", "score": "finite-number" },
  "unitDefinition": "one canonical JSON record",
  "unitPriceAtomic": "2000",
  "validator": "canonical-json-record-v1",
  "version": 1
}`}</code>
              </pre>
              <p>
                The reference validator accepts a record only when{" "}
                <code>name</code> is a non-empty string and <code>score</code>{" "}
                is a finite number. Every rejection carries a machine-readable
                reason: <code>record_not_object</code>,{" "}
                <code>name_not_string</code>, <code>name_empty</code>, or{" "}
                <code>score_not_finite</code>.
              </p>
              <div className="callout callout-warn">
                <b>Your validator must be deterministic</b>
                <p>
                  Same input, same result, on any machine, at any time. No model
                  calls, no randomness, no clocks, no network. If the buyer
                  cannot reproduce it, the whole guarantee collapses.
                </p>
              </div>
            </section>

            <section id="metering">
              <h2>Metering and failure</h2>
              <p>
                Under <code>cut-on-first-invalid</code>, the first rejected
                record is not billed and every record after it falls outside the
                billable stream. The meter also slices the produced records to{" "}
                <code>maxUnits</code> before iterating, so a producer cannot
                exceed the committed ceiling.
              </p>
              <pre>
                <code>{`record 01–17   ACCEPT
record 18      REJECT — score_not_finite
STREAM CUT
record 19–25   not charged`}</code>
              </pre>
            </section>

            <section id="arithmetic">
              <h2>Money arithmetic</h2>
              <p>
                Monad Testnet USDC has six decimals. Every amount is an integer
                in atomic units held as <code>bigint</code>. Floating point is
                never used for billing; decimal strings are display formatting
                only.
              </p>
              <table className="docs-table">
                <thead>
                  <tr>
                    <th>Quantity</th>
                    <th>Formula</th>
                    <th>Reference session</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Ceiling</td>
                    <td>
                      <code>maxUnits × unitPriceAtomic</code>
                    </td>
                    <td>25 × 2,000 = 50,000</td>
                  </tr>
                  <tr>
                    <td>Actual</td>
                    <td>
                      <code>acceptedUnits × unitPriceAtomic</code>
                    </td>
                    <td>17 × 2,000 = 34,000</td>
                  </tr>
                  <tr>
                    <td>Unused</td>
                    <td>
                      <code>ceiling − actual</code>
                    </td>
                    <td>50,000 − 34,000 = 16,000</td>
                  </tr>
                </tbody>
              </table>
            </section>

            <section id="recomputation">
              <h2>Recomputation</h2>
              <p>An independent party needs the published artifact, then:</p>
              <ol className="docs-list">
                <li>Canonicalize the policy and hash it; compare to <code>policyHash</code>.</li>
                <li>Canonicalize the full output and hash it; compare to <code>outputHash</code>.</li>
                <li>Rerun the validator in order, stopping at the first invalid record.</li>
                <li>Count accepted units before the cut.</li>
                <li>Recompute actual and unused amounts with integer arithmetic.</li>
                <li>Compare every result against the published values.</li>
              </ol>
              <p>
                <code>recomputeSession</code> returns five booleans:{" "}
                <code>policyHashMatches</code>, <code>outputHashMatches</code>,{" "}
                <code>acceptedUnitsMatches</code>,{" "}
                <code>actualAmountMatches</code>, and{" "}
                <code>billingMatches</code>.
              </p>
              <div className="callout">
                <b>Why the contract alone is not enough</b>
                <p>
                  The registry can only check that{" "}
                  <code>settledAmount == acceptedUnits × unitPrice</code>. A
                  seller who inflates the unit count and keeps the arithmetic
                  consistent still passes that check. Only rerunning the
                  validator over the published output catches it — which is why
                  the raw records are published, not just the totals.
                </p>
              </div>
            </section>

            <section id="registry">
              <h2>On-chain registry</h2>
              <p>
                <code>CeilingRegistry</code> is a registry, not an escrow and
                not an output validator. It never receives raw output, never
                custodies payment, and never initiates a refund. It enforces:
              </p>
              <ul className="docs-list">
                <li>each <code>sessionId</code> can be committed once;</li>
                <li>a session must exist before an outcome is recorded;</li>
                <li>only the session creator can record its outcome;</li>
                <li>an outcome can be recorded once;</li>
                <li><code>acceptedUnits ≤ maxUnits</code>;</li>
                <li><code>settledAmount == acceptedUnits × unitPrice</code>.</li>
              </ul>
              <dl className="docs-proof">
                <div>
                  <dt>REGISTRY</dt>
                  <dd>
                    <Link href={`${MONADSCAN}/address/${PROOF.contract}`}>
                      {PROOF.contract} ↗
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt>DEPLOYMENT TX</dt>
                  <dd>
                    <Link href={`${MONADSCAN}/tx/${PROOF.deploymentTx}`}>
                      {PROOF.deploymentTx} ↗
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt>COMMIT TX</dt>
                  <dd>
                    <Link href={`${MONADSCAN}/tx/${PROOF.commitTx}`}>
                      {PROOF.commitTx} ↗
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt>OUTCOME TX</dt>
                  <dd>
                    <Link href={`${MONADSCAN}/tx/${PROOF.outcomeTx}`}>
                      {PROOF.outcomeTx} ↗
                    </Link>
                  </dd>
                </div>
                <div>
                  <dt>POLICY HASH</dt>
                  <dd>
                    <code>{PROOF.policyHash}</code>
                  </dd>
                </div>
                <div>
                  <dt>OUTPUT HASH</dt>
                  <dd>
                    <code>{PROOF.outputHash}</code>
                  </dd>
                </div>
              </dl>
            </section>

            <section id="payment">
              <h2>Payment paths</h2>
              <h3>Path A — x402 upto</h3>
              <p>
                The intended native path. The buyer signs a maximum
                authorization, the server meters output, and the facilitator
                settles an amount less than or equal to that maximum. The unused
                portion never moves.
              </p>
              <h3>Path B — Ceiling Boomerang</h3>
              <p>
                The fallback. Charge the full ceiling with x402{" "}
                <code>exact</code>, run the same deterministic pipeline, then
                refund the difference. It preserves the product economics but is
                not protocol-equivalent to <code>upto</code>: the full ceiling
                reaches the receiver first, and the refund is a separate
                transaction with its own funding and failure assumptions.
              </p>
              <div className="callout callout-warn">
                <b>Current payment status</b>
                <p>
                  Integration READY. Facilitator preflight PASS. Live settlement
                  WAITING FOR TEST USDC. No live USDC payment or refund is
                  claimed, and no placeholder transaction is shown in its place.
                </p>
              </div>
            </section>

            <section id="running">
              <h2>Running locally</h2>
              <p>Node.js 20 or newer.</p>
              <pre>
                <code>{`npm install
npm run check          # typecheck
npm run test:core      # deterministic self-check
npm run contract:compile
npm run demo:core      # full session in the terminal`}</code>
              </pre>
              <p>The website and interactive session:</p>
              <pre>
                <code>{`cd web
npm install
npm run dev`}</code>
              </pre>
              <p>
                Payment commands need a funded test wallet and a local{" "}
                <code>.env.local</code>. Never commit private keys, and use
                dedicated burner wallets only.
              </p>
            </section>

            <section id="limitations">
              <h2>Limitations</h2>
              <ul className="docs-list">
                <li>
                  The validator is deterministic and domain-specific. It proves
                  compliance with declared field rules, not semantic truth or
                  output quality.
                </li>
                <li>
                  The seeded producer exists to make the demonstration
                  reproducible. It is not a real model call.
                </li>
                <li>The registry does not inspect raw output.</li>
                <li>
                  External recomputation depends on the published artifact
                  remaining available.
                </li>
                <li>
                  Canonical serialization follows JSON number formatting, so a
                  non-JavaScript reimplementation must match those rules to
                  reproduce <code>outputHash</code>.
                </li>
                <li>
                  The exact-and-refund fallback has two on-chain operations. A
                  failed refund leaves the ceiling charge in place.
                </li>
              </ul>
            </section>

            <nav className="docs-next">
              <Link className="button" href="/demo">
                Run the live session
              </Link>
              <Link className="text-link" href={GITHUB}>
                Read the source <span aria-hidden="true">↗</span>
              </Link>
            </nav>
          </article>
        </div>
      </main>

      <Footer />
    </>
  );
}
