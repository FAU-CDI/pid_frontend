"use client";

import { useEffect, useId, useRef, useState } from "react";
import CopyButton from "@/app/components/copy-button";

/** Collapsed max-height in px; keep in sync with `.metadata-block` (`max-h-48` = 12rem). */
const COLLAPSED_MAX_PX = 192;

type ExpandableMonoProps = {
  value: string;
  /** Passed to the copy control, e.g. "metadata". */
  copyLabel?: string;
};

export default function ExpandableMono({
  value,
  copyLabel = "metadata",
}: ExpandableMonoProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const preId = useId();
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = preRef.current;
    if (!el) {
      return;
    }

    function measure() {
      if (!el) {
        return;
      }
      setOverflows(el.scrollHeight > COLLAPSED_MAX_PX + 1);
    }

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div className="space-y-2">
      <div className="detail-copy-row">
        <pre
          id={preId}
          ref={preRef}
          className={
            expanded ? "metadata-block metadata-block-expanded" : "metadata-block"
          }
        >
          {value}
        </pre>
        <CopyButton value={value} label={copyLabel} />
      </div>
      {overflows && (
        <button
          type="button"
          className="metadata-toggle"
          onClick={() => setExpanded((current) => !current)}
          aria-expanded={expanded}
          aria-controls={preId}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
