"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

type CopyButtonProps = {
  value: string;
  /** Used in aria-label / title, e.g. "URL" → "Copy URL". */
  label: string;
  /** Optional visible caption beside the icon (e.g. "PID", "Full"). */
  caption?: string;
};

export default function CopyButton({
  value,
  label,
  caption,
}: CopyButtonProps) {
  const t = useTranslations("a11y");
  const [copied, setCopied] = useState(false);
  const resetRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetRef.current) {
        clearTimeout(resetRef.current);
      }
    };
  }, []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      return;
    }
    setCopied(true);
    if (resetRef.current) {
      clearTimeout(resetRef.current);
    }
    resetRef.current = setTimeout(() => {
      setCopied(false);
      resetRef.current = null;
    }, 1500);
  }

  const copiedLabel = t("copied");
  const title = copied ? copiedLabel : t("copy", { label });

  return (
    <button
      type="button"
      className={caption ? "copy-button copy-button-labeled" : "copy-button"}
      onClick={copy}
      aria-label={title}
      title={title}
    >
      {copied ? <CheckIcon /> : <ClipboardIcon />}
      {caption ? (
        <span className="copy-button-caption">
          {copied ? copiedLabel : caption}
        </span>
      ) : null}
      <span className="sr-only" role="status" aria-live="polite">
        {copied ? copiedLabel : ""}
      </span>
    </button>
  );
}

function ClipboardIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="copy-button-icon"
      aria-hidden="true"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="copy-button-icon"
      aria-hidden="true"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
