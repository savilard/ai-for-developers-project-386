# API Development Workflow

## Prerequisites

```bash
cd booking-starter
npm install
```

## 1. Generate OpenAPI from TypeSpec

```bash
npm run api:generate
```

This compiles `docs/call_booking_api.tsp` into `tsp-output/@typespec/openapi3/openapi.yaml`.

## 2. Start Prism Mock Server

```bash
npm run api:mock
```

Mock server runs on `http://localhost:4010`.

## 3. Start Frontend (in another terminal)

```bash
npm run dev
```

Frontend uses `VITE_API_BASE_URL=http://localhost:4010` from `.env`.

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `GET http://localhost:4010/public/event-types` | List public event types |
| `GET http://localhost:4010/public/event-types/:id` | Get event type |
| `GET http://localhost:4010/public/event-types/:id/slots` | List available slots |
| `POST http://localhost:4010/public/bookings` | Create booking |
| `GET http://localhost:4010/admin/owner` | Get owner |
| `GET http://localhost:4010/admin/event-types` | List admin event types |
| `POST http://localhost:4010/admin/event-types` | Create event type |
| `GET http://localhost:4010/admin/bookings/upcoming` | List upcoming bookings |
