import { request } from "./client";
import type { Booking, CreateBookingRequest } from "./types";

export function createBooking(body: CreateBookingRequest): Promise<Booking> {
  return request<Booking>("/public/bookings/", { method: "POST", body });
}
