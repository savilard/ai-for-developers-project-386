from fastapi import APIRouter

from schemas import EventTypeReadResponse

router = APIRouter(
    prefix='/event-types',
)


@router.get(
    '/',
    response_model=list[EventTypeReadResponse],
    response_model_by_alias=True,
)
def get_admin_event_types():
    return [
        EventTypeReadResponse(
            id='meeting-15',
            title='Встреча 15 минут',
            description='Короткий тип события для быстрого слота.',
            duration_minutes=15,
        ),
        EventTypeReadResponse(
            id='meeting-30',
            title='Встреча 30 минут',
            description='Базовый тип события для бронирования.',
            duration_minutes=30,
        ),
        EventTypeReadResponse(
            id='consultation-60',
            title='Консультация 60 минут',
            description='Подробная консультация с клиентом.',
            duration_minutes=60,
        ),
        EventTypeReadResponse(
            id='project-review-45',
            title='Разбор проекта 45 минут',
            description='Детальный разбор проекта и рекомендации.',
            duration_minutes=45,
        ),
    ]
