import { readFileSync, writeFileSync } from "node:fs";
import YAML from "js-yaml";

const OPENAPI_PATH = "tsp-output/@typespec/openapi3/openapi.yaml";

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

function addExamplesToListEndpoint(doc) {
  const endpoint = doc.paths?.["/public/event-types"];
  if (!endpoint) throw new Error("Endpoint /public/event-types not found");

  const content = endpoint.get?.responses?.["200"]?.content?.["application/json"];
  if (!content) throw new Error("200 response content not found");

  if (content.examples) {
    console.log("List examples already exist, skipping.");
    return;
  }

  content.examples = {
    success: {
      summary: "Два типа событий",
      value: [
        {
          id: "15-min",
          title: "Встреча 15 минут",
          description: "Короткий тип события для быстрого слота.",
          durationMinutes: 15,
        },
        {
          id: "30-min",
          title: "Встреча 30 минут",
          description: "Базовый тип события для бронирования.",
          durationMinutes: 30,
        },
      ],
    },
    empty: {
      summary: "Пустой список",
      value: [],
    },
  };
}

function addExamplesToDetailEndpoint(doc) {
  const endpoint = doc.paths?.["/public/event-types/{eventTypeId}"];
  if (!endpoint) throw new Error("Endpoint /public/event-types/{eventTypeId} not found");

  const content = endpoint.get?.responses?.["200"]?.content?.["application/json"];
  if (!content) throw new Error("200 response content not found");

  if (content.examples) {
    console.log("Detail examples already exist, skipping.");
    return;
  }

  content.examples = {
    default: {
      summary: "Тип события 15 минут",
      value: {
        id: "15-min",
        title: "Встреча 15 минут",
        description: "Короткий тип события для быстрого слота.",
        durationMinutes: 15,
      },
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
        eventTypeId: "15-min",
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

  if (content.examples) {
    console.log("Slots examples already exist, skipping.");
    return;
  }

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

function main() {
  console.log(`Loading ${OPENAPI_PATH}...`);
  const doc = loadOpenApi();

  console.log("Adding list examples...");
  addExamplesToListEndpoint(doc);

  console.log("Adding detail examples...");
  addExamplesToDetailEndpoint(doc);

  console.log("Adding slots examples...");
  addExamplesToSlotsEndpoint(doc);

  console.log("Adding admin bookings examples...");
  addExamplesToAdminBookingsEndpoint(doc);

  console.log(`Saving ${OPENAPI_PATH}...`);
  saveOpenApi(doc);

  console.log("Done.");
}

main();
