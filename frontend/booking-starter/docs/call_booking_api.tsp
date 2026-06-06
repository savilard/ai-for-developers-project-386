import "@typespec/http";

using Http;

@service(#{
  title: "Call Booking API",
})
@server("https://api.example.com", "Production API")
@route("/api/v1")
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
 *
 * Идентификатор типа события генерируется сервером.
 */
model CreateEventTypeRequest {
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

  /**
   * Бронирование ожидает подтверждения владельцем календаря.
   */
  pending: "pending",

  /**
   * Бронирование отменено.
   */
  cancelled: "cancelled",
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
 * Сводная статистика бронирований за выбранный период.
 */
model BookingSummary {
  /**
   * Общее количество бронирований за выбранный период без учета фильтра status.
   */
  @minValue(0)
  total: int32;

  /**
   * Количество подтвержденных бронирований за выбранный период.
   */
  @minValue(0)
  confirmed: int32;

  /**
   * Количество бронирований, ожидающих подтверждения, за выбранный период.
   */
  @minValue(0)
  pending: int32;

  /**
   * Количество отмененных бронирований за выбранный период.
   */
  @minValue(0)
  cancelled: int32;
}

/**
 * Метаданные серверной пагинации.
 */
model PaginationMeta {
  /**
   * Текущая страница, начиная с 1.
   */
  @minValue(1)
  page: int32;

  /**
   * Количество элементов на странице.
   */
  @minValue(1)
  pageSize: int32;

  /**
   * Общее количество элементов после применения фильтров периода и status.
   */
  @minValue(0)
  totalItems: int32;

  /**
   * Общее количество страниц после применения фильтров периода и status.
   */
  @minValue(0)
  totalPages: int32;
}

/**
 * Тело ответа админского списка бронирований.
 */
model AdminBookingListBody {
  bookings: Booking[];
  summary: BookingSummary;
  pagination: PaginationMeta;
}

/**
 * Ответ админского списка бронирований.
 */
model AdminBookingListResponse {
  @statusCode statusCode: 200;
  @body body: AdminBookingListBody;
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
  @route("/owner/")
  op getOwner(): OwnerResponse;

  /**
   * Создаёт новый тип события.
   *
   * Тип события определяет название, описание и длительность будущих бронирований.
   */
  @post
  @route("/event-types/")
  op createEventType(
    @body request: CreateEventTypeRequest,
  ): EventTypeCreatedResponse | ValidationErrorResponse | ConflictErrorResponse;

  /**
   * Возвращает список всех типов событий, созданных владельцем календаря.
   */
  @opExample(#{ returnType: #{ statusCode: 200, eventTypes: #[
    #{ id: "meeting-15", title: "Встреча 15 минут", description: "Короткий тип события для быстрого слота.", durationMinutes: 15 },
    #{ id: "meeting-30", title: "Встреча 30 минут", description: "Базовый тип события для бронирования.", durationMinutes: 30 },
    #{ id: "consultation-60", title: "Консультация 60 минут", description: "Подробная консультация с клиентом.", durationMinutes: 60 },
    #{ id: "project-review-45", title: "Разбор проекта 45 минут", description: "Детальный разбор проекта и рекомендации.", durationMinutes: 45 }
  ] } }, #{ title: "success" })
  @opExample(#{ returnType: #{ statusCode: 200, eventTypes: #[] } }, #{ title: "empty" })
  @get
  @route("/event-types/")
  op listEventTypes(): EventTypeListResponse;

  /**
   * Возвращает список предстоящих бронирований по всем типам событий.
   *
   * Ожидаемая сортировка: по startAt по возрастанию.
   */
  @get
  @route("/bookings/upcoming/")
  op listUpcomingBookings(
    /**
     * Начало периода фильтрации.
     */
    @query from?: utcDateTime,

    /**
     * Конец периода фильтрации.
     */
    @query to?: utcDateTime,

    /**
     * Статус бронирования для фильтрации таблицы.
     */
    @query status?: BookingStatus,

    /**
     * Номер страницы, начиная с 1.
     */
    @query
    @minValue(1)
    page?: int32,

    /**
     * Количество элементов на странице.
     */
    @query
    @minValue(1)
    @maxValue(100)
    pageSize?: int32,
  ): AdminBookingListResponse | ValidationErrorResponse;
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
  @opExample(#{ returnType: #{ statusCode: 200, eventTypes: #[
    #{ id: "meeting-15", title: "Встреча 15 минут", description: "Короткий тип события для быстрого слота.", durationMinutes: 15 },
    #{ id: "meeting-30", title: "Встреча 30 минут", description: "Базовый тип события для бронирования.", durationMinutes: 30 },
    #{ id: "consultation-60", title: "Консультация 60 минут", description: "Подробная консультация с клиентом.", durationMinutes: 60 },
    #{ id: "project-review-45", title: "Разбор проекта 45 минут", description: "Детальный разбор проекта и рекомендации.", durationMinutes: 45 }
  ] } }, #{ title: "success" })
  @opExample(#{ returnType: #{ statusCode: 200, eventTypes: #[] } }, #{ title: "empty" })
  @get
  @route("/event-types/")
  op listEventTypes(): EventTypeListResponse;

  /**
   * Возвращает выбранный тип события.
   *
   * Используется перед отображением календаря свободных слотов.
   */
  @get
  @route("/event-types/{eventTypeId}/")
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
  @route("/event-types/{eventTypeId}/slots/")
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
  @route("/bookings/")
  op createBooking(
    @body request: CreateBookingRequest,
  ):
    | BookingCreatedResponse
    | ValidationErrorResponse
    | NotFoundErrorResponse
    | ConflictErrorResponse;
}