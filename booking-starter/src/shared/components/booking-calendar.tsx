import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/shared/lib/utils"
import {
  formatMonthYear,
  isSameDate,
  isDateInList,
  addMonths,
  getCalendarGrid,
} from "@/shared/lib/date"

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]

export type BookingCalendarProps = {
  availableDays: Date[]
  selectedDate: Date
  onSelectDate: (date: Date) => void
}

export function BookingCalendar({
  availableDays,
  selectedDate,
  onSelectDate,
}: BookingCalendarProps) {
  const initialMonth = new Date(availableDays[0])
  initialMonth.setDate(1)

  const [currentMonth, setCurrentMonth] = useState(initialMonth)

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const grid = getCalendarGrid(year, month)

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-card-foreground">Календарь</h2>
          <p className="text-sm text-muted-foreground">
            {formatMonthYear(currentMonth)}
          </p>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            aria-label="Предыдущий месяц"
            onClick={() => setCurrentMonth((d) => addMonths(d, -1))}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-accent"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Следующий месяц"
            onClick={() => setCurrentMonth((d) => addMonths(d, 1))}
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground transition-colors hover:bg-accent"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <div className="grid grid-cols-7 gap-1 text-center">
          {WEEKDAYS.map((wd) => (
            <div
              key={wd}
              className="py-1 text-xs font-medium text-muted-foreground"
            >
              {wd}
            </div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {grid.map((cell, i) => {
            const isAvailable = isDateInList(cell.date, availableDays)
            const isSelected = isSameDate(cell.date, selectedDate)

            if (isAvailable) {
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSelectDate(cell.date)}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-lg border py-1.5 text-sm transition-colors",
                    isSelected
                      ? "border-primary/30 bg-white font-bold text-card-foreground shadow-sm"
                      : "cursor-pointer border-border/50 text-card-foreground hover:bg-accent/50"
                  )}
                >
                  <span>{cell.date.getDate()}</span>
                </button>
              )
            }

            return (
              <div
                key={i}
                className={cn(
                  "flex flex-col items-center justify-center rounded-lg border border-transparent py-1.5 text-sm",
                  cell.isPadding
                    ? "text-muted-foreground/40"
                    : "text-muted-foreground/60"
                )}
              >
                <span>{cell.date.getDate()}</span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
