"use client";

type ErrorPageProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        padding: "24px",
        background: "#07111f",
        color: "#f4f7fb",
        fontFamily: "var(--font-body), sans-serif",
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
          Algo saiu do esperado
        </p>
        <h1 style={{ margin: "12px 0 0", fontSize: "2rem" }}>
          Nao foi possivel carregar esta tela.
        </h1>
        <p style={{ margin: "16px 0 0", color: "rgba(228, 236, 248, 0.76)" }}>
          {error.message || "Tente novamente."}
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
          Tentar novamente
        </button>
      </section>
    </main>
  );
}
