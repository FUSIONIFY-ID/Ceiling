import Link from "next/link";

import { GITHUB, MONADSCAN, PROOF } from "@/lib/proof";

export function Mark() {
  return (
    <span className="mark" aria-hidden="true">
      <i />
      <i />
      <i />
    </span>
  );
}

export function Header() {
  return (
    <header className="site-header">
      <Link className="wordmark" href="/" aria-label="Fusionify Ceiling home">
        <Mark />
        FUSIONIFY
      </Link>
      <nav className="main-nav" aria-label="Primary navigation">
        <Link href="/#product">Product</Link>
        <Link href="/#mechanism">Mechanism</Link>
        <Link href="/#proof">Proof</Link>
        <Link href="https://github.com/FUSIONIFY-ID/Ceiling/tree/main/docs">
          Docs
        </Link>
      </nav>
      <div className="nav-actions">
        <span className="network">
          <i aria-hidden="true" />
          Monad Testnet
        </span>
        <Link className="button button-small" href="/demo">
          Launch Demo <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-identity">
        <span className="wordmark wordmark-light">
          <Mark />
          FUSIONIFY
        </span>
        <p>Infrastructure for bills you can verify.</p>
      </div>
      <div>
        <p className="footer-label">PRODUCT</p>
        <Link href="/#mechanism">Mechanism</Link>
        <Link href="/demo">Demo</Link>
      </div>
      <div>
        <p className="footer-label">DEVELOPERS</p>
        <Link href={GITHUB}>GitHub</Link>
        <Link href={`${GITHUB}/tree/main/docs`}>Docs</Link>
        <Link href={`${MONADSCAN}/address/${PROOF.contract}`}>Contract</Link>
      </div>
      <div>
        <p className="footer-label">NETWORK</p>
        <span>Monad Testnet</span>
        <Link href={`${MONADSCAN}/address/${PROOF.contract}`}>MonadScan</Link>
      </div>
    </footer>
  );
}
