import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AppHeaderActions } from "../../components/app-header-actions";
import { TravelPackageForm } from "../../components/travel-package-form";
import styles from "./new.module.css";

const backendUrl =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_BACKEND_URL ??
  "http://localhost:3001/api";

export default async function TravelPackageNewPage({
  searchParams,
}: {
  searchParams?: Promise<{ edit?: string }>;
}) {
  const session = await auth();
  const params = searchParams ? await searchParams : undefined;
  const editPackageId = params?.edit ?? null;
  let initialPackage = null;

  if (!session) {
    redirect("/login");
  }

  if (session.backendAuthError === "BACKEND_AUTH_FAILED" || !session.backendAccessToken) {
    redirect("/login");
  }

  if (session.backendUserStatus === "INCOMPLETE") {
    redirect("/complete-profile");
  }

  if (editPackageId) {
    const response = await fetch(`${backendUrl}/pacotes/${editPackageId}/gerenciar`, {
      headers: {
        Authorization: `Bearer ${session.backendAccessToken}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      redirect("/travel-package");
    }

    initialPackage = await response.json();
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div className={styles.header}>
          <div>
          <h1 className={styles.title}>
            {editPackageId ? "Editar pacote de viagem" : "Criar pacote de viagem"}
          </h1>
          <p className={styles.subtitle}>
            {editPackageId
              ? "Atualize os detalhes do seu pacote publicado."
              : "Preencha os detalhes do pacote para comecar a organizar sua viagem."}
          </p>
          </div>
          <AppHeaderActions />
        </div>

        <section className={styles.panel}>
          <TravelPackageForm
            editPackageId={editPackageId}
            initialPackage={initialPackage}
          />
        </section>
      </div>
    </main>
  );
}
