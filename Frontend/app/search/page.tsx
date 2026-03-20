"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { BRAZILIAN_TRIP_MODES } from "../data/trip-modes";
import {
  defaultSearchDraft,
  readSearchDraft,
  writeSearchDraft,
  type SearchDraft,
} from "../data/search-storage";
import { CityAutocomplete } from "../components/city-autocomplete";
import { ThemeToggle } from "../components/theme-toggle";
import { TripModeSelect } from "../components/trip-mode-select";
import { UserMenu } from "../components/user-menu";
import styles from "./search.module.css";

const DateRangeField = dynamic(
  () => import("../components/date-range-field").then((mod) => mod.DateRangeField),
  { ssr: false },
);

const PAGE_SIZE = 12;
const SEARCH_MODE_OPTIONS = [
  { value: "TODOS", label: "Todos os formatos" },
  ...BRAZILIAN_TRIP_MODES,
];

type ThemeMode = "dark" | "light";

type SearchResponse = {
  modo: "EXATO" | "INTERSECCAO" | "SEM_RESULTADOS";
  mensagem?: string;
  pacotes: PackageCard[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
};

type PackageCard = {
  id: number;
  titulo: string;
  descricao?: string | null;
  vagas: number;
  valorPorPessoaPrevisto?: number | null;
  dataInicio?: string | null;
  dataFim?: string | null;
  enderecoPartida: {
    cidade: string;
    estado: string;
  };
  enderecoDestino: {
    cidade: string;
    estado: string;
  };
};

export default function SearchPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [originCity, setOriginCity] = useState("");
  const [destinationCity, setDestinationCity] = useState("");
  const [tripMode, setTripMode] = useState("TODOS");
  const [travelStartDate, setTravelStartDate] = useState("");
  const [travelEndDate, setTravelEndDate] = useState("");
  const [submittedFilters, setSubmittedFilters] =
    useState<SearchDraft>(defaultSearchDraft);
  const [results, setResults] = useState<PackageCard[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [searchMode, setSearchMode] = useState<SearchResponse["modo"]>("EXATO");
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = themeMode;
  }, [themeMode]);

  useEffect(() => {
    const draft = readSearchDraft();
    const urlDraft: SearchDraft = {
      cidadePartida: searchParams.get("cidadePartida") ?? defaultSearchDraft.cidadePartida,
      cidadeDestino: searchParams.get("cidadeDestino") ?? defaultSearchDraft.cidadeDestino,
      tipo: searchParams.get("tipo") ?? "TODOS",
      dataInicio: searchParams.get("dataInicio") ?? defaultSearchDraft.dataInicio,
      dataFim: searchParams.get("dataFim") ?? defaultSearchDraft.dataFim,
    };

    const source = draft ?? urlDraft;
    const pageFromUrl = Number(searchParams.get("page") ?? "1");

    setOriginCity(source.cidadePartida);
    setDestinationCity(source.cidadeDestino);
    setTripMode(source.tipo || "TODOS");
    setTravelStartDate(source.dataInicio);
    setTravelEndDate(source.dataFim);
    setSubmittedFilters({
      cidadePartida: source.cidadePartida,
      cidadeDestino: source.cidadeDestino,
      tipo: source.tipo || "TODOS",
      dataInicio: source.dataInicio,
      dataFim: source.dataFim,
    });
    setCurrentPage(Number.isFinite(pageFromUrl) && pageFromUrl > 0 ? pageFromUrl : 1);
    setIsInitialized(true);
  }, [searchParams]);

  const activeFilters = useMemo(
    () => ({
      cidadePartida: originCity,
      cidadeDestino: destinationCity,
      tipo: tripMode,
      dataInicio: travelStartDate,
      dataFim: travelEndDate,
    }),
    [destinationCity, originCity, travelEndDate, travelStartDate, tripMode],
  );

  useEffect(() => {
    if (!isInitialized) {
      return;
    }

    const controller = new AbortController();

    const fetchPackages = async () => {
      setStatus("loading");
      setError(null);

      try {
        const params = new URLSearchParams();

        if (submittedFilters.cidadePartida) {
          params.set(
            "cidadePartida",
            normalizeCityForBackend(submittedFilters.cidadePartida),
          );
        }

        if (submittedFilters.cidadeDestino) {
          params.set(
            "cidadeDestino",
            normalizeCityForBackend(submittedFilters.cidadeDestino),
          );
        }

        if (submittedFilters.tipo && submittedFilters.tipo !== "TODOS") {
          params.set("tipo", submittedFilters.tipo);
        }

        if (submittedFilters.dataInicio) {
          params.set("dataInicio", submittedFilters.dataInicio);
        }

        if (submittedFilters.dataFim) {
          params.set("dataFim", submittedFilters.dataFim);
        }

        params.set("page", String(currentPage));
        params.set("pageSize", String(PAGE_SIZE));

        const response = await fetch(`/api/pacotes/search?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as
            | { message?: string | string[] }
            | null;
          const responseMessage = Array.isArray(data?.message)
            ? data.message.join(", ")
            : data?.message;

          setStatus("error");
          setError(responseMessage ?? "Nao foi possivel carregar os pacotes.");
          return;
        }

        const data = (await response.json()) as SearchResponse;

        setResults(data.pacotes);
        setSearchMode(data.modo);
        setMessage(data.mensagem ?? null);
        setTotalPages(data.pagination.totalPages);
        setTotalResults(data.pagination.total);
        setStatus("ready");
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === "AbortError") {
          return;
        }

        setStatus("error");
        setError("Falha de conexao ao buscar pacotes.");
      }
    };

    writeSearchDraft(submittedFilters);
    void fetchPackages();

    return () => controller.abort();
  }, [currentPage, isInitialized, submittedFilters]);

  const handleTravelStartDateChange = (value: string) => {
    setTravelStartDate(value);

    if (travelEndDate && value && travelEndDate < value) {
      setTravelEndDate("");
    }
  };

  const syncUrl = (filters: SearchDraft, page: number) => {
    const params = new URLSearchParams();

    if (filters.cidadePartida) {
      params.set("cidadePartida", filters.cidadePartida);
    }

    if (filters.cidadeDestino) {
      params.set("cidadeDestino", filters.cidadeDestino);
    }

    if (filters.tipo && filters.tipo !== "TODOS") {
      params.set("tipo", filters.tipo);
    }

    if (filters.dataInicio) {
      params.set("dataInicio", filters.dataInicio);
    }

    if (filters.dataFim) {
      params.set("dataFim", filters.dataFim);
    }

    if (page > 1) {
      params.set("page", String(page));
    }

    router.replace(params.size > 0 ? `${pathname}?${params.toString()}` : pathname);
  };

  const handleSearch = () => {
    writeSearchDraft(activeFilters);
    setSubmittedFilters(activeFilters);
    setCurrentPage(1);
    syncUrl(activeFilters, 1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    syncUrl(submittedFilters, page);
  };

  return (
    <main className={styles.pageShell}>
      <header className={styles.appBar}>
        <div className={styles.brandArea}>
          <span className={styles.brandBadge}>GoMigo</span>
          <p className={styles.brandSubtitle}>Busca de pacotes publicados</p>
        </div>

        <div className={styles.appActions}>
          <Link href="/" className={styles.secondaryButton}>
            Voltar ao inicio
          </Link>
          <ThemeToggle currentTheme={themeMode} onThemeChange={setThemeMode} />
          <UserMenu />
        </div>
      </header>

      <section className={`${styles.surface} ${styles.filterSurface}`}>
        <div className={styles.filterHeader}>
          <div>
            <p className={styles.eyebrow}>Filtros</p>
            <h1 className={styles.title}>Encontre pacotes publicados</h1>
          </div>
        </div>

        <div className={styles.filterGrid}>
          <CityAutocomplete
            label="Cidade de partida"
            value={originCity}
            onChange={setOriginCity}
            placeholder="Ex.: Sao Paulo - SP"
            helperText="Mantemos o valor digitado ou o ultimo pesquisado."
          />

          <CityAutocomplete
            label="Destino principal"
            value={destinationCity}
            onChange={setDestinationCity}
            placeholder="Ex.: Rio de Janeiro - RJ"
            helperText="O backend recebe a versao tratada, a tela preserva o texto original."
          />

          <TripModeSelect
            options={SEARCH_MODE_OPTIONS}
            value={tripMode}
            onChange={setTripMode}
          />

          <DateRangeField
            startDate={travelStartDate}
            endDate={travelEndDate}
            onStartDateChange={handleTravelStartDateChange}
            onEndDateChange={setTravelEndDate}
          />
        </div>

        <div className={styles.filterActions}>
          <button type="button" className={styles.primaryButton} onClick={handleSearch}>
            Buscar pacotes
          </button>
        </div>

        {!travelStartDate && !travelEndDate ? (
          <p className={styles.helperError}>
            Sem datas selecionadas, mostramos todos os pacotes publicados com paginacao.
          </p>
        ) : null}

        {error ? <p className={styles.helperError}>{error}</p> : null}
      </section>

      <section className={`${styles.surface} ${styles.resultsSurface}`}>
        <div className={styles.resultsHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Resultados</h2>
            <p className={styles.sectionSubtitle}>
              {message ??
                (status === "ready"
                  ? `${totalResults} pacote(s) encontrado(s) para os filtros atuais.`
                  : "Ajuste os filtros e acompanhe os pacotes publicados.")}
            </p>
          </div>

          <span className={styles.infoBadge}>
            {searchMode === "INTERSECCAO"
              ? "Datas proximas"
              : searchMode === "SEM_RESULTADOS"
                ? "Sem resultados"
                : `${totalResults} resultados`}
          </span>
        </div>

        {status === "loading" ? (
          <div className={styles.emptyState}>Carregando pacotes publicados...</div>
        ) : null}

        {status === "ready" && results.length === 0 ? (
          <div className={styles.emptyState}>
            Nenhum pacote publicado combina com os filtros atuais.
          </div>
        ) : null}

        {results.length > 0 ? (
          <div className={styles.resultsGrid}>
            {results.map((item) => (
              <article key={item.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <h3 className={styles.cardTitle}>{item.titulo}</h3>
                    <div className={styles.cardMeta}>
                      {item.enderecoPartida.cidade} - {item.enderecoPartida.estado}
                    </div>
                  </div>
                  <span className={styles.statusBadge}>Publicado</span>
                </div>

                <p className={styles.cardRoute}>
                  {item.enderecoPartida.cidade} - {item.enderecoPartida.estado} /{" "}
                  {item.enderecoDestino.cidade} - {item.enderecoDestino.estado}
                </p>

                <div className={styles.cardDetails}>
                  <span>{item.vagas} vagas</span>
                  <span>{formatDateRange(item.dataInicio, item.dataFim)}</span>
                  <span>{formatPrice(item.valorPorPessoaPrevisto)}</span>
                </div>

                {item.descricao ? (
                  <p className={styles.cardDescription}>{item.descricao}</p>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}

        {status === "ready" && totalPages > 1 ? (
          <div className={styles.pagination}>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Anterior
            </button>
            <span className={styles.pageIndicator}>
              Pagina {currentPage} de {totalPages}
            </span>
            <button
              type="button"
              className={styles.secondaryButton}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
            >
              Proxima
            </button>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function normalizeCityForBackend(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDateRange(startDate?: string | null, endDate?: string | null) {
  if (!startDate || !endDate) {
    return "Datas a combinar";
  }

  return `${formatDate(startDate)} ate ${formatDate(endDate)}`;
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("pt-BR").format(date);
}

function formatPrice(value?: number | null) {
  if (typeof value !== "number") {
    return "Preco sob consulta";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(value);
}
