import { useMemo, useState } from "react";

import {
  CalendarDays,
  Check,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Separator } from "@/shared/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

// TODO: replace layout fixtures with GET /admin/event-types data.
const EVENT_TYPE_FIXTURES = [
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

type EventTypeFixture = (typeof EVENT_TYPE_FIXTURES)[number];

type FiltersPanelProps = {
  searchQuery: string;
  durationFilter: string;
  durationOptions: number[];
  onSearchQueryChange: (value: string) => void;
  onDurationFilterChange: (value: string) => void;
};

function FiltersPanel({
  searchQuery,
  durationFilter,
  durationOptions,
  onSearchQueryChange,
  onDurationFilterChange,
}: FiltersPanelProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center flex-1">
          <div className="relative flex-1 xl:max-w-md">
            <Search
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              aria-label="Поиск по названию типа события"
              className="h-12 pl-11"
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Поиск по названию"
              type="text"
              value={searchQuery}
            />
          </div>
          <Select
            onValueChange={onDurationFilterChange}
            value={durationFilter}
          >
            <SelectTrigger
              aria-label="Фильтр по длительности"
              className="h-12 w-full bg-background sm:w-[260px]"
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              <SelectValue placeholder="Все длительности" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все длительности</SelectItem>
              {durationOptions.map((duration) => (
                <SelectItem key={duration} value={String(duration)}>
                  {duration} мин
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          className="h-12 w-full sm:w-auto sm:min-w-[240px]"
          disabled
          title="Создание будет подключено вместе с API"
          type="button"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Добавить тип события
        </Button>
      </div>
    </div>
  );
}

type StatsPanelProps = {
  totalCount: number;
};

function StatsPanel({ totalCount }: StatsPanelProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
            <CalendarDays
              className="h-5 w-5 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <div className="text-sm font-medium text-foreground">
            Всего типов событий:{" "}
            <span className="font-semibold">{totalCount}</span>
          </div>
        </div>
        <Separator className="sm:hidden" orientation="horizontal" />
        <Separator className="hidden h-10 sm:block" orientation="vertical" />
        <div className="flex flex-1 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100">
            <Check className="h-5 w-5 text-green-600" aria-hidden="true" />
          </div>
          <div className="text-sm font-medium text-foreground">
            Активных: <span className="font-semibold">{totalCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

type EventTypeCardProps = {
  eventType: EventTypeFixture;
};

function EventTypeCard({ eventType }: EventTypeCardProps) {
  return (
    <Card className="rounded-xl border-border bg-card shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold text-foreground">
            {eventType.title}
          </h2>
          <Badge
            className="shrink-0 bg-muted text-muted-foreground"
            variant="secondary"
          >
            {eventType.durationMinutes} мин
          </Badge>
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          {eventType.description}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          id: {eventType.id}
        </p>

        <Separator className="my-4" />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            className="w-full sm:w-[280px]"
            disabled
            title="Недоступно: endpoint не описан в API-контракте"
            type="button"
            variant="outline"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
            Редактировать
          </Button>
          <Button
            className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 sm:w-auto"
            disabled
            title="Недоступно: endpoint не описан в API-контракте"
            type="button"
            variant="ghost"
          >
            Удалить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

type EventTypesGridProps = {
  eventTypes: EventTypeFixture[];
};

function EventTypesGrid({ eventTypes }: EventTypesGridProps) {
  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
      {eventTypes.map((eventType) => (
        <EventTypeCard key={eventType.id} eventType={eventType} />
      ))}
    </div>
  );
}

type FilteredEmptyStateProps = {
  onResetFilters: () => void;
};

function FilteredEmptyState({ onResetFilters }: FilteredEmptyStateProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <h3 className="text-lg font-semibold text-foreground">
          Ничего не найдено
        </h3>
        <p className="text-sm text-muted-foreground">
          Попробуйте изменить поиск или фильтр длительности.
        </p>
        <Button onClick={onResetFilters} type="button" variant="outline">
          Сбросить фильтры
        </Button>
      </div>
    </div>
  );
}

export function AdminEventTypesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [durationFilter, setDurationFilter] = useState("all");

  const durationOptions = useMemo(
    () =>
      Array.from(
        new Set(EVENT_TYPE_FIXTURES.map((eventType) => eventType.durationMinutes))
      ).sort((a, b) => a - b),
    []
  );

  const filteredEventTypes = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return EVENT_TYPE_FIXTURES.filter((eventType) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        eventType.title.toLowerCase().includes(normalizedQuery);

      const matchesDuration =
        durationFilter === "all" ||
        String(eventType.durationMinutes) === durationFilter;

      return matchesSearch && matchesDuration;
    });
  }, [durationFilter, searchQuery]);

  const totalCount = EVENT_TYPE_FIXTURES.length;

  function resetFilters() {
    setSearchQuery("");
    setDurationFilter("all");
  }

  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          Типы событий
        </h1>
        <p className="text-base text-muted-foreground">
          Создавайте и редактируйте типы событий для бронирования.
        </p>
      </div>

      <FiltersPanel
        searchQuery={searchQuery}
        durationFilter={durationFilter}
        durationOptions={durationOptions}
        onSearchQueryChange={setSearchQuery}
        onDurationFilterChange={setDurationFilter}
      />
      <StatsPanel totalCount={totalCount} />

      {filteredEventTypes.length > 0 ? (
        <EventTypesGrid eventTypes={filteredEventTypes} />
      ) : (
        <FilteredEmptyState onResetFilters={resetFilters} />
      )}
    </section>
  );
}
