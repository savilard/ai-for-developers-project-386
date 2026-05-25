import { useEffect, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert"
import { Skeleton } from "@/shared/ui/skeleton"
import type { EventType } from "@/shared/api/types"
import { listPublicEventTypes } from "@/shared/api/event-types"
import { EventTypeCard } from "@/entities/event-type/ui/event-type-card"

type Status = "loading" | "error" | "empty" | "success"

function OwnerCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center gap-4">
        <svg className="h-12 w-12 shrink-0" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="24" cy="24" r="24" fill="#f3f6fb" />
          <path d="M16 30c0-4.4 3.6-8 8-8s8 3.6 8 8v4H16v-4z" fill="#14b8a6" />
          <ellipse cx="24" cy="20" rx="7" ry="8" fill="#fbad5a" />
          <circle cx="21.5" cy="19.5" r="1.2" fill="#1f2937" />
          <circle cx="26.5" cy="19.5" r="1.2" fill="#1f2937" />
        </svg>
        <div>
          <div className="text-base font-semibold text-card-foreground">Tota</div>
          <div className="text-sm text-muted-foreground">Host</div>
        </div>
      </div>
      <div className="mt-5">
        <h1 className="text-2xl font-bold tracking-tight text-card-foreground">
          Выберите тип события
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Нажмите на карточку, чтобы открыть календарь и выбрать удобный слот.
        </p>
      </div>
    </div>
  )
}

function EventTypeCardSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-2/5" />
        <Skeleton className="h-3 w-3/4" />
      </div>
      <Skeleton className="ml-4 h-5 w-12 shrink-0 rounded-full" />
    </div>
  )
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <EventTypeCardSkeleton />
      <EventTypeCardSkeleton />
      <EventTypeCardSkeleton />
    </div>
  )
}

function ErrorState() {
  return (
    <Alert variant="destructive">
      <AlertTitle>Не удалось загрузить типы событий</AlertTitle>
      <AlertDescription>
        Что-то пошло не так. Попробуйте обновить страницу позже.
      </AlertDescription>
    </Alert>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
      <h3 className="text-base font-semibold text-card-foreground">
        Нет доступных типов событий
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Пока не создано ни одного типа события. Зайдите позже.
      </p>
    </div>
  )
}

function SuccessState({ eventTypes }: { eventTypes: EventType[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {eventTypes.map((event) => (
        <EventTypeCard key={event.id} eventType={event} />
      ))}
    </div>
  )
}

export function EventTypesPage() {
  const [status, setStatus] = useState<Status>("loading")
  const [eventTypes, setEventTypes] = useState<EventType[]>([])

  useEffect(() => {
    async function load() {
      try {
        setStatus("loading")
        const response = await listPublicEventTypes()
        const types = response.eventTypes

        if (types.length === 0) {
          setStatus("empty")
        } else {
          setEventTypes(types)
          setStatus("success")
        }
      } catch {
        setStatus("error")
      }
    }

    load()
  }, [])

  return (
    <div className="space-y-8">
      <OwnerCard />
      {status === "loading" && <LoadingState />}
      {status === "error" && <ErrorState />}
      {status === "empty" && <EmptyState />}
      {status === "success" && <SuccessState eventTypes={eventTypes} />}
    </div>
  )
}
