import "@typespec/http";

using Http;

@service(#{
  title: "Call Booking API",
})
@server("https://api.example.com", "Production API")
namespace CallBooking;

/**
 * Единственный заранее заданный владелец календаря.
 *
 * В MVP нет регистрации и авторизации.
 * Профиль владельца используется системой по умолчанию.
 */
model Owner {
  /**
   * Уникальный идентификатор владельца календаря.
   */
  id: string;

  /**
   * Отображаемое имя владельца календаря.
   */
  displayName: string;

  /**
   * Часовой пояс владельца календаря.
   *
   * Используется для расчёта доступных слотов и отображения времени.
   */
  timezone: string;
}

/**
 * Тип события, который создаёт владелец календаря.
 *
 * Например: "Знакомство", "Консультация", "Разбор проекта".
 */
model EventType {
  /**
   * Уникальный идентификатор типа события.
   */
  id: string;

  /**
   * Название типа события, которое видит гость.
   */
  title: string;

  /**
   * Описание типа события, которое видит гость.
   */
  description: string;

  /**
   * Длительность события в минутах.
   *
   * Используется для расчёта времени окончания бронирования.
   */
  @minValue(1)
  durationMinutes: int32;
}

/**
 * Запрос на создание типа события владельцем календаря.
 */
model CreateEventTypeRequest {
  /**
   * Уникальный идентификатор типа события.
   *
   * Задаётся владельцем или админской частью системы.
   */
  @minLength(1)
  id: string;

  /**
   * Название типа события.
   */
  @minLength(1)
  title: string;

  /**
   * Описание типа события.
   */
  description: string;

  /**
   * Длительность события в минутах.
   */
  @minValue(1)
  durationMinutes: int32;
}

/**
 * Свободный слот для выбранного типа события.
 *
 * Слот является вычисляемой сущностью.
 * Его не обязательно хранить в базе данных.
 */
model Slot {
  /**
   * Идентификатор типа события, для которого рассчитан слот.
   */
  eventTypeId: string;

  /**
   * Время начала свободного слота.
   */
  startAt: utcDateTime;

  /**
   * Время окончания свободного слота.
   */
  endAt: utcDateTime;

  /**
   * Длительность слота в минутах.
   *
   * Совпадает с длительностью выбранного типа события.
   */
  durationMinutes: int32;
}

/**
 * Контактные данные гостя.
 *
 * Гость не создаёт аккаунт и не проходит авторизацию.
 * Эти данные используются только для создания бронирования.
 */
model GuestContact {
  /**
   * Имя гостя.
   */
  @minLength(1)
  name: string;

  /**
   * Email гостя.
   */
  @minLength(1)
  email: string;

  /**
   * Необязательный телефон гостя.
   */
  phone?: string;
}

/**
 * Статус бронирования.
 */
enum BookingStatus {
  /**
   * Бронирование подтверждено.
   */
  confirmed: "confirmed",
}

/**
 * Бронирование времени гостем.
 *
 * Создаётся без регистрации и авторизации.
 */
model Booking {
  /**
   * Уникальный идентификатор бронирования.
   */
  id: string;

  /**
   * Идентификатор типа события.
   */
  eventTypeId: string;

  /**
   * Название типа события на момент создания бронирования.
   */
  eventTypeTitle: string;

  /**
   * Контактные данные гостя.
   */
  guest: GuestContact;

  /**
   * Время начала бронирования.
   */
  startAt: utcDateTime;

  /**
   * Время окончания бронирования.
   *
   * Вычисляется по правилу:
   * startAt + durationMinutes выбранного типа события.
   */
  endAt: utcDateTime;

  /**
   * Статус бронирования.
   */
  status: BookingStatus;

  /**
   * Дата и время создания бронирования.
   */
  createdAt: utcDateTime;
}

/**
 * Запрос гостя на создание бронирования.
 */
model CreateBookingRequest {
  /**
   * Идентификатор выбранного типа события.
   */
  eventTypeId: string;

  /**
   * Выбранное гостем время начала бронирования.
   *
   * Значение должно соответствовать свободному слоту
   * из окна записи на ближайшие 14 дней.
   */
  startAt: utcDateTime;

  /**
   * Контактные данные гостя.
   */
  guest: GuestContact;
}

/**
 * Код ошибки API.
 */
enum ErrorCode {
  /**
   * Ошибка валидации входных данных.
   */
  validationError: "validation_error",

  /**
   * Запрошенная сущность не найдена.
   */
  notFound: "not_found",

  /**
   * Выбранный слот недоступен.
   */
  slotUnavailable: "slot_unavailable",

  /**
   * Попытка забронировать слот вне окна записи.
   */
  bookingWindowViolation: "booking_window_violation",

  /**
   * Конфликт бронирования.
   *
   * Например, выбранное время уже занято другой встречей.
   */
  conflict: "conflict",
}

/**
 * Унифицированная ошибка API.
 */
model ApiError {
  /**
   * Машиночитаемый код ошибки.
   */
  code: ErrorCode;

  /**
   * Человекочитаемое описание ошибки.
   */
  message: string;

  /**
   * Дополнительные детали ошибки.
   */
  details?: string[];
}

model OwnerResponse {
  @statusCode statusCode: 200;
  @body owner: Owner;
}

model EventTypeResponse {
  @statusCode statusCode: 200;
  @body eventType: EventType;
}

model EventTypeCreatedResponse {
  @statusCode statusCode: 201;
  @body eventType: EventType;
}

model EventTypeListResponse {
  @statusCode statusCode: 200;
  @body eventTypes: EventType[];
}

model SlotListResponse {
  @statusCode statusCode: 200;
  @body slots: Slot[];
}

model BookingCreatedResponse {
  @statusCode statusCode: 201;
  @body booking: Booking;
}

model BookingListResponse {
  @statusCode statusCode: 200;
  @body bookings: Booking[];
}

model ValidationErrorResponse {
  @statusCode statusCode: 400;
  @body error: ApiError;
}

model NotFoundErrorResponse {
  @statusCode statusCode: 404;
  @body error: ApiError;
}

model ConflictErrorResponse {
  @statusCode statusCode: 409;
  @body error: ApiError;
}

/**
 * Админский API владельца календаря.
 *
 * В MVP нет авторизации.
 * Бэкенд всегда работает с одним заранее заданным владельцем календаря.
 */
@tag("Владелец")
@route("/admin")
namespace Admin {
  /**
   * Возвращает профиль единственного владельца календаря.
   */
  @get
  @route("/owner")
  op getOwner(): OwnerResponse;

  /**
   * Создаёт новый тип события.
   *
   * Тип события определяет название, описание и длительность будущих бронирований.
   */
  @post
  @route("/event-types")
  op createEventType(
    @body request: CreateEventTypeRequest,
  ): EventTypeCreatedResponse | ValidationErrorResponse | ConflictErrorResponse;

  /**
   * Возвращает список всех типов событий, созданных владельцем календаря.
   */
  @get
  @route("/event-types")
  op listEventTypes(): EventTypeListResponse;

  /**
   * Возвращает список предстоящих бронирований по всем типам событий.
   *
   * Ожидаемая сортировка: по startAt по возрастанию.
   */
  @get
  @route("/bookings/upcoming")
  op listUpcomingBookings(): BookingListResponse;
}

/**
 * Публичный API гостя.
 *
 * Гость не создаёт аккаунт и не проходит авторизацию.
 */
@tag("Гость")
@route("/public")
namespace Public {
  /**
   * Возвращает публичный список доступных типов событий.
   *
   * Используется на странице выбора вида брони.
   */
  @get
  @route("/event-types")
  op listEventTypes(): EventTypeListResponse;

  /**
   * Возвращает выбранный тип события.
   *
   * Используется перед отображением календаря свободных слотов.
   */
  @get
  @route("/event-types/{eventTypeId}")
  op getEventType(
    @path eventTypeId: string,
  ): EventTypeResponse | NotFoundErrorResponse;

  /**
   * Возвращает свободные слоты для выбранного типа события.
   *
   * Правила:
   * - слоты формируются на ближайшие 14 дней, начиная с текущей даты;
   * - возвращаются только свободные слоты;
   * - занятость проверяется глобально по календарю владельца;
   * - бронирования разных типов событий тоже конфликтуют между собой.
   */
  @get
  @route("/event-types/{eventTypeId}/slots")
  op listAvailableSlots(
    @path eventTypeId: string,
  ): SlotListResponse | NotFoundErrorResponse;

  /**
   * Создаёт бронирование гостя.
   *
   * Правила:
   * - гость не должен иметь аккаунт;
   * - startAt должен попадать в окно записи на ближайшие 14 дней;
   * - startAt должен соответствовать свободному слоту;
   * - новое бронирование не должно пересекаться с существующими бронированиями;
   * - конфликт проверяется по всем типам событий, а не только по выбранному eventTypeId.
   */
  @post
  @route("/bookings")
  op createBooking(
    @body request: CreateBookingRequest,
  ):
    | BookingCreatedResponse
    | ValidationErrorResponse
    | NotFoundErrorResponse
    | ConflictErrorResponse;
}
