"use client";

import { useMemo, useRef, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import fieldStyles from "../page.module.css";
import styles from "./date-range-field.module.css";
import { useDismissibleLayer } from "./use-dismissible-layer";

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
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const travelDays = getTravelDays(startDate, endDate);
  const selectedRange = useMemo<DateRange | undefined>(() => {
    if (!startDate) {
      return undefined;
    }

    return {
      from: parseDateValue(startDate),
      to: endDate ? parseDateValue(endDate) : undefined,
    };
  }, [endDate, startDate]);

  useDismissibleLayer({
    isOpen: isCalendarOpen,
    containerRef,
    onDismiss: () => setIsCalendarOpen(false),
  });

  const handleSelect = (range: DateRange | undefined) => {
    onStartDateChange(range?.from ? toDateInputValue(range.from) : "");
    onEndDateChange(range?.to ? toDateInputValue(range.to) : "");
  };

  return (
    <div className={fieldStyles.fieldGroup}>
      <span className={fieldStyles.fieldLabel}>Periodo da viagem</span>
      <div className={fieldStyles.inputShell} ref={containerRef}>
        <button
          type="button"
          className={styles.trigger}
          aria-haspopup="dialog"
          aria-expanded={isCalendarOpen}
          onClick={() => setIsCalendarOpen((currentValue) => !currentValue)}
        >
          <div className={styles.summary}>
            <div className={styles.summaryBlock}>
              <span className={fieldStyles.dateCardLabel}>Ida</span>
              <span className={styles.displayValue}>
                {formatDateLabel(startDate, "Ida")}
              </span>
            </div>
            <span className={styles.arrow} aria-hidden="true">
              /
            </span>
            <div className={styles.summaryBlock}>
              <span className={fieldStyles.dateCardLabel}>Volta</span>
              <span className={styles.displayValue}>
                {formatDateLabel(endDate, "Volta")}
              </span>
            </div>
          </div>
          <span className={styles.durationBadge}>
            {travelDays ? `${travelDays} dias` : "Selecionar"}
          </span>
        </button>

        {isCalendarOpen ? (
          <div className={styles.panel} role="dialog" aria-label="Selecionar periodo">
            <div className={styles.header}>
              <div>
                <span className={fieldStyles.dateCardLabel}>Selecione o periodo</span>
                <p className={styles.title}>Ida e volta</p>
              </div>
              <span className={styles.durationBadge}>
                {travelDays ? `${travelDays} dias de viagem` : "Sem datas"}
              </span>
            </div>

            <DayPicker
              mode="range"
              numberOfMonths={2}
              selected={selectedRange}
              defaultMonth={selectedRange?.from ?? new Date()}
              onSelect={handleSelect}
              weekStartsOn={0}
              showOutsideDays
              className={styles.calendar}
              components={{
                Chevron: ({ orientation }) => (
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className={styles.calendarChevron}
                  >
                    {orientation === "left" ? (
                      <path d="M14 6 8 12l6 6" />
                    ) : (
                      <path d="m10 6 6 6-6 6" />
                    )}
                  </svg>
                ),
              }}
              classNames={{
                months: styles.calendarMonths,
                month: styles.calendarMonth,
                month_caption: styles.calendarMonthCaption,
                caption_label: styles.calendarCaptionLabel,
                nav: styles.calendarNav,
                button_previous: styles.calendarNavButton,
                button_next: styles.calendarNavButton,
                weekdays: styles.calendarWeekdays,
                weekday: styles.calendarWeekday,
                week: styles.calendarWeek,
                day: styles.calendarDay,
                day_button: styles.calendarDayButton,
                selected: styles.calendarSelected,
                range_start: styles.calendarRangeStart,
                range_middle: styles.calendarRangeMiddle,
                range_end: styles.calendarRangeEnd,
                outside: styles.calendarOutside,
                today: styles.calendarToday,
                disabled: styles.calendarDisabled,
              }}
              formatters={{
                formatCaption: (date) =>
                  new Intl.DateTimeFormat("pt-BR", {
                    month: "long",
                    year: "numeric",
                  }).format(date),
                formatWeekdayName: (date) =>
                  new Intl.DateTimeFormat("pt-BR", {
                    weekday: "short",
                  })
                    .format(date)
                    .replace(".", ""),
              }}
            />

            <div className={styles.footer}>
              <span className={fieldStyles.fieldHint}>
                Escolha ida e volta no mesmo calendario.
              </span>
              <button
                type="button"
                className={styles.closeButton}
                onClick={() => setIsCalendarOpen(false)}
              >
                Aplicar
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function formatDateLabel(value: string, fallback: string) {
  if (!value) {
    return fallback;
  }

  const [year, month, day] = value.split("-");

  if (!year || !month || !day) {
    return fallback;
  }

  return `${day}/${month}/${year}`;
}

function parseDateValue(value: string) {
  return new Date(`${value}T12:00:00`);
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getTravelDays(startDate: string, endDate: string) {
  if (!startDate || !endDate) {
    return 0;
  }

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const differenceInMs = end.getTime() - start.getTime();

  if (Number.isNaN(differenceInMs) || differenceInMs < 0) {
    return 0;
  }

  return Math.floor(differenceInMs / (1000 * 60 * 60 * 24)) + 1;
}
