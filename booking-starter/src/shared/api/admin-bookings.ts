import { request } from "./client";
import type { Booking } from "./types";

export function listUpcomingBookings(): Promise<Booking[]> {
  return request<Booking[]>("/admin/bookings/upcoming");
}
