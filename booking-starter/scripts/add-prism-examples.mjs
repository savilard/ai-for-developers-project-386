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

function main() {
  console.log(`Loading ${OPENAPI_PATH}...`);
  const doc = loadOpenApi();

  console.log("Adding list examples...");
  addExamplesToListEndpoint(doc);

  console.log("Adding detail examples...");
  addExamplesToDetailEndpoint(doc);

  console.log("Adding slots examples...");
  addExamplesToSlotsEndpoint(doc);

  console.log(`Saving ${OPENAPI_PATH}...`);
  saveOpenApi(doc);

  console.log("Done.");
}

main();
