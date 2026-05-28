import { useEffect, useMemo, useState } from "react"
import { useParams, Link } from "react-router-dom"

import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert"
import { Badge } from "@/shared/ui/badge"
import { Button } from "@/shared/ui/button"
import { Skeleton } from "@/shared/ui/skeleton"
import { BookingCalendar } from "@/shared/components/booking-calendar"
import { BookingSlots } from "@/shared/components/booking-slots"
import type { Slot, EventType } from "@/shared/api/types"
import { getPublicEventType } from "@/shared/api/event-types"
import { listAvailableSlots } from "@/shared/api/slots"
import { ApiRequestError } from "@/shared/api/client"
import { formatDateForUi, formatDateForApi, formatTimeForUi, isSameDate } from "@/shared/lib/date"

const OWNER = {
  name: "Tota",
  role: "Host",
}

type EventTypeStatus = "loading" | "error" | "not-found" | "success"
type SlotsStatus = "idle" | "loading" | "error" | "empty" | "success"

function Avatar() {
  return (
    <svg
      className="h-12 w-12 shrink-0"
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="24" cy="24" r="24" fill="#f3f6fb" />
      <path
        d="M16 30c0-4.4 3.6-8 8-8s8 3.6 8 8v4H16v-4z"
        fill="#14b8a6"
      />
      <ellipse cx="24" cy="20" rx="7" ry="8" fill="#fbad5a" />
      <circle cx="21.5" cy="19.5" r="1.2" fill="#1f2937" />
      <circle cx="26.5" cy="19.5" r="1.2" fill="#1f2937" />
    </svg>
  )
}

function getUniqueDatesFromSlots(slots: Slot[]): Date[] {
  const map = new Map<string, Date>()
  for (const slot of slots) {
    const d = new Date(slot.startAt)
    d.setHours(0, 0, 0, 0)
    const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
    map.set(key, d)
  }
  return Array.from(map.values()).sort((a, b) => a.getTime() - b.getTime())
}

function OwnerEventCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
      <Skeleton className="h-6 w-3/5" />
      <Skeleton className="h-4 w-full" />
      <div className="space-y-2">
        <Skeleton className="h-14 w-full rounded-xl" />
        <Skeleton className="h-14 w-full rounded-xl" />
      </div>
    </div>
  )
}

function SlotCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
      <Skeleton className="h-6 w-2/5" />
      <div className="space-y-2">
        <Skeleton className="h-9 w-full rounded-xl" />
        <Skeleton className="h-9 w-full rounded-xl" />
        <Skeleton className="h-9 w-full rounded-xl" />
        <Skeleton className="h-9 w-full rounded-xl" />
      </div>
      <div className="flex gap-2 pt-2">
        <Skeleton className="h-9 flex-1 rounded-lg" />
        <Skeleton className="h-9 flex-1 rounded-lg" />
      </div>
    </div>
  )
}

export function BookingSlotsPage() {
  const { eventTypeId } = useParams<{ eventTypeId: string }>()
  const safeEventTypeId = eventTypeId ?? ""

  const [eventType, setEventType] = useState<EventType | null>(null)
  const [eventTypeStatus, setEventTypeStatus] = useState<EventTypeStatus>("loading")

  const [slots, setSlots] = useState<Slot[]>([])
  const [slotsStatus, setSlotsStatus] = useState<SlotsStatus>("idle")

  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)

  const availableDays = useMemo(() => getUniqueDatesFromSlots(slots), [slots])

  const slotsForSelectedDate = useMemo(() => {
    if (!selectedDate) return []
    return slots.filter((slot) => isSameDate(new Date(slot.startAt), selectedDate))
  }, [slots, selectedDate])

  // Load event type
  useEffect(() => {
    if (!safeEventTypeId) {
      setEventTypeStatus("error")
      return
    }

    async function load() {
      try {
        setEventTypeStatus("loading")
        const data = await getPublicEventType(safeEventTypeId)
        setEventType(data)
        setEventTypeStatus("success")
      } catch (error) {
        if (error instanceof ApiRequestError && error.status === 404) {
          setEventTypeStatus("not-found")
        } else {
          setEventTypeStatus("error")
        }
      }
    }

    load()
  }, [safeEventTypeId])

  // Load slots
  useEffect(() => {
    if (!safeEventTypeId || eventTypeStatus !== "success") return

    async function load() {
      try {
        setSlotsStatus("loading")
        const data = await listAvailableSlots(safeEventTypeId)
        if (data.length === 0) {
          setSlots([])
          setSlotsStatus("empty")
        } else {
          setSlots(data)
          setSlotsStatus("success")
        }
      } catch {
        setSlotsStatus("error")
      }
    }

    load()
  }, [safeEventTypeId, eventTypeStatus])

  // Set default selectedDate when availableDays change
  useEffect(() => {
    if (availableDays.length > 0 && (!selectedDate || !availableDays.some((d) => isSameDate(d, selectedDate)))) {
      setSelectedDate(availableDays[0])
      setSelectedSlot(null)
    }
  }, [availableDays])

  function handleSelectDate(date: Date) {
    setSelectedDate(date)
    setSelectedSlot(null)
  }

  function handleSelectSlot(slot: Slot) {
    setSelectedSlot(slot)
  }

  // Build confirm URL
  const confirmUrl = useMemo(() => {
    if (!eventTypeId || !selectedDate || !selectedSlot) return ""
    const params = new URLSearchParams()
    params.set("date", formatDateForApi(selectedDate))
    params.set("startAt", selectedSlot.startAt)
    params.set("endAt", selectedSlot.endAt)
    params.set("durationMinutes", String(selectedSlot.durationMinutes))
    return `/book/${eventTypeId}/confirm?${params.toString()}`
  }, [eventTypeId, selectedDate, selectedSlot])

  if (eventTypeStatus === "loading") {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-2/5" />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <OwnerEventCardSkeleton />
          <SlotCardSkeleton />
          <SlotCardSkeleton />
        </div>
      </div>
    )
  }

  if (eventTypeStatus === "not-found") {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTitle>Тип события не найден</AlertTitle>
          <AlertDescription>
            Запрошенный тип события не существует.{" "}
            <Link to="/book" className="underline">
              Вернуться к выбору типа события
            </Link>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (eventTypeStatus === "error") {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTitle>Не удалось загрузить тип события</AlertTitle>
          <AlertDescription>
            Что-то пошло не так. Попробуйте обновить страницу позже.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!eventType) return null

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight text-card-foreground">
        {eventType.title}
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left card */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Avatar />
            <div>
              <div className="text-base font-semibold text-card-foreground">
                {OWNER.name}
              </div>
              <div className="text-sm text-muted-foreground">{OWNER.role}</div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <h2 className="text-lg font-bold text-card-foreground">
              {eventType.title}
            </h2>
            <Badge variant="outline">{eventType.durationMinutes} мин</Badge>
          </div>

          <p className="mt-1 text-sm text-muted-foreground">
            {eventType.description}
          </p>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl bg-secondary p-3">
              <div className="text-xs text-muted-foreground">Выбранная дата</div>
              <div className="mt-0.5 text-sm font-medium text-card-foreground">
                {selectedDate ? formatDateForUi(selectedDate) : "—"}
              </div>
            </div>
            <div className="rounded-xl bg-secondary p-3">
              <div className="text-xs text-muted-foreground">Выбранное время</div>
              <div className="mt-0.5 text-sm font-bold text-card-foreground">
                {selectedSlot
                  ? `${formatTimeForUi(selectedSlot.startAt)} - ${formatTimeForUi(selectedSlot.endAt)}`
                  : "Время не выбрано"}
              </div>
            </div>
          </div>
        </div>

        {/* Center calendar */}
        {availableDays.length > 0 && selectedDate && (
          <BookingCalendar
            availableDays={availableDays}
            selectedDate={selectedDate}
            onSelectDate={handleSelectDate}
          />
        )}
        {availableDays.length === 0 && slotsStatus !== "loading" && (
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm flex items-center justify-center min-h-[300px]">
            <p className="text-sm text-muted-foreground text-center">
              Нет доступных дат для бронирования
            </p>
          </div>
        )}

        {/* Right card */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h2 className="text-lg font-bold text-card-foreground">
            Статус слотов
          </h2>

          {slotsStatus === "loading" && (
            <div className="mt-4 space-y-2">
              <Skeleton className="h-9 w-full rounded-xl" />
              <Skeleton className="h-9 w-full rounded-xl" />
              <Skeleton className="h-9 w-full rounded-xl" />
              <Skeleton className="h-9 w-full rounded-xl" />
            </div>
          )}

          {slotsStatus === "error" && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Не удалось загрузить слоты</AlertTitle>
              <AlertDescription>
                Что-то пошло не так. Попробуйте обновить страницу позже.
              </AlertDescription>
            </Alert>
          )}

          {slotsStatus === "empty" && (
            <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Нет доступных слотов
              </p>
            </div>
          )}

          {slotsStatus === "success" && slotsForSelectedDate.length === 0 && (
            <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-border bg-card p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Нет доступных слотов на выбранную дату
              </p>
            </div>
          )}

          {slotsStatus === "success" && slotsForSelectedDate.length > 0 && (
            <BookingSlots
              slots={slotsForSelectedDate}
              selectedSlot={selectedSlot}
              onSelectSlot={handleSelectSlot}
            />
          )}

          <div className="mt-4 flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" asChild>
              <Link to="/book">Назад</Link>
            </Button>
            <Button size="sm" className="flex-1" disabled={!selectedDate || !selectedSlot} asChild>
              {selectedSlot ? (
                <Link to={confirmUrl}>Продолжить</Link>
              ) : (
                <span>Продолжить</span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
