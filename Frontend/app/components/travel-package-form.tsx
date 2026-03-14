"use client";

import { useState, type ChangeEvent } from "react";
import styles from "./travel-package-form.module.css";

type TravelPackageFormState = {
  title: string;
  summary: string;
  origin: string;
  destination: string;
  startDate: string;
  endDate: string;
  seats: string;
  price: string;
  notes: string;
};

const initialState: TravelPackageFormState = {
  title: "",
  summary: "",
  origin: "",
  destination: "",
  startDate: "",
  endDate: "",
  seats: "",
  price: "",
  notes: "",
};

export function TravelPackageForm() {
  const [formState, setFormState] = useState<TravelPackageFormState>(initialState);

  const updateField =
    (field: keyof TravelPackageFormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormState((current) => ({ ...current, [field]: event.target.value }));
    };

  return (
    <form
      className={styles.form}
      onSubmit={(event) => event.preventDefault()}
    >
      <div className={styles.grid}>
        <label className={styles.field}>
          <span className={styles.label}>Nome do pacote</span>
          <input
            className={styles.input}
            type="text"
            placeholder="Ex.: Serra do Cipo com amigos"
            value={formState.title}
            onChange={updateField("title")}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Resumo</span>
          <input
            className={styles.input}
            type="text"
            placeholder="Caronas, hospedagem e roteiro em 4 dias"
            value={formState.summary}
            onChange={updateField("summary")}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Origem</span>
          <input
            className={styles.input}
            type="text"
            placeholder="Ex.: Sao Paulo"
            value={formState.origin}
            onChange={updateField("origin")}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Destino</span>
          <input
            className={styles.input}
            type="text"
            placeholder="Ex.: Belo Horizonte"
            value={formState.destination}
            onChange={updateField("destination")}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Ida</span>
          <input
            className={styles.input}
            type="date"
            value={formState.startDate}
            onChange={updateField("startDate")}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Volta</span>
          <input
            className={styles.input}
            type="date"
            value={formState.endDate}
            onChange={updateField("endDate")}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Vagas</span>
          <input
            className={styles.input}
            type="number"
            min={1}
            placeholder="Ex.: 12"
            value={formState.seats}
            onChange={updateField("seats")}
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>Preco por pessoa (R$)</span>
          <input
            className={styles.input}
            type="number"
            min={0}
            step="0.01"
            placeholder="Ex.: 890"
            value={formState.price}
            onChange={updateField("price")}
          />
        </label>
      </div>

      <label className={styles.field}>
        <span className={styles.label}>Observacoes</span>
        <textarea
          className={styles.textarea}
          rows={4}
          placeholder="Inclua detalhes de hospedagem, roteiro ou regras do grupo."
          value={formState.notes}
          onChange={updateField("notes")}
        />
      </label>

      <div className={styles.actions}>
        <button type="button" className={styles.secondaryButton}>
          Salvar rascunho
        </button>
        <button type="submit" className={styles.primaryButton}>
          Publicar pacote
        </button>
      </div>
    </form>
  );
}
