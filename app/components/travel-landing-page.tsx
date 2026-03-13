import styles from "../page.module.css";
import { TravelPlannerForm } from "./travel-planner-form";

export function TravelLandingPage() {
  return (
    <main className={styles.pageShell}>
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
        <TravelPlannerForm />
      </section>
    </main>
  );
}
