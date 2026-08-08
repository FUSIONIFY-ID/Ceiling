"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { LaunchLink } from "@/components/launch-transition";
import { Mark } from "@/components/site-shell";

type Section = readonly [string, string];

export function DocsNav() {
  return (
    <header className="site-nav is-condensed docs-nav">
      <Link className="wordmark" href="/" aria-label="Fusionify Ceiling home">
        <Mark />
        FUSIONIFY
      </Link>
      <nav className="site-nav-links" aria-label="Primary navigation">
        <Link href="/#product">Product</Link>
        <Link href="/#mechanism">Mechanism</Link>
        <Link href="/#proof">Proof</Link>
        <Link className="is-active" href="/docs">
          Docs
        </Link>
      </nav>
      <div className="site-nav-actions">
        <span className="network">
          <i aria-hidden="true" />
          Monad Testnet
        </span>
        <LaunchLink className="button button-small">Launch App</LaunchLink>
      </div>
    </header>
  );
}

export function DocsToc({ sections }: { sections: readonly Section[] }) {
  const [active, setActive] = useState(sections[0]?.[0] ?? "");

  useEffect(() => {
    const headings = sections
      .map(([id]) => document.getElementById(id))
      .filter((node): node is HTMLElement => node !== null);
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-90px 0px -62% 0px", threshold: 0 },
    );

    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <aside className="docs-toc" aria-label="On this page">
      <p>ON THIS PAGE</p>
      <ol>
        {sections.map(([id, label]) => (
          <li key={id}>
            <a className={active === id ? "is-active" : undefined} href={`#${id}`}>
              {label}
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}
