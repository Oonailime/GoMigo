import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CompleteProfileForm } from "../components/complete-profile-form";
import styles from "./complete-profile.module.css";

export default async function CompleteProfilePage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.backendUserStatus === "ACTIVE") {
    redirect("/travel-package/new");
  }

  return (
    <main className={styles.page}>
      <section className={styles.panel}>
        <span className={styles.badge}>GoMigo</span>
        <h1 className={styles.title}>Complete seu cadastro</h1>
        <p className={styles.description}>
          Falta confirmar alguns dados para publicar pacotes de viagem.
        </p>
        <CompleteProfileForm />
      </section>
    </main>
  );
}
