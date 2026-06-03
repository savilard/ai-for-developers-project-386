/**
 * Единственный заранее заданный владелец календаря.
 */
export interface Owner {
  id: string;
  displayName: string;
  timezone: string;
}

/**
 * Тип события, который создаёт владелец календаря.
 */
export interface EventType {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
}

/**
 * Запрос на создание типа события владельцем календаря.
 */
export interface CreateEventTypeRequest {
  title: string;
  description: string;
  durationMinutes: number;
}

/**
 * Свободный слот для выбранного типа события.
 */
export interface Slot {
  eventTypeId: string;
  startAt: string; // ISO 8601
  endAt: string;   // ISO 8601
  durationMinutes: number;
}

/**
 * Контактные данные гостя.
 */
export interface GuestContact {
  name: string;
  email: string;
  phone?: string;
}

/**
 * Статус бронирования.
 */
export type BookingStatus = "confirmed" | "pending" | "cancelled";

/**
 * Бронирование времени гостем.
 */
export interface Booking {
  id: string;
  eventTypeId: string;
  eventTypeTitle: string;
  guest: GuestContact;
  startAt: string;   // ISO 8601
  endAt: string;     // ISO 8601
  status: BookingStatus;
  createdAt: string; // ISO 8601
}

/**
 * Запрос гостя на создание бронирования.
 */
export interface CreateBookingRequest {
  eventTypeId: string;
  startAt: string; // ISO 8601
  guest: GuestContact;
}

/**
 * Код ошибки API.
 */
export type ErrorCode =
  | "validation_error"
  | "not_found"
  | "slot_unavailable"
  | "booking_window_violation"
  | "conflict";

/**
 * Унифицированная ошибка API.
 */
export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: string[];
}

/**
 * Сводная статистика бронирований за выбранный период.
 */
export interface BookingSummary {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
}

/**
 * Метаданные серверной пагинации.
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Ответ админского списка бронирований.
 */
export interface AdminBookingListResponse {
  bookings: Booking[];
  summary: BookingSummary;
  pagination: PaginationMeta;
}

/**
 * Ответ одиночного типа события.
 */
export interface EventTypeResponse {
  eventType: EventType;
}

/**
 * Query-параметры для админского списка бронирований.
 */
export interface AdminBookingListParams {
  from?: string;
  to?: string;
  status?: BookingStatus;
  page?: number;
  pageSize?: number;
}
