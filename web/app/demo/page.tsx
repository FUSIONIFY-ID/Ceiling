import Link from "next/link";

import { DemoRunner } from "@/components/demo-runner";
import { Mark } from "@/components/site-shell";

import "./demo.css";

export default function DemoPage() {
  return (
    <div className="demo-page">
      <header className="demo-nav">
        <Link className="wordmark" href="/">
          <Mark />
          FUSIONIFY
        </Link>
        <Link className="text-link" href="/">
          Back to product <span aria-hidden="true">↗</span>
        </Link>
      </header>
      <DemoRunner />
    </div>
  );
}
