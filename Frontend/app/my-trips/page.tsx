import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MyTripsHeaderActions } from "../components/my-trips-header-actions";
import { MyTripsPanel } from "../components/my-trips-panel";
import styles from "./my-trips.module.css";

export default async function MyTripsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.backendAuthError === "BACKEND_AUTH_FAILED" || !session.backendAccessToken) {
    redirect("/login");
  }

  if (session.backendUserStatus === "INCOMPLETE") {
    redirect("/complete-profile");
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <span className={styles.badge}>GoMigo</span>
            <h1 className={styles.title}>Minhas viagens</h1>
            <p className={styles.subtitle}>
              Acompanhe os pacotes que voce organiza e as viagens das quais participa.
            </p>
          </div>
          <MyTripsHeaderActions />
        </header>

        <MyTripsPanel />
      </div>
    </main>
  );
}
