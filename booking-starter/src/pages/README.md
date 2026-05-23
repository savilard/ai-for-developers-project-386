# pages

Слой страниц. Каждая папка соответствует одному маршруту.

- home/ — главная (/)
- event-types/ — выбор типа события (/book)
- booking-slots/ — выбор даты и слота (/book/:eventTypeId)
- booking-confirm/ — подтверждение бронирования (/book/:eventTypeId/confirm)
- booking-success/ — успешная запись (/book/success)
- admin-bookings/ — список предстоящих встреч (/admin)
- admin-event-types/ — управление типами событий (/admin/event-types)

Импортирует: widgets, features, entities, shared.
