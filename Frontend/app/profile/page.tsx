import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppHeaderActions } from "../components/app-header-actions";
import { ProfileClientPage } from "../components/profile-client-page";
import styles from "./profile.module.css";

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.backendAuthError === "BACKEND_AUTH_FAILED" || !session.backendAccessToken) {
    redirect("/login");
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <span className={styles.badge}>GoMigo</span>
            <h1 className={styles.title}>Meu perfil</h1>
            <p className={styles.subtitle}>
              Informacoes publicas e preferencias pessoais para suas proximas viagens.
            </p>
          </div>
          <AppHeaderActions />
        </header>

        <ProfileClientPage />
      </div>
    </main>
  );
}
