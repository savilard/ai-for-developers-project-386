import { cn } from "@/shared/lib/utils"
import type { Slot } from "@/shared/api/types"
import { formatTimeForUi } from "@/shared/lib/date"

export type BookingSlotsProps = {
  slots: Slot[]
  selectedSlot: Slot | null
  onSelectSlot: (slot: Slot) => void
}

function getSlotKey(slot: Slot): string {
  return `${slot.startAt}_${slot.endAt}`
}

export function BookingSlots({
  slots,
  selectedSlot,
  onSelectSlot,
}: BookingSlotsProps) {
  return (
    <div className="mt-4 space-y-2">
      {slots.map((slot) => {
        const isSelected =
          selectedSlot !== null && getSlotKey(selectedSlot) === getSlotKey(slot)
        return (
          <button
            key={getSlotKey(slot)}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelectSlot(slot)}
            className={cn(
              "flex w-full items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition-colors",
              isSelected
                ? "border-primary/40 bg-primary/5 text-card-foreground shadow-sm"
                : "cursor-pointer border-border bg-card text-card-foreground hover:bg-accent/30"
            )}
          >
            <span className="font-medium">
              {formatTimeForUi(slot.startAt)} - {formatTimeForUi(slot.endAt)}
            </span>
            <span className="text-xs font-medium text-primary">свободно</span>
          </button>
        )
      })}
    </div>
  )
}
