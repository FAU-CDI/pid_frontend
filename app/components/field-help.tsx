"use client";

import { useTranslations } from "next-intl";
import { useEffect, useId, useRef, useState } from "react";

type FieldHelpProps = {
  /** Visible field heading; also used in the trigger accessible name. */
  label: string;
  /** Help body shown in the disclosure panel. */
  text: string;
  /** Class for the visible label text (default: detail-field-label). */
  labelClassName?: string;
};

/**
 * Field heading with a circled (?) disclosure for inline help.
 * Panel opens below the label row so it stays readable on narrow viewports.
 */
export default function FieldHelp({
  label,
  text,
  labelClassName = "detail-field-label",
}: FieldHelpProps) {
  const t = useTranslations("help");
  const panelId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    function onPointerDown(event: MouseEvent | PointerEvent) {
      const root = rootRef.current;
      if (!root || !(event.target instanceof Node)) {
        return;
      }
      if (!root.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  return (
    <div className="detail-field-heading" ref={rootRef}>
      <div className="detail-field-label-row">
        <span className={labelClassName}>
          {label}
          <span className="field-help-trigger-slot">
            <button
              type="button"
              className="field-help-trigger"
              aria-expanded={open}
              aria-controls={panelId}
              aria-label={t("trigger", { label })}
              onClick={() => setOpen((value) => !value)}
            >
              <span aria-hidden="true">?</span>
            </button>
          </span>
        </span>
      </div>
      {open ? (
        <div
          id={panelId}
          role="note"
          aria-label={t("trigger", { label })}
          className="field-help-panel"
        >
          <span className="field-help-panel-kicker">{t("kicker")}</span>
          {text}
        </div>
      ) : null}
    </div>
  );
}
