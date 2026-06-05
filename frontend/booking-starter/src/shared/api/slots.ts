import { request } from "./client";
import type { Slot } from "./types";

export function listAvailableSlots(eventTypeId: string): Promise<Slot[]> {
  return request<Slot[]>(`/public/event-types/${eventTypeId}/slots`);
}
