import { request } from "./client";
import type { EventType } from "./types";

export function listPublicEventTypes(): Promise<EventType[]> {
  return request<EventType[]>("/public/event-types/");
}

export function getPublicEventType(eventTypeId: string): Promise<EventType> {
  return request<EventType>(`/public/event-types/${eventTypeId}/`);
}
