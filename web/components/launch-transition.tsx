"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { createPortal } from "react-dom";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { UNITS } from "@/lib/session";

const EASE = [0.76, 0, 0.24, 1] as const;
const HOLD_MS = 640;

type LaunchLinkProps = {
  children: ReactNode;
  className?: string;
  href?: string;
};

/**
 * Link to the app that plays the authorization sequence before navigating:
 * the ceiling plane drops, the units resolve, then the route changes.
 * Falls back to an immediate push when reduced motion is requested.
 */
export function LaunchLink({ children, className, href = "/demo" }: LaunchLinkProps) {
  const router = useRouter();
  const [running, setRunning] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    router.prefetch(href);
    return () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, [router, href]);

  const onClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      // Let modified clicks (new tab, download) behave normally.
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();

      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (still) {
        router.push(href);
        return;
      }

      setRunning(true);
      timer.current = window.setTimeout(() => router.push(href), HOLD_MS);
    },
    [router, href],
  );

  // The veil must escape any transformed ancestor — a GSAP-pinned section
  // would otherwise capture `position: fixed` and anchor it to the section.
  const veil = (
    <AnimatePresence>
        {running && (
          <motion.div
            className="launch-veil"
            role="status"
            aria-live="polite"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.44, ease: EASE }}
          >
            <motion.div
              className="launch-inner"
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2, ease: EASE }}
            >
              <p className="launch-label">AUTHORIZING CEILING</p>
              <p className="launch-amount">{UNITS.ceiling}</p>
              <ol className="launch-units">
                {Array.from({ length: UNITS.max }, (_, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0.16 }}
                    animate={{ opacity: index < UNITS.accepted ? 1 : 0.16 }}
                    transition={{
                      duration: 0.16,
                      delay: 0.22 + index * 0.012,
                      ease: "linear",
                    }}
                  />
                ))}
              </ol>
              <p className="launch-note">{UNITS.max} × {UNITS.unitPrice} MAXIMUM</p>
            </motion.div>
          </motion.div>
        )}
    </AnimatePresence>
  );

  return (
    <>
      <Link className={className} href={href} onClick={onClick}>
        {children}
      </Link>
      {/* `running` is always false on the server, so document is safe here. */}
      {running && createPortal(veil, document.body)}
    </>
  );
}
