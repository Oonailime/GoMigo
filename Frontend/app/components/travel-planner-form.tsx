"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../page.module.css";
import {
  defaultSearchDraft,
  writeSearchDraft,
} from "../data/search-storage";
import { BRAZILIAN_TRIP_MODES } from "../data/trip-modes";
import { useThemeMode } from "./use-theme-mode";

const LANDING_TRIP_MODES = [
  { value: "TODOS", label: "Todos os formatos" },
  ...BRAZILIAN_TRIP_MODES,
];

const CityAutocomplete = dynamic(
  () => import("./city-autocomplete").then((mod) => mod.CityAutocomplete),
  {
    loading: () => (
      <div className={styles.fieldGroup} aria-busy="true">
        <span className={styles.fieldLabel}>Carregando campo</span>
        <div className={styles.textInput}>Preparando busca de cidades...</div>
      </div>
    ),
  },
);

const TripModeSelect = dynamic(
  () => import("./trip-mode-select").then((mod) => mod.TripModeSelect),
  {
    loading: () => (
      <div className={styles.fieldGroup} aria-busy="true">
        <span className={styles.fieldLabel}>Modo da viagem</span>
        <div className={styles.textInput}>Carregando opcoes...</div>
      </div>
    ),
  },
);

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

const ThemeToggle = dynamic(
  () => import("./theme-toggle").then((mod) => mod.ThemeToggle),
  {
    ssr: false,
  },
);

const NotificationBell = dynamic(
  () => import("./notification-bell").then((mod) => mod.NotificationBell),
  {
    ssr: false,
  },
);

const UserMenu = dynamic(() => import("./user-menu").then((mod) => mod.UserMenu), {
  ssr: false,
});

const SocialLoginButtons = dynamic(
  () => import("./social-login-buttons").then((mod) => mod.SocialLoginButtons),
  {
    ssr: false,
    loading: () => (
      <div className={styles.formFullWidth} aria-busy="true">
        <div className={styles.buttonSecondary}>Carregando acesso...</div>
      </div>
    ),
  },
);

export function TravelPlannerForm() {
  const router = useRouter();
  const { themeMode, setThemeMode } = useThemeMode();
  const [originCity, setOriginCity] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [tripMode, setTripMode] = useState(LANDING_TRIP_MODES[0].value);
  const [travelStartDate, setTravelStartDate] = useState("");
  const [travelEndDate, setTravelEndDate] = useState("");

  const handleTravelStartDateChange = (value: string) => {
    setTravelStartDate(value);

    if (travelEndDate && value && travelEndDate < value) {
      setTravelEndDate("");
    }
  };

  const handleSearch = () => {
    writeSearchDraft({
      cidadePartida: originCity,
      cidadeDestino: destinationCity,
      tipo: tripMode,
      dataInicio: travelStartDate,
      dataFim: travelEndDate,
    });

    const params = new URLSearchParams({
      cidadePartida: originCity || defaultSearchDraft.cidadePartida,
      cidadeDestino: destinationCity || defaultSearchDraft.cidadeDestino,
    });

    if (tripMode !== "TODOS") {
      params.set("tipo", tripMode);
    }

    if (travelStartDate) {
      params.set("dataInicio", travelStartDate);
    }

    if (travelEndDate) {
      params.set("dataFim", travelEndDate);
    }

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
          <NotificationBell />
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
            options={LANDING_TRIP_MODES}
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
