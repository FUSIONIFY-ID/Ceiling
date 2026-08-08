"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

import { LaunchLink } from "@/components/launch-transition";
import { Mark } from "@/components/site-shell";

const LINKS = [
  ["Product", "/#product"],
  ["Mechanism", "/#mechanism"],
  ["Proof", "/#proof"],
  ["Docs", "/docs"],
] as const;

export function SiteNav() {
  const [condensed, setCondensed] = useState(false);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setCondensed(window.scrollY > 80);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`site-nav${condensed ? " is-condensed" : ""}`}>
      <Link className="wordmark" href="/" aria-label="Fusionify Ceiling home">
        <Mark />
        FUSIONIFY
      </Link>

      <nav className="site-nav-links" aria-label="Primary navigation" onMouseLeave={() => setActive(null)}>
        {LINKS.map(([label, href]) => (
          <Link href={href} key={label} onMouseEnter={() => setActive(label)}>
            {label}
            {active === label && (
              <motion.i layoutId="nav-underline" transition={{ type: "spring", stiffness: 460, damping: 34 }} />
            )}
          </Link>
        ))}
      </nav>

      <div className="site-nav-actions">
        <span className="network">
          <i aria-hidden="true" />
          Monad Testnet
        </span>
        <motion.span whileHover={{ y: -1 }} whileTap={{ y: 0 }}>
          <LaunchLink className="button button-small">
            Launch App <span aria-hidden="true">↗</span>
          </LaunchLink>
        </motion.span>
      </div>
    </header>
  );
}
