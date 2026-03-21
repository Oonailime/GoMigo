import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppHeaderActions } from "../components/app-header-actions";
import { MyPackagesPanel } from "../components/my-packages-panel";
import styles from "./published.module.css";

export default async function TravelPackageManagementPage() {
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
            <h1 className={styles.title}>Pacotes publicados</h1>
            <p className={styles.subtitle}>
              Gerencie seus pacotes publicados e acompanhe as solicitacoes de participacao.
            </p>
          </div>
          <AppHeaderActions />
        </header>

        <MyPackagesPanel />
      </div>
    </main>
  );
}
