# shared

Слой общего кода без знания бизнес-домена.

- api/ — API-клиент (ky, endpoint'ы)
- config/ — env vars, base URL
- lib/ — утилиты (cn, helpers)
- model/ — общие типы
- ui/ — базовые UI-компоненты (shadcn/ui)

Не импортирует: app, pages, widgets, features, entities.
