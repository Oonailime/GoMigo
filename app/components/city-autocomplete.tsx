"use client";

import { useEffect, useState } from "react";
import styles from "../page.module.css";

type CityOption = {
  id: number;
  name: string;
  stateCode: string;
};

type CityAutocompleteProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  helperText?: string;
};

export function CityAutocomplete({
  label,
  value,
  onChange,
  placeholder,
  helperText,
}: CityAutocompleteProps) {
  const [options, setOptions] = useState<CityOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFallback, setIsFallback] = useState(false);
  const normalizedValue = value.trim().toLowerCase();

  useEffect(() => {
    const searchTerm = value.trim();

    if (searchTerm.length < 2) {
      setOptions([]);
      return;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(async () => {
      setIsLoading(true);

      try {
        const response = await fetch(
          `/api/cities?query=${encodeURIComponent(searchTerm)}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          setOptions([]);
          return;
        }

        const data = (await response.json()) as {
          cities: CityOption[];
          fallback?: boolean;
        };
        setOptions(data.cities);
        setIsFallback(Boolean(data.fallback));
      } catch {
        setOptions([]);
        setIsFallback(false);
      } finally {
        setIsLoading(false);
      }
    }, 180);

    return () => {
      controller.abort();
      clearTimeout(timeoutId);
    };
  }, [value]);

  const shouldShowResults =
    normalizedValue.length >= 2 &&
    (isLoading ||
      options.some(
        (option) =>
          `${option.name} - ${option.stateCode}`.toLowerCase() !== normalizedValue,
      ));

  return (
    <label className={styles.fieldGroup}>
      <span className={styles.fieldLabel}>{label}</span>
      <div className={styles.inputShell}>
        <input
          className={styles.textInput}
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          autoComplete="off"
        />

        {shouldShowResults ? (
          <div className={styles.autocompleteResults} role="listbox">
            {isLoading ? (
              <span className={styles.fieldHint}>Buscando cidades...</span>
            ) : (
              options.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={styles.autocompleteItem}
                  onClick={() => onChange(`${option.name} - ${option.stateCode}`)}
                >
                  {option.name} - {option.stateCode}
                </button>
              ))
            )}
          </div>
        ) : null}
      </div>
      <span className={styles.fieldHint}>
        {isFallback
          ? "Mostrando sugestoes locais enquanto a base completa nao responde."
          : helperText}
      </span>
    </label>
  );
}
