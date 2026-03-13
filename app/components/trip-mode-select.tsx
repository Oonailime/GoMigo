"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "../page.module.css";

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

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? options[0],
    [options, value],
  );

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  return (
    <div className={styles.fieldGroup}>
      <span className={styles.fieldLabel}>Modo da viagem</span>
      <div className={styles.inputShell} ref={containerRef}>
        <button
          type="button"
          className={styles.dropdownTrigger}
          onClick={() => setIsOpen((currentValue) => !currentValue)}
        >
          <span className={styles.dropdownValue}>{selectedOption.label}</span>
          <span className={styles.dropdownChevron} aria-hidden="true">
            v
          </span>
        </button>

        {isOpen ? (
          <div className={styles.autocompleteResults} role="listbox">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={styles.autocompleteItem}
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
      <span className={styles.fieldHint}>
        Defina o tipo de experiencia que deseja montar.
      </span>
    </div>
  );
}
