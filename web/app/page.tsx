import Link from "next/link";

import { BillingTrace, MeterStory } from "@/components/billing-trace";
import { CopyHash } from "@/components/copy-hash";
import { Footer, Header } from "@/components/site-shell";
import { MONADSCAN, PROOF } from "@/lib/proof";

const proofRows = [
  ["CONTRACT", PROOF.contract, `${MONADSCAN}/address/${PROOF.contract}`],
  ["SESSION", PROOF.session, `${MONADSCAN}/tx/${PROOF.commitTx}`],
  ["DEPLOYMENT TX", PROOF.deploymentTx, `${MONADSCAN}/tx/${PROOF.deploymentTx}`],
  ["COMMIT TX", PROOF.commitTx, `${MONADSCAN}/tx/${PROOF.commitTx}`],
  ["OUTCOME TX", PROOF.outcomeTx, `${MONADSCAN}/tx/${PROOF.outcomeTx}`],
] as const;

const lanes = [86, 67, 92, 74, 81, 62, 89, 70, 95, 78, 65, 84];

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">FUSIONIFY / CEILING</p>
            <h1>Metered billing<br />you can recompute.</h1>
            <p className="hero-lede">
              You authorize a ceiling. Ceiling publishes what counted. You only
              pay for output that held up.
            </p>
            <div className="button-row">
              <Link className="button" href="/demo">Launch Demo</Link>
              <Link
                className="text-link"
                href={`${MONADSCAN}/address/${PROOF.contract}`}
              >
                View On-chain Proof <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
          <BillingTrace />
          <div className="hero-foot">
            <span>PRECOMMITTED POLICY</span>
            <span>DETERMINISTIC VALIDATOR</span>
            <span>PUBLISHED OUTPUT</span>
            <span>RECOMPUTABLE BILL</span>
          </div>
        </section>

        <MeterStory />

        <section className="problem section" aria-labelledby="problem-title">
          <p className="eyebrow">THE PROBLEM</p>
          <h2 id="problem-title">
            The problem isn&apos;t usage billing.<br />
            It&apos;s trusting the meter.
          </h2>
          <div className="problem-columns">
            <article>
              <p className="chapter">TRADITIONAL USAGE BILLING</p>
              <p>
                Vendor defines the unit.<br />
                Vendor runs the meter.<br />
                Vendor produces the invoice.
              </p>
              <p className="muted-copy">Buyer receives the final number.</p>
              <strong className="comparison comparison-muted">TRUST THE NUMBER</strong>
            </article>
            <article>
              <p className="chapter">CEILING</p>
              <p>
                The unit is committed before output exists.<br />
                The validator is deterministic.<br />
                The output is published.<br />
                The final arithmetic is recomputable.
              </p>
              <strong className="comparison">RECOMPUTE THE NUMBER</strong>
            </article>
          </div>
        </section>

        <section className="mechanism section" id="mechanism">
          <div className="section-intro">
            <p className="eyebrow">THE MECHANISM</p>
            <h2>One commitment.<br />One verifiable path.</h2>
          </div>
          <div className="mechanism-line">
            <article>
              <p className="mechanism-number">.001</p>
              <div>
                <h3>COMMIT</h3>
                <p>Precommit unit definition, validator, unit price, maxUnits, and failure policy.</p>
                <code>policyHash<br />0x2649...f123</code>
              </div>
            </article>
            <article>
              <p className="mechanism-number">.002</p>
              <div>
                <h3>AUTHORIZE</h3>
                <p>Maximum<br /><strong>25 × $0.002 = $0.050</strong></p>
                <code>payment path / x402</code>
              </div>
            </article>
            <article>
              <p className="mechanism-number">.003</p>
              <div>
                <h3>METER</h3>
                <p><strong>17 valid</strong><br /><span className="danger">18 rejected</span></p>
                <code>cut-on-first-invalid</code>
              </div>
            </article>
            <article>
              <p className="mechanism-number">.004</p>
              <div>
                <h3>SETTLE</h3>
                <p><strong>17 × $0.002 = $0.034</strong><br />unused / $0.016</p>
                <code>actual ≤ authorized max</code>
              </div>
            </article>
          </div>
        </section>

        <section className="recompute section">
          <div>
            <p className="eyebrow eyebrow-light">RECOMPUTATION</p>
            <h2>The bill is just math.</h2>
          </div>
          <div className="equation" aria-label="17 times 0.002 dollars equals 0.034 dollars">
            <strong>17</strong><span>×</span><strong>$0.002</strong><span>=</span><strong>$0.034</strong>
          </div>
          <div className="proof-checks">
            <CopyHash label="POLICY HASH" value={PROOF.policyHash} />
            <CopyHash label="OUTPUT HASH" value={PROOF.outputHash} />
            <div className="simple-check"><span>ACCEPTED UNITS</span><b>MATCH</b></div>
            <div className="simple-check"><span>SETTLED AMOUNT</span><b>MATCH</b></div>
            <div className="simple-check"><span>FINALIZED</span><b>TRUE</b></div>
            <div className="recompute-pass"><span>RECOMPUTATION</span><strong>PASS</strong></div>
          </div>
        </section>

        <section className="onchain section" id="proof">
          <div className="section-intro onchain-intro">
            <p className="eyebrow"><span className="monad-mark">◆</span> ON-CHAIN / MONAD TESTNET</p>
            <h2>Recorded once.<br />Readable by anyone.</h2>
            <p>
              The registry enforces accepted units within the authorized maximum
              and settled amount equal to accepted units multiplied by unit price.
            </p>
          </div>
          <div className="onchain-data">
            {proofRows.map(([label, value, href]) => (
              <Link href={href} key={label}>
                <span>{label}</span>
                <code>{value}</code>
                <b aria-hidden="true">↗</b>
              </Link>
            ))}
          </div>
          <div className="proof-flow" aria-label="On-chain proof flow">
            {["POLICY", "COMMIT SESSION", "PROCESS", "RECORD OUTCOME", "READBACK", "MATCH"].map((step, index) => (
              <span key={step}>{step}{index < 5 && <i aria-hidden="true">↓</i>}</span>
            ))}
          </div>
        </section>

        <section className="concurrency section">
          <div className="section-intro">
            <p className="eyebrow">WHY MONAD</p>
            <h2>Many sessions.<br />Independent state.<br />Parallel settlement.</h2>
            <p>
              A single Ceiling session could run on many chains. Monad becomes
              especially useful when many independent machine-payment sessions
              are committed and settled concurrently.
            </p>
          </div>
          <div className="session-lanes">
            <p>SIMULATED CONCURRENCY VISUALIZATION</p>
            {lanes.map((width, index) => (
              <div className="session-lane" key={index}>
                <code>sess_{String(index + 1).padStart(2, "0")}</code>
                <span><i style={{ width: `${width}%` }} /></span>
                <b>SETTLED</b>
              </div>
            ))}
          </div>
        </section>

        <section className="technology" aria-label="Technology">
          <div><strong>MONAD</strong><span>high-performance execution</span></div>
          <div><strong>x402</strong><span>machine payment protocol</span></div>
          <div><strong>USDC</strong><span>settlement asset</span></div>
          <div><strong>PERMIT2</strong><span>authorization infrastructure</span></div>
        </section>

        <section className="final-cta">
          <div>
            <p className="eyebrow eyebrow-light">CEILING / LIVE DEMO</p>
            <h2>Authorize the ceiling.<br />Recompute the bill.</h2>
          </div>
          <div>
            <p>
              Run the deterministic demo and inspect the same arithmetic
              committed on Monad Testnet.
            </p>
            <div className="button-row">
              <Link className="button button-white" href="/demo">Launch Demo</Link>
              <Link className="text-link text-link-light" href={`${MONADSCAN}/address/${PROOF.contract}`}>
                View Contract <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
