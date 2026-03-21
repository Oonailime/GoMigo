import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppHeaderActions } from "../../components/app-header-actions";
import { ProfileDetailsForm } from "../../components/profile-details-form";
import styles from "../../complete-profile/complete-profile.module.css";

export default async function EditProfileDetailsPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  if (session.backendUserStatus === "INCOMPLETE") {
    redirect("/complete-profile?mode=edit");
  }

  return (
    <main className={`${styles.page} ${styles.pageEdit}`}>
      <div className={styles.shell}>
        <div className={styles.header}>
          <div />
          <AppHeaderActions />
        </div>

        <section className={styles.panel}>
          <span className={styles.badge}>GoMigo</span>
          <h1 className={styles.title}>Editar perfil</h1>
          <p className={styles.description}>
            Complete seu perfil publico com personalidade, experiencia de viagem e atividades que gosta de fazer.
          </p>
          <ProfileDetailsForm />
        </section>
      </div>
    </main>
  );
}
