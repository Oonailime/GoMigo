import styles from "../page.module.css";

type DateRangeFieldProps = {
  startDate: string;
  endDate: string;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
};

export function DateRangeField({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangeFieldProps) {
  return (
    <div className={styles.fieldGroup}>
      <span className={styles.fieldLabel}>Periodo da viagem</span>
      <div className={styles.dateRangeShell}>
        <label className={styles.dateRangeSlot}>
          <span className={styles.dateCardLabel}>Ida</span>
          <input
            className={styles.dateInput}
            type="date"
            value={startDate}
            onChange={(event) => onStartDateChange(event.target.value)}
          />
        </label>
        <span className={styles.dateRangeDivider} aria-hidden="true" />
        <label className={styles.dateRangeSlot}>
          <span className={styles.dateCardLabel}>Volta</span>
          <input
            className={styles.dateInput}
            type="date"
            min={startDate || undefined}
            value={endDate}
            onChange={(event) => onEndDateChange(event.target.value)}
          />
        </label>
      </div>
      <span className={styles.fieldHint}>
        Defina a janela completa da viagem, nao apenas o dia de partida.
      </span>
    </div>
  );
}
