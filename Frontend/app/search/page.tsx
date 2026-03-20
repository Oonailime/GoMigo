"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { BRAZILIAN_TRIP_MODES } from "../data/trip-modes";
import {
  defaultSearchDraft,
  readSearchDraft,
  writeSearchDraft,
  type SearchDraft,
} from "../data/search-storage";
import { CityAutocomplete } from "../components/city-autocomplete";
import { NotificationBell } from "../components/notification-bell";
import { ThemeToggle } from "../components/theme-toggle";
import { TripModeSelect } from "../components/trip-mode-select";
import { useThemeMode } from "../components/use-theme-mode";
import { UserMenu } from "../components/user-menu";
import styles from "./search.module.css";

const DateRangeField = dynamic(
  () => import("../components/date-range-field").then((mod) => mod.DateRangeField),
  { ssr: false },
);
const backendUrl =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001/api";

const PAGE_SIZE = 12;
const SEARCH_MODE_OPTIONS = [
  { value: "TODOS", label: "Todos os formatos" },
  ...BRAZILIAN_TRIP_MODES,
];

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
  idOrganizador: number;
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
  const { data: session } = useSession();
  const { themeMode, setThemeMode } = useThemeMode();
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
  const [currentUserId, setCurrentUserId] = useState<number | null>(
    session?.backendUserId ?? null,
  );
  const [myRequests, setMyRequests] = useState<Record<number, string>>({});
  const [requestMessages, setRequestMessages] = useState<Record<number, string>>({});
  const [requestFeedback, setRequestFeedback] = useState<Record<number, string>>({});
  const [requestVisualStatus, setRequestVisualStatus] = useState<
    Record<number, "idle" | "sending" | "success">
  >({});

  useEffect(() => {
    if (typeof session?.backendUserId === "number") {
      setCurrentUserId(session.backendUserId);
      return;
    }

    if (!session?.backendAccessToken) {
      setCurrentUserId(null);
      return;
    }

    let active = true;

    const loadCurrentUser = async () => {
      try {
        const response = await fetch(`${backendUrl}/auth/me`, {
          headers: {
            Authorization: `Bearer ${session.backendAccessToken}`,
          },
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { id: number };

        if (active) {
          setCurrentUserId(data.id);
        }
      } catch {}
    };

    void loadCurrentUser();

    return () => {
      active = false;
    };
  }, [session?.backendAccessToken, session?.backendUserId]);

  useEffect(() => {
    if (!session?.backendAccessToken) {
      setMyRequests({});
      return;
    }

    let active = true;

    const loadRequests = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/solicitacoes/minhas", {
          headers: {
            Authorization: `Bearer ${session.backendAccessToken}`,
          },
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as Array<{
          idPacoteViagem: number;
          statusSolicitacao: string;
        }>;

        if (!active) {
          return;
        }

        const latestRequestByPackage = data.reduce<Record<number, string>>(
          (accumulator, item) => {
            if (!(item.idPacoteViagem in accumulator)) {
              accumulator[item.idPacoteViagem] = item.statusSolicitacao;
            }

            return accumulator;
          },
          {},
        );

        setMyRequests(latestRequestByPackage);
      } catch {}
    };

    void loadRequests();

    return () => {
      active = false;
    };
  }, [session?.backendAccessToken]);

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

  const handleRequestParticipation = async (packageId: number) => {
    if (!session?.backendAccessToken) {
      setRequestFeedback((current) => ({
        ...current,
        [packageId]: "Entre com sua conta para solicitar participacao.",
      }));
      return;
    }

    setRequestVisualStatus((current) => ({ ...current, [packageId]: "sending" }));
    setRequestFeedback((current) => ({ ...current, [packageId]: "" }));

    try {
      const response = await fetch(`${backendUrl}/solicitacoes/pacote/${packageId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.backendAccessToken}`,
        },
        body: JSON.stringify({
          mensagemSolicitacao: requestMessages[packageId]?.trim() || undefined,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { message?: string | string[] }
        | null;

      if (!response.ok) {
        const message = Array.isArray(data?.message)
          ? data.message.join(", ")
          : data?.message;
        setRequestFeedback((current) => ({
          ...current,
          [packageId]: message ?? "Nao foi possivel enviar a solicitacao.",
        }));
        return;
      }

      setMyRequests((current) => ({ ...current, [packageId]: "PENDENTE" }));
      setRequestVisualStatus((current) => ({ ...current, [packageId]: "success" }));
      setRequestFeedback((current) => ({
        ...current,
        [packageId]: "Solicitacao enviada ao organizador.",
      }));

      window.setTimeout(() => {
        setRequestVisualStatus((current) => ({ ...current, [packageId]: "idle" }));
      }, 1100);
    } catch {
      setRequestFeedback((current) => ({
        ...current,
        [packageId]: "Falha de conexao ao enviar a solicitacao.",
      }));
      setRequestVisualStatus((current) => ({ ...current, [packageId]: "idle" }));
    }
  };

  const handleOpenTripDetails = (packageId: number) => {
    router.push(`/my-trips/${packageId}`);
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
          <NotificationBell />
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

                {currentUserId === item.idOrganizador ? (
                  <div className={styles.cardActions}>
                    <div className={`${styles.messageBox} ${styles.manageNote}`}>
                      Este pacote foi publicado por voce. Use este atalho para revisar
                      participantes, editar detalhes e acompanhar as solicitacoes.
                    </div>
                    <Link
                      href={`/travel-package/new?edit=${item.id}`}
                      className={`${styles.primaryButton} ${styles.manageButton}`}
                    >
                      Gerenciar pacote
                    </Link>
                  </div>
                ) : (
                  <div className={styles.cardActions}>
                    <textarea
                      className={styles.messageBox}
                      rows={2}
                      placeholder="Mensagem opcional para o organizador"
                      value={requestMessages[item.id] ?? ""}
                      onChange={(event) =>
                        setRequestMessages((current) => ({
                          ...current,
                          [item.id]: event.target.value,
                        }))
                      }
                    />
                    <button
                      type="button"
                      className={`${styles.primaryButton} ${
                        requestVisualStatus[item.id] === "success"
                          ? styles.primaryButtonSuccess
                          : ""
                      } ${
                        myRequests[item.id] === "PENDENTE"
                          ? styles.primaryButtonPending
                          : ""
                      } ${
                        myRequests[item.id] === "ACEITA"
                          ? styles.primaryButtonParticipating
                          : ""
                      }`}
                      disabled={
                        requestVisualStatus[item.id] === "sending" ||
                        requestVisualStatus[item.id] === "success" ||
                        myRequests[item.id] === "PENDENTE"
                      }
                      onClick={() =>
                        myRequests[item.id] === "ACEITA"
                          ? handleOpenTripDetails(item.id)
                          : void handleRequestParticipation(item.id)
                      }
                    >
                      {requestVisualStatus[item.id] === "sending"
                        ? "Enviando..."
                        : requestVisualStatus[item.id] === "success"
                          ? "Check enviado"
                        : myRequests[item.id] === "PENDENTE"
                        ? "Solicitacao pendente"
                        : myRequests[item.id] === "ACEITA"
                          ? "Voce ja participa"
                          : "Solicitar entrada"}
                    </button>
                    {requestFeedback[item.id] ? (
                      <p className={styles.requestFeedback}>{requestFeedback[item.id]}</p>
                    ) : null}
                  </div>
                )}
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
  const normalizedValue = value.slice(0, 10);
  const [year, month, day] = normalizedValue.split("-");

  if (!year || !month || !day) {
    return value;
  }

  return `${day}/${month}/${year}`;
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
