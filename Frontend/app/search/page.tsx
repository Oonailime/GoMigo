"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "./search.module.css";
import { CityAutocomplete } from "../components/city-autocomplete";
import { TripModeSelect } from "../components/trip-mode-select";
import { ThemeToggle } from "../components/theme-toggle";
import { UserMenu } from "../components/user-menu";
import dynamic from "next/dynamic";

const DateRangeField = dynamic(
  () => import("../components/date-range-field").then((mod) => mod.DateRangeField),
  { ssr: false },
);

type ThemeMode = "dark" | "light";

type TripModeValue =
  | "ROTEIRO_COMPLETO"
  | "COMPARTILHADO"
  | "BATE_VOLTA"
  | "APENAS_CARONA"
  | "APENAS_HOSPEDAGEM"
  | "APENAS_GUIA_TURISTICO";

type SearchMode = "EXATO" | "INTERSECCAO" | "SEM_RESULTADOS";

type Pacote = {
  id: number;
  titulo: string;
  descricao?: string | null;
  tipoPacoteViagem: TripModeValue;
  status: string;
  vagas: number;
  valorPorPessoaPrevisto?: number | null;
  dataInicio: string | null;
  dataFim: string | null;
  enderecoPartida?: { cidade: string; estado: string } | null;
  enderecoDestino?: { cidade: string; estado: string } | null;
};

const TRIP_MODE_OPTIONS = [
  { value: "ROTEIRO_COMPLETO", label: "Roteiro completo" },
  { value: "COMPARTILHADO", label: "Compartilhado" },
  { value: "BATE_VOLTA", label: "Bate-volta" },
  { value: "APENAS_CARONA", label: "Apenas carona" },
  { value: "APENAS_HOSPEDAGEM", label: "Apenas hospedagem" },
  { value: "APENAS_GUIA_TURISTICO", label: "Apenas guia turistico" },
] as const;

const FILTER_TABS = [
  { value: "ALL", label: "Tudo" },
  { value: "ROTEIRO_COMPLETO", label: "Roteiro completo" },
  { value: "BATE_VOLTA", label: "Bate-volta" },
  { value: "APENAS_CARONA", label: "Apenas carona" },
  { value: "APENAS_HOSPEDAGEM", label: "Apenas hospedagem" },
] as const;

type FilterTab = (typeof FILTER_TABS)[number]["value"];

const ALL_TYPES: TripModeValue[] = [
  "ROTEIRO_COMPLETO",
  "COMPARTILHADO",
  "BATE_VOLTA",
  "APENAS_CARONA",
  "APENAS_HOSPEDAGEM",
  "APENAS_GUIA_TURISTICO",
];

const TYPE_LABELS: Record<TripModeValue, string> = {
  ROTEIRO_COMPLETO: "Roteiro completo",
  COMPARTILHADO: "Compartilhado",
  BATE_VOLTA: "Bate-volta",
  APENAS_CARONA: "Apenas carona",
  APENAS_HOSPEDAGEM: "Apenas hospedagem",
  APENAS_GUIA_TURISTICO: "Apenas guia turistico",
};

const MODE_LABELS: Record<SearchMode, string> = {
  EXATO: "Resultados no periodo exato",
  INTERSECCAO: "Datas proximas do periodo selecionado",
  SEM_RESULTADOS: "Sem resultados",
};

const normalizeCity = (value: string) => {
  const raw = value.split(" - ")[0]?.trim() ?? "";
  return raw.normalize("NFD").replace(/\p{Diacritic}/gu, "");
};

export default function SearchPage() {
  const searchParams = useSearchParams();
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [originCity, setOriginCity] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [tripMode, setTripMode] = useState<TripModeValue>("ROTEIRO_COMPLETO");
  const [travelStartDate, setTravelStartDate] = useState("");
  const [travelEndDate, setTravelEndDate] = useState("");
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [results, setResults] = useState<Pacote[]>([]);
  const [searchMode, setSearchMode] = useState<SearchMode | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [didAutoSearch, setDidAutoSearch] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
  }, [themeMode]);

  useEffect(() => {
    if (!searchParams) return;

    const cidadePartida = searchParams.get("cidadePartida") ?? "";
    const cidadeDestino = searchParams.get("cidadeDestino") ?? "";
    const tipo = searchParams.get("tipo") as TripModeValue | null;
    const dataInicio = searchParams.get("dataInicio") ?? "";
    const dataFim = searchParams.get("dataFim") ?? "";

    if (cidadePartida) setOriginCity(cidadePartida);
    if (cidadeDestino) setDestinationCity(cidadeDestino);
    if (tipo && ALL_TYPES.includes(tipo)) {
      setTripMode(tipo);
      setActiveTab(
        tipo === "ROTEIRO_COMPLETO" ||
          tipo === "BATE_VOLTA" ||
          tipo === "APENAS_CARONA" ||
          tipo === "APENAS_HOSPEDAGEM"
          ? (tipo as FilterTab)
          : "ALL",
      );
    }
    if (dataInicio) setTravelStartDate(dataInicio);
    if (dataFim) setTravelEndDate(dataFim);
  }, [searchParams]);

  useEffect(() => {
    if (didAutoSearch) return;
    if (originCity && destinationCity && travelStartDate && travelEndDate) {
      setDidAutoSearch(true);
      void handleSearch();
    }
  }, [originCity, destinationCity, travelStartDate, travelEndDate, didAutoSearch]);

  useEffect(() => {
    if (activeTab !== "ALL") {
      setTripMode(activeTab as TripModeValue);
    }
  }, [activeTab]);

  const handleTravelStartDateChange = (value: string) => {
    setTravelStartDate(value);

    if (travelEndDate && value && travelEndDate < value) {
      setTravelEndDate("");
    }
  };

  const canSearch = useMemo(() => {
    return originCity && destinationCity && travelStartDate && travelEndDate;
  }, [originCity, destinationCity, travelStartDate, travelEndDate]);

  const formatDate = (value?: string | null) => {
    if (!value) return "";
    const date = new Date(value);
    return date.toLocaleDateString("pt-BR");
  };

  const buildQuery = (tipo: TripModeValue) => {
    const params = new URLSearchParams({
      cidadePartida: normalizeCity(originCity),
      cidadeDestino: normalizeCity(destinationCity),
      tipo,
      dataInicio: travelStartDate,
      dataFim: travelEndDate,
    });
    return params.toString();
  };

  const mergeById = (items: Pacote[]) => {
    const map = new Map<number, Pacote>();
    items.forEach((item) => map.set(item.id, item));
    return Array.from(map.values());
  };

  const handleSearch = async () => {
    if (!canSearch) {
      setError("Preencha cidade de partida, destino e periodo.");
      return;
    }

    setError(null);
    setIsLoading(true);
    setResults([]);
    setMessage(null);
    setSearchMode(null);

    const typesToSearch = activeTab === "ALL" ? ALL_TYPES : [activeTab as TripModeValue];
    const collected: Pacote[] = [];
    let finalMode: SearchMode | null = null;
    let fallbackMessage: string | null = null;

    try {
      for (const tipo of typesToSearch) {
        const response = await fetch(`/api/pacotes/search?${buildQuery(tipo)}`);
        if (!response.ok) {
          throw new Error("Falha ao buscar pacotes.");
        }
        const payload = await response.json();
        const modo = payload?.modo as SearchMode | undefined;
        if (modo && modo !== "SEM_RESULTADOS") {
          finalMode = finalMode === "EXATO" ? "EXATO" : modo;
        }
        if (payload?.mensagem && !fallbackMessage) {
          fallbackMessage = payload.mensagem;
        }
        if (Array.isArray(payload?.pacotes)) {
          collected.push(...payload.pacotes);
        }
      }

      const unique = mergeById(collected);
      if (unique.length === 0) {
        setSearchMode("SEM_RESULTADOS");
        setMessage("Nao ha pacotes disponiveis para este filtro. Considere criar um novo pacote.");
      } else {
        setSearchMode(finalMode ?? "INTERSECCAO");
        setMessage(fallbackMessage);
      }
      setResults(unique);
    } catch (err) {
      setError("Nao foi possivel carregar os pacotes agora.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.pageShell}>
      <header className={styles.appBar}>
        <div className={styles.brandArea}>
          <span className={styles.brandBadge}>GoMigo</span>
          <p className={styles.brandSubtitle}>Busca de pacotes</p>
        </div>

        <div className={styles.appActions}>
          <ThemeToggle currentTheme={themeMode} onThemeChange={setThemeMode} />
          <Link href="/travel-package/new" className={styles.primaryButton}>
            Oferecer pacote de viagem
          </Link>
          <UserMenu />
        </div>
      </header>

      <section className={`${styles.surface} ${styles.filterSurface}`}>
        <div className={styles.filterHeader}>
          <div>
            <p className={styles.eyebrow}>Filtro principal</p>
            <h1 className={styles.title}>Encontre sua proxima viagem</h1>
          </div>
        </div>

        <div className={styles.filterGrid}>
          <CityAutocomplete
            label="Cidade de partida"
            value={originCity}
            onChange={setOriginCity}
            placeholder="Ex.: Sao Paulo"
            helperText="Ponto inicial da viagem."
          />

          <CityAutocomplete
            label="Destino principal"
            value={destinationCity}
            onChange={setDestinationCity}
            placeholder="Ex.: Rio de Janeiro"
            helperText="Busque municipios do Brasil."
          />

          <TripModeSelect
            options={TRIP_MODE_OPTIONS}
            value={tripMode}
            onChange={(value) => setTripMode(value as TripModeValue)}
          />

          <DateRangeField
            startDate={travelStartDate}
            endDate={travelEndDate}
            onStartDateChange={handleTravelStartDateChange}
            onEndDateChange={setTravelEndDate}
          />
        </div>

        <div className={styles.filterActions}>
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? "Buscando..." : "Buscar pacotes"}
          </button>
        </div>

        {error ? <p className={styles.helperError}>{error}</p> : null}
      </section>

      <section className={`${styles.surface} ${styles.resultsSurface}`}>
        <div className={styles.tabRow}>
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              className={`${styles.tabButton} ${
                activeTab === tab.value ? styles.tabButtonActive : ""
              }`}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className={styles.resultsHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Pacotes encontrados</h2>
            <p className={styles.sectionSubtitle}>
              {searchMode
                ? MODE_LABELS[searchMode]
                : "Aplique o filtro para ver resultados."}
            </p>
          </div>
          {message ? <span className={styles.infoBadge}>{message}</span> : null}
        </div>

        <div className={styles.resultsGrid}>
          {results.length === 0 ? (
            <div className={styles.emptyState}>
              <p>Nenhum pacote para mostrar.</p>
              <span>Use os filtros acima para iniciar a busca.</span>
            </div>
          ) : (
            results.map((pacote) => (
              <article key={pacote.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.cardTitle}>{pacote.titulo}</h3>
                    <span className={styles.cardMeta}>
                      {TYPE_LABELS[pacote.tipoPacoteViagem]}
                    </span>
                  </div>
                  <span className={styles.statusBadge}>{pacote.status}</span>
                </div>
                <p className={styles.cardRoute}>
                  {pacote.enderecoPartida?.cidade ?? "Cidade de partida"} ?{" "}
                  {pacote.enderecoDestino?.cidade ?? "Destino"}
                </p>
                <div className={styles.cardDetails}>
                  <span>
                    {formatDate(pacote.dataInicio)} - {formatDate(pacote.dataFim)}
                  </span>
                  <span>{pacote.vagas} vagas</span>
                  {pacote.valorPorPessoaPrevisto ? (
                    <span>R$ {pacote.valorPorPessoaPrevisto}</span>
                  ) : null}
                </div>
                {pacote.descricao ? (
                  <p className={styles.cardDescription}>{pacote.descricao}</p>
                ) : null}
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  );
}
