"use client";

import { useState } from "react";
import styles from "../page.module.css";
import { BRAZILIAN_TRIP_MODES } from "../data/trip-modes";
import { CityAutocomplete } from "./city-autocomplete";
import { DateRangeField } from "./date-range-field";
import { SocialLoginButtons } from "./social-login-buttons";
import { ThemeToggle } from "./theme-toggle";
import { TripModeSelect } from "./trip-mode-select";

type ThemeMode = "dark" | "light";

export function TravelLandingPage() {
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [originCity, setOriginCity] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [tripMode, setTripMode] = useState(BRAZILIAN_TRIP_MODES[0].value);
  const [travelStartDate, setTravelStartDate] = useState("");
  const [travelEndDate, setTravelEndDate] = useState("");

  const handleTravelStartDateChange = (value: string) => {
    setTravelStartDate(value);

    if (travelEndDate && value && travelEndDate < value) {
      setTravelEndDate("");
    }
  };

  return (
    <main className={styles.pageShell} data-theme={themeMode}>
      <section className={styles.surface}>
        <div className={styles.heroSection}>
          <div className={styles.heroBrand}>
            <span className={styles.brandBadge}>GoMigo</span>
            <p className={styles.eyebrow}>Organizacao de viagens em grupo</p>
          </div>

          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Planeje rotas, hospedagem e passeios em um so lugar.
            </h1>
            <p className={styles.heroDescription}>
              Um SaaS para viagens compartilhadas, inspirado na logica de
              caronas, mas ampliado para conectar pessoas, acomodacoes e
              experiencias turisticas com menos friccao.
            </p>
          </div>

          <div className={styles.heroInsights}>
            <div className={styles.statsGrid}>
              <article className={styles.statCard}>
                <strong className={styles.statValue}>+120</strong>
                <span className={styles.statLabel}>
                  rotas e caronas organizadas por semana
                </span>
              </article>
              <article className={styles.statCard}>
                <strong className={styles.statValue}>48h</strong>
                <span className={styles.statLabel}>
                  para fechar hospedagem e agenda do grupo
                </span>
              </article>
              <article className={styles.statCard}>
                <strong className={styles.statValue}>1 painel</strong>
                <span className={styles.statLabel}>
                  para motoristas, viajantes e parceiros locais
                </span>
              </article>
            </div>

            <div className={styles.featureGrid} id="demo">
              <article className={styles.featureCard}>
                <strong className={styles.featureTitle}>Caronas</strong>
                <span className={styles.featureText}>
                  Combine assentos, pontos de encontro e custos da viagem.
                </span>
              </article>
              <article className={styles.featureCard}>
                <strong className={styles.featureTitle}>Hospedagem</strong>
                <span className={styles.featureText}>
                  Compare opcoes, distribua quartos e acompanhe reservas.
                </span>
              </article>
              <article className={styles.featureCard}>
                <strong className={styles.featureTitle}>Eventos</strong>
                <span className={styles.featureText}>
                  Monte roteiros com passeios, guias e experiencias locais.
                </span>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.surface}>
        <div className={styles.panelSection}>
          <div className={styles.panelHeader}>
            <div>
              <p className={styles.eyebrow}>Acesso rapido</p>
              <h2 className={styles.panelTitle}>Comece sua proxima viagem</h2>
            </div>
            <ThemeToggle currentTheme={themeMode} onThemeChange={setThemeMode} />
          </div>

          <form
            className={styles.travelForm}
            onSubmit={(event) => event.preventDefault()}
          >
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
            >
              Buscar opcoes em breve
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
      </section>
    </main>
  );
}
