import { Link } from "react-router-dom"

import { Badge } from "@/shared/ui/badge"
import type { EventType } from "@/shared/api/types"

interface EventTypeCardProps {
  eventType: EventType
}

export function EventTypeCard({ eventType }: EventTypeCardProps) {
  return (
    <Link
      to={`/book/${eventType.id}`}
      className="flex cursor-pointer items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/30 hover:bg-secondary/50"
    >
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-card-foreground">
          {eventType.title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {eventType.description}
        </p>
      </div>
      <Badge variant="outline" className="ml-4 shrink-0">
        {eventType.durationMinutes} мин
      </Badge>
    </Link>
  )
}
