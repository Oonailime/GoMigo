"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../page.module.css";
import { BRAZILIAN_TRIP_MODES } from "../data/trip-modes";
import { CityAutocomplete } from "./city-autocomplete";
import { SocialLoginButtons } from "./social-login-buttons";
import { ThemeToggle } from "./theme-toggle";
import { TripModeSelect } from "./trip-mode-select";
import { UserMenu } from "./user-menu";
import dynamic from "next/dynamic";

const DateRangeField = dynamic(
  () => import("./date-range-field").then((mod) => mod.DateRangeField),
  {
    ssr: false,
    loading: () => (
      <div className={styles.fieldGroup}>
        <span className={styles.fieldLabel}>Periodo da viagem</span>
        <div className={styles.inputShell}>
          <div className={styles.dateRangeTrigger} aria-busy="true">
            <div className={styles.dateRangeSummary}>
              <div className={styles.dateSummaryBlock}>
                <span className={styles.dateCardLabel}>Ida</span>
                <span className={styles.dateDisplayValue}>Carregando</span>
              </div>
              <span className={styles.dateRangeArrow} aria-hidden="true">
                /
              </span>
              <div className={styles.dateSummaryBlock}>
                <span className={styles.dateCardLabel}>Volta</span>
                <span className={styles.dateDisplayValue}>Carregando</span>
              </div>
            </div>
            <span className={styles.dateDurationBadge}>...</span>
          </div>
        </div>
        <span className={styles.fieldHint}>
          Carregando calendario da viagem.
        </span>
      </div>
    ),
  },
);

type ThemeMode = "dark" | "light";

const normalizeCity = (value: string) => {
  const raw = value.split(" - ")[0]?.trim() ?? "";
  return raw.normalize("NFD").replace(/\p{Diacritic}/gu, "");
};

export function TravelPlannerForm() {
  const router = useRouter();
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [originCity, setOriginCity] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [tripMode, setTripMode] = useState(BRAZILIAN_TRIP_MODES[0].value);
  const [travelStartDate, setTravelStartDate] = useState("");
  const [travelEndDate, setTravelEndDate] = useState("");

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
  }, [themeMode]);

  const handleTravelStartDateChange = (value: string) => {
    setTravelStartDate(value);

    if (travelEndDate && value && travelEndDate < value) {
      setTravelEndDate("");
    }
  };

  const handleSearch = () => {
    const params = new URLSearchParams({
      cidadePartida: normalizeCity(originCity),
      cidadeDestino: normalizeCity(destinationCity),
      tipo: tripMode,
      dataInicio: travelStartDate,
      dataFim: travelEndDate,
    });

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className={styles.panelSection}>
      <div className={styles.panelHeader}>
        <div>
          <p className={styles.eyebrow}>Acesso rapido</p>
          <h2 className={styles.panelTitle}>Comece sua proxima viagem</h2>
        </div>
        <div className={styles.panelActions}>
          <ThemeToggle currentTheme={themeMode} onThemeChange={setThemeMode} />
          <UserMenu />
        </div>
      </div>

      <form className={styles.travelForm} onSubmit={(event) => event.preventDefault()}>
        <div className={styles.formColumn}>
          <CityAutocomplete
            label="Cidade de partida"
            value={originCity}
            onChange={setOriginCity}
            placeholder="Ex.: Sao Paulo"
            helperText="Ponto inicial da viagem."
          />
        </div>

        <div className={styles.formColumn}>
          <CityAutocomplete
            label="Destino principal"
            value={destinationCity}
            onChange={setDestinationCity}
            placeholder="Ex.: Rio de Janeiro"
            helperText="Busque municipios do Brasil."
          />
        </div>

        <div className={styles.formColumn}>
          <TripModeSelect
            options={BRAZILIAN_TRIP_MODES}
            value={tripMode}
            onChange={setTripMode}
          />
        </div>

        <div className={styles.formFullWidth}>
          <DateRangeField
            startDate={travelStartDate}
            endDate={travelEndDate}
            onStartDateChange={handleTravelStartDateChange}
            onEndDateChange={setTravelEndDate}
          />
        </div>

        <button
          type="button"
          className={`${styles.buttonPrimary} ${styles.formFullWidth}`}
          onClick={handleSearch}
        >
          Buscar opcoes
        </button>

        <div className={styles.formFullWidth}>
          <SocialLoginButtons />
        </div>
      </form>

      <p className={styles.footerText}>
        Para agencias, grupos ou guias locais.{" "}
        <a href="#demo" className={styles.footerLink}>
          Ver demonstracao
        </a>
      </p>
    </div>
  );
}
