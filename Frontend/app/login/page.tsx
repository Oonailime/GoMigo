import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { LoginCard } from "../components/login-card";
import styles from "./login.module.css";

export default async function LoginPage() {
  const session = await auth();

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
