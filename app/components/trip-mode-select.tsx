"use client";

import { useMemo, useState } from "react";
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

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? options[0],
    [options, value],
  );

  return (
    <div className={styles.fieldGroup}>
      <span className={styles.fieldLabel}>Modo da viagem</span>
      <div className={styles.inputShell}>
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
        Escolha se a busca foca carona, bate-volta ou roteiro completo.
      </span>
    </div>
  );
}
