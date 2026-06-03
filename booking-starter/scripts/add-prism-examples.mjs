import { readFileSync, writeFileSync } from "node:fs";
import YAML from "js-yaml";

const OPENAPI_PATH = "tsp-output/@typespec/openapi3/openapi.yaml";

const EVENT_TYPE_EXAMPLES = [
  {
    id: "meeting-15",
    title: "Встреча 15 минут",
    description: "Короткий тип события для быстрого слота.",
    durationMinutes: 15,
  },
  {
    id: "meeting-30",
    title: "Встреча 30 минут",
    description: "Базовый тип события для бронирования.",
    durationMinutes: 30,
  },
  {
    id: "consultation-60",
    title: "Консультация 60 минут",
    description: "Подробная консультация с клиентом.",
    durationMinutes: 60,
  },
  {
    id: "project-review-45",
    title: "Разбор проекта 45 минут",
    description: "Детальный разбор проекта и рекомендации.",
    durationMinutes: 45,
  },
];

function loadOpenApi() {
  const content = readFileSync(OPENAPI_PATH, "utf8");
  return YAML.load(content);
}

function saveOpenApi(doc) {
  const content = YAML.dump(doc, {
    noRefs: true,
    lineWidth: -1,
    quotingType: '"',
  });
  writeFileSync(OPENAPI_PATH, content);
}

function setEventTypeListExamples(doc, path) {
  const endpoint = doc.paths?.[path];
  if (!endpoint) throw new Error(`Endpoint ${path} not found`);

  const content = endpoint.get?.responses?.["200"]?.content?.["application/json"];
  if (!content) throw new Error(`200 response content not found for ${path}`);

  content.examples = {
    success: {
      summary: "Типы событий",
      value: EVENT_TYPE_EXAMPLES,
    },
    empty: {
      summary: "Пустой список",
      value: [],
    },
  };
}

function addExamplesToListEndpoint(doc) {
  setEventTypeListExamples(doc, "/public/event-types");
}

function addExamplesToAdminListEndpoint(doc) {
  setEventTypeListExamples(doc, "/admin/event-types");
}

function addExamplesToDetailEndpoint(doc) {
  const endpoint = doc.paths?.["/public/event-types/{eventTypeId}"];
  if (!endpoint) throw new Error("Endpoint /public/event-types/{eventTypeId} not found");

  const content = endpoint.get?.responses?.["200"]?.content?.["application/json"];
  if (!content) throw new Error("200 response content not found");

  content.examples = {
    default: {
      summary: "Тип события 15 минут",
      value: EVENT_TYPE_EXAMPLES[0],
    },
  };
}

function generateSlots() {
  const slots = [];
  const startDate = new Date("2026-03-31T12:00:00.000Z");

  for (let day = 0; day < 14; day++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + day);

    for (let slot = 0; slot < 8; slot++) {
      const slotStart = new Date(currentDate);
      slotStart.setMinutes(currentDate.getMinutes() + slot * 15);

      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotStart.getMinutes() + 15);

      slots.push({
        eventTypeId: "meeting-15",
        startAt: slotStart.toISOString(),
        endAt: slotEnd.toISOString(),
        durationMinutes: 15,
      });
    }
  }

  return slots;
}

function addExamplesToSlotsEndpoint(doc) {
  const endpoint = doc.paths?.["/public/event-types/{eventTypeId}/slots"];
  if (!endpoint) throw new Error("Endpoint /public/event-types/{eventTypeId}/slots not found");

  const content = endpoint.get?.responses?.["200"]?.content?.["application/json"];
  if (!content) throw new Error("200 response content not found for slots");

  content.examples = {
    success: {
      summary: "Свободные слоты на 14 дней",
      value: generateSlots(),
    },
    empty: {
      summary: "Пустой список слотов",
      value: [],
    },
  };
}

function generateAdminBookings() {
  return [
    {
      id: "booking-1",
      eventTypeId: "intro",
      eventTypeTitle: "Знакомство",
      guest: { name: "Алексей К.", email: "alexey@example.com" },
      startAt: "2026-03-31T09:00:00.000Z",
      endAt: "2026-03-31T09:15:00.000Z",
      status: "confirmed",
      createdAt: "2026-03-30T10:00:00.000Z",
    },
    {
      id: "booking-2",
      eventTypeId: "consult",
      eventTypeTitle: "Консультация",
      guest: { name: "Мария С.", email: "maria@example.com" },
      startAt: "2026-03-31T10:30:00.000Z",
      endAt: "2026-03-31T11:00:00.000Z",
      status: "confirmed",
      createdAt: "2026-03-30T10:00:00.000Z",
    },
    {
      id: "booking-3",
      eventTypeId: "review",
      eventTypeTitle: "Разбор проекта",
      guest: { name: "Дмитрий П.", email: "dmitry@example.com" },
      startAt: "2026-03-31T14:00:00.000Z",
      endAt: "2026-03-31T14:15:00.000Z",
      status: "pending",
      createdAt: "2026-03-30T10:00:00.000Z",
    },
    {
      id: "booking-4",
      eventTypeId: "call",
      eventTypeTitle: "Звонок",
      guest: { name: "Екатерина И.", email: "kate@example.com" },
      startAt: "2026-04-01T09:00:00.000Z",
      endAt: "2026-04-01T09:30:00.000Z",
      status: "confirmed",
      createdAt: "2026-03-30T10:00:00.000Z",
    },
    {
      id: "booking-5",
      eventTypeId: "demo",
      eventTypeTitle: "Демо",
      guest: { name: "Сергей В.", email: "sergey@example.com" },
      startAt: "2026-04-01T11:00:00.000Z",
      endAt: "2026-04-01T12:00:00.000Z",
      status: "confirmed",
      createdAt: "2026-03-30T10:00:00.000Z",
    },
    {
      id: "booking-6",
      eventTypeId: "intro",
      eventTypeTitle: "Знакомство",
      guest: { name: "Анна Н.", email: "anna@example.com" },
      startAt: "2026-04-02T15:30:00.000Z",
      endAt: "2026-04-02T15:45:00.000Z",
      status: "cancelled",
      createdAt: "2026-03-30T10:00:00.000Z",
    },
    {
      id: "booking-7",
      eventTypeId: "consult",
      eventTypeTitle: "Консультация",
      guest: { name: "Иван П.", email: "ivan@example.com" },
      startAt: "2026-04-03T10:00:00.000Z",
      endAt: "2026-04-03T10:30:00.000Z",
      status: "confirmed",
      createdAt: "2026-03-30T10:00:00.000Z",
    },
    {
      id: "booking-8",
      eventTypeId: "review",
      eventTypeTitle: "Разбор проекта",
      guest: { name: "Ольга Л.", email: "olga@example.com" },
      startAt: "2026-04-03T16:00:00.000Z",
      endAt: "2026-04-03T16:15:00.000Z",
      status: "pending",
      createdAt: "2026-03-30T10:00:00.000Z",
    },
    {
      id: "booking-9",
      eventTypeId: "call",
      eventTypeTitle: "Звонок",
      guest: { name: "Никита Р.", email: "nikita@example.com" },
      startAt: "2026-04-04T09:00:00.000Z",
      endAt: "2026-04-04T09:30:00.000Z",
      status: "confirmed",
      createdAt: "2026-03-30T10:00:00.000Z",
    },
    {
      id: "booking-10",
      eventTypeId: "demo",
      eventTypeTitle: "Демо",
      guest: { name: "Виктория М.", email: "victoria@example.com" },
      startAt: "2026-04-04T11:30:00.000Z",
      endAt: "2026-04-04T12:00:00.000Z",
      status: "confirmed",
      createdAt: "2026-03-30T10:00:00.000Z",
    },
    {
      id: "booking-11",
      eventTypeId: "intro",
      eventTypeTitle: "Знакомство",
      guest: { name: "Павел А.", email: "pavel@example.com" },
      startAt: "2026-04-04T13:00:00.000Z",
      endAt: "2026-04-04T13:15:00.000Z",
      status: "confirmed",
      createdAt: "2026-03-30T10:00:00.000Z",
    },
    {
      id: "booking-12",
      eventTypeId: "consult",
      eventTypeTitle: "Консультация",
      guest: { name: "Дарья Б.", email: "daria@example.com" },
      startAt: "2026-04-04T15:00:00.000Z",
      endAt: "2026-04-04T16:00:00.000Z",
      status: "cancelled",
      createdAt: "2026-03-30T10:00:00.000Z",
    },
  ];
}

function addExamplesToAdminBookingsEndpoint(doc) {
  const endpoint = doc.paths?.["/admin/bookings/upcoming"];
  if (!endpoint) throw new Error("Endpoint /admin/bookings/upcoming not found");

  const content = endpoint.get?.responses?.["200"]?.content?.["application/json"];
  if (!content) throw new Error("200 response content not found for admin bookings");

  if (content.examples) {
    console.log("Admin bookings examples already exist, skipping.");
    return;
  }

  const bookings = generateAdminBookings();
  const summary = { total: 12, confirmed: 8, pending: 2, cancelled: 2 };

  content.examples = {
    page1: {
      summary: "Предстоящие бронирования (страница 1)",
      value: {
        bookings: bookings.slice(0, 8),
        summary,
        pagination: { page: 1, pageSize: 8, totalItems: 12, totalPages: 2 },
      },
    },
    page2: {
      summary: "Предстоящие бронирования (страница 2)",
      value: {
        bookings: bookings.slice(8, 12),
        summary,
        pagination: { page: 2, pageSize: 8, totalItems: 12, totalPages: 2 },
      },
    },
  };
}

function addExamplesToCreateEventTypeEndpoint(doc) {
  const endpoint = doc.paths?.["/admin/event-types"];
  if (!endpoint) throw new Error("Endpoint /admin/event-types not found");

  const requestContent = endpoint.post?.requestBody?.content?.["application/json"];
  if (!requestContent) throw new Error("POST /admin/event-types request content not found");

  requestContent.examples = {
    success: {
      summary: "Создание типа события",
      value: {
        title: "Встреча 30 минут",
        description: "Базовый тип события для бронирования.",
        durationMinutes: 30,
      },
    },
  };

  const responseContent = endpoint.post?.responses?.["201"]?.content?.["application/json"];
  if (!responseContent) throw new Error("POST /admin/event-types 201 response content not found");

  responseContent.examples = {
    success: {
      summary: "Созданный тип события",
      value: {
        id: "created-event-type",
        title: "Новый тип события",
        description: "Тип события, созданный через форму.",
        durationMinutes: 30,
      },
    },
  };
}

function main() {
  console.log(`Loading ${OPENAPI_PATH}...`);
  const doc = loadOpenApi();

  console.log("Adding public list examples...");
  addExamplesToListEndpoint(doc);

  console.log("Adding admin list examples...");
  addExamplesToAdminListEndpoint(doc);

  console.log("Adding detail examples...");
  addExamplesToDetailEndpoint(doc);

  console.log("Adding slots examples...");
  addExamplesToSlotsEndpoint(doc);

  console.log("Adding admin bookings examples...");
  addExamplesToAdminBookingsEndpoint(doc);

  console.log("Adding create event type examples...");
  addExamplesToCreateEventTypeEndpoint(doc);

  console.log(`Saving ${OPENAPI_PATH}...`);
  saveOpenApi(doc);

  console.log("Done.");
}

main();
