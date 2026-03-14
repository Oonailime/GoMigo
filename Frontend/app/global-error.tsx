"use client";

type GlobalErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalErrorPage({
  error,
  reset,
}: GlobalErrorPageProps) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "24px",
          background: "#07111f",
          color: "#f4f7fb",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <section
          style={{
            width: "100%",
            maxWidth: "560px",
            border: "1px solid rgba(154, 181, 214, 0.18)",
            borderRadius: "24px",
            padding: "32px",
            background: "rgba(12, 24, 40, 0.84)",
          }}
        >
          <p style={{ margin: 0, color: "rgba(228, 236, 248, 0.76)" }}>
            Erro global
          </p>
          <h1 style={{ margin: "12px 0 0", fontSize: "2rem" }}>
            A aplicacao encontrou um erro inesperado.
          </h1>
          <p style={{ margin: "16px 0 0", color: "rgba(228, 236, 248, 0.76)" }}>
            {error.message || "Recarregue a pagina para continuar."}
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "24px",
              border: 0,
              borderRadius: "14px",
              padding: "14px 18px",
              cursor: "pointer",
              background: "#4ec7b0",
              color: "#04131b",
              font: "inherit",
            }}
          >
            Tentar recuperar
          </button>
        </section>
      </body>
    </html>
  );
}
