import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginCard } from "../components/login-card";
import styles from "./login.module.css";

export default async function LoginPage() {
  const session = await auth();

  if (session?.backendAuthError === "BACKEND_AUTH_FAILED") {
    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          <div className={styles.brand}>
            <span className={styles.badge}>GoMigo</span>
            <h1 className={styles.headline}>Sua proxima viagem comeca aqui</h1>
            <p className={styles.description}>
              Nao foi possivel validar sua sessao com o backend. Saia e tente entrar novamente.
            </p>
          </div>
          <LoginCard errorMessage="Falha ao concluir o login com o backend." />
        </div>
      </main>
    );
  }

  if (session) {
    redirect(
      session.backendUserStatus === "INCOMPLETE"
        ? "/complete-profile"
        : "/travel-package/new",
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.brand}>
          <span className={styles.badge}>GoMigo</span>
          <h1 className={styles.headline}>Sua proxima viagem comeca aqui</h1>
          <p className={styles.description}>
            Entre com Google para oferecer um pacote e organizar grupos.
          </p>
        </div>
        <LoginCard />
      </div>
    </main>
  );
}
