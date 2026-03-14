import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TravelPackageForm } from "../../components/travel-package-form";
import styles from "./new.module.css";

export default async function TravelPackageNewPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <div>
          <h1 className={styles.title}>Criar pacote de viagem</h1>
          <p className={styles.subtitle}>
            Preencha os detalhes do pacote para começar a organizar sua viagem.
          </p>
        </div>

        <section className={styles.panel}>
          <TravelPackageForm />
        </section>
      </div>
    </main>
  );
}
