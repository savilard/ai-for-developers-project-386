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
  id: string;
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
export type BookingStatus = "confirmed";

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
