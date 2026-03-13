"use client";

import { useId, useMemo, useRef, useState } from "react";
import fieldStyles from "../page.module.css";
import styles from "./trip-mode-select.module.css";
import { useDismissibleLayer } from "./use-dismissible-layer";

type TripModeOption = {
  value: string;
  label: string;
};

type TripModeSelectProps = {
  options: TripModeOption[];
  value: string;
  onChange: (value: string) => void;
};

export function TripModeSelect({
  options,
  value,
  onChange,
}: TripModeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const listboxId = useId();

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? options[0],
    [options, value],
  );

  useDismissibleLayer({
    isOpen,
    containerRef,
    onDismiss: () => setIsOpen(false),
  });

  return (
    <div className={fieldStyles.fieldGroup}>
      <span className={fieldStyles.fieldLabel}>Modo da viagem</span>
      <div className={fieldStyles.inputShell} ref={containerRef}>
        <button
          type="button"
          className={styles.trigger}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={isOpen ? listboxId : undefined}
          onClick={() => setIsOpen((currentValue) => !currentValue)}
        >
          <span className={styles.value}>{selectedOption.label}</span>
          <span className={styles.chevron} aria-hidden="true">
            v
          </span>
        </button>

        {isOpen ? (
          <div className={styles.results} role="listbox" id={listboxId}>
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={styles.item}
                role="option"
                aria-selected={option.value === value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <span className={fieldStyles.fieldHint}>
        Defina o tipo de experiencia que deseja montar.
      </span>
    </div>
  );
}
