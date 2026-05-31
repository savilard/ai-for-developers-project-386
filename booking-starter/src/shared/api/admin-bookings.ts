import { request } from "./client";
import type { AdminBookingListParams, AdminBookingListResponse } from "./types";

export function listUpcomingBookings(
  params?: AdminBookingListParams,
): Promise<AdminBookingListResponse> {
  return request<AdminBookingListResponse>("/admin/bookings/upcoming", {
    searchParams: params ? { ...params } : undefined,
  });
}
