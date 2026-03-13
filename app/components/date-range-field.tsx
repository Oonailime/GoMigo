"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Chevron, DayPicker, type DateRange } from "react-day-picker";
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

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const handleSelect = (range: DateRange | undefined) => {
    onStartDateChange(range?.from ? toDateInputValue(range.from) : "");
    onEndDateChange(range?.to ? toDateInputValue(range.to) : "");
  };

  return (
    <div className={styles.fieldGroup}>
      <span className={styles.fieldLabel}>Periodo da viagem</span>
      <div className={styles.inputShell} ref={containerRef}>
        <button
          type="button"
          className={styles.dateRangeTrigger}
          onClick={() => setIsCalendarOpen((currentValue) => !currentValue)}
        >
          <div className={styles.dateRangeSummary}>
            <div className={styles.dateSummaryBlock}>
              <span className={styles.dateCardLabel}>Ida</span>
              <span className={styles.dateDisplayValue}>
                {formatDateLabel(startDate, "Ida")}
              </span>
            </div>
            <span className={styles.dateRangeArrow} aria-hidden="true">
              /
            </span>
            <div className={styles.dateSummaryBlock}>
              <span className={styles.dateCardLabel}>Volta</span>
              <span className={styles.dateDisplayValue}>
                {formatDateLabel(endDate, "Volta")}
              </span>
            </div>
          </div>
          <span className={styles.dateDurationBadge}>
            {travelDays ? `${travelDays} dias` : "Selecionar"}
          </span>
        </button>

        {isCalendarOpen ? (
          <div className={styles.datePickerPanel}>
            <div className={styles.datePickerHeader}>
              <div>
                <span className={styles.dateCardLabel}>Selecione o periodo</span>
                <p className={styles.datePickerTitle}>Ida e volta</p>
              </div>
              <span className={styles.dateDurationBadge}>
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
                Chevron: ({ orientation, ...props }) => (
                  <Chevron
                    {...props}
                    orientation={orientation}
                    className={styles.calendarChevron}
                  />
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

            <div className={styles.datePickerFooter}>
              <span className={styles.fieldHint}>
                Escolha ida e volta no mesmo calendario.
              </span>
              <button
                type="button"
                className={styles.datePickerClose}
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
