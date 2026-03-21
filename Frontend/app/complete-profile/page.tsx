import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppHeaderActions } from "../components/app-header-actions";
import { CompleteProfileForm } from "../components/complete-profile-form";
import styles from "./complete-profile.module.css";

export default async function CompleteProfilePage({
  searchParams,
}: {
  searchParams?: Promise<{ mode?: string }>;
}) {
  const session = await auth();
  const params = searchParams ? await searchParams : undefined;
  const isEditMode = params?.mode === "edit";

  if (!session) {
    redirect("/login");
  }

  if (session.backendAuthError === "BACKEND_AUTH_FAILED") {
    redirect("/login");
  }

  if (session.backendUserStatus === "ACTIVE" && !isEditMode) {
    redirect("/travel-package/new");
  }

  return (
    <main className={`${styles.page} ${isEditMode ? styles.pageEdit : ""}`}>
      <div className={styles.shell}>
        {isEditMode ? (
          <div className={styles.header}>
            <div />
            <AppHeaderActions />
          </div>
        ) : null}
        <section className={styles.panel}>
          <span className={styles.badge}>GoMigo</span>
          <h1 className={styles.title}>
            {isEditMode ? "Editar perfil" : "Complete seu cadastro"}
          </h1>
          <p className={styles.description}>
            {isEditMode
              ? "Atualize seus dados de organizador e mantenha o perfil pronto para novas viagens."
              : "Falta confirmar alguns dados para publicar pacotes de viagem."}
          </p>
          <CompleteProfileForm mode={isEditMode ? "edit" : "complete"} />
        </section>
      </div>
    </main>
  );
}
