import { request } from "./client";
import type { Owner, EventType, CreateEventTypeRequest } from "./types";

export function getOwner(): Promise<Owner> {
  return request<Owner>("/admin/owner");
}

export function listAdminEventTypes(): Promise<EventType[]> {
  return request<EventType[]>("/admin/event-types");
}

export function createEventType(body: CreateEventTypeRequest): Promise<EventType> {
  return request<EventType>("/admin/event-types", { method: "POST", body });
}
