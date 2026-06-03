import { useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  Check,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { listAdminEventTypes, createEventType, ApiRequestError } from "@/shared/api";
import type { EventType, CreateEventTypeRequest } from "@/shared/api/types";
import { cn } from "@/shared/lib/utils";

import { Alert, AlertDescription, AlertTitle } from "@/shared/ui/alert";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { Input } from "@/shared/ui/input";
import { Separator } from "@/shared/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Skeleton } from "@/shared/ui/skeleton";
import { Textarea } from "@/shared/ui/textarea";

type PageStatus = "loading" | "error" | "empty" | "success";

const DURATION_OPTIONS = [15, 30, 45, 60, 90];

const createEventTypeSchema = z.object({
  title: z.string().trim().min(1, "Введите название"),
  description: z.string().trim().min(1, "Введите описание"),
  durationMinutes: z.number().int().min(1, "Укажите длительность"),
});

type CreateEventTypeFormValues = z.infer<typeof createEventTypeSchema>;

type FiltersPanelProps = {
  searchQuery: string;
  durationFilter: string;
  durationOptions: number[];
  disabled?: boolean;
  canCreate?: boolean;
  onCreateClick: () => void;
  onSearchQueryChange: (value: string) => void;
  onDurationFilterChange: (value: string) => void;
};

function FiltersPanel({
  searchQuery,
  durationFilter,
  durationOptions,
  disabled = false,
  canCreate = false,
  onCreateClick,
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
              disabled={disabled}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Поиск по названию"
              type="text"
              value={searchQuery}
            />
          </div>
          <Select
            disabled={disabled}
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
          disabled={!canCreate}
          onClick={onCreateClick}
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
  eventType: EventType;
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
  eventTypes: EventType[];
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

function AdminEventTypesLoading() {
  return (
    <>
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-5 w-48" />
          </div>
          <Separator className="sm:hidden" orientation="horizontal" />
          <Separator className="hidden h-10 sm:block" orientation="vertical" />
          <div className="flex flex-1 items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-5 w-32" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} className="rounded-xl border-border bg-card shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-1 h-4 w-32" />
              <Separator className="my-4" />
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Skeleton className="h-10 w-full sm:w-[280px]" />
                <Skeleton className="h-10 w-full sm:w-auto" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

type AdminEventTypesErrorProps = {
  message: string | null;
  onRetry: () => void;
};

function AdminEventTypesError({ message, onRetry }: AdminEventTypesErrorProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <Alert variant="destructive">
        <AlertTitle>Не удалось загрузить типы событий</AlertTitle>
        <AlertDescription>
          {message ?? "Попробуйте повторить запрос."}
        </AlertDescription>
      </Alert>
      <div className="mt-4 flex justify-center">
        <Button onClick={onRetry} type="button">
          Повторить
        </Button>
      </div>
    </div>
  );
}

type AdminEventTypesEmptyProps = {
  onCreateClick: () => void;
};

function AdminEventTypesEmpty({ onCreateClick }: AdminEventTypesEmptyProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-8 shadow-sm">
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <h3 className="text-lg font-semibold text-foreground">
          Создайте первый тип события
        </h3>
        <p className="text-sm text-muted-foreground">
          Добавьте название, описание и длительность, чтобы гости могли выбрать этот формат встречи.
        </p>
        <Button className="h-12" onClick={onCreateClick} type="button">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Добавить тип события
        </Button>
      </div>
    </div>
  );
}

type CreateEventTypeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateEventTypeRequest) => Promise<void>;
};

function CreateEventTypeDialog({ open, onOpenChange, onSubmit }: CreateEventTypeDialogProps) {
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<CreateEventTypeFormValues>({
    resolver: zodResolver(createEventTypeSchema),
    defaultValues: {
      title: "",
      description: "",
      durationMinutes: 30,
    },
  });

  const previewTitle = useWatch({ control: form.control, name: "title" });
  const previewDescription = useWatch({ control: form.control, name: "description" });
  const previewDuration = useWatch({ control: form.control, name: "durationMinutes" });

  const previewTitleText = previewTitle?.trim() || "Встреча 30 минут";
  const previewDescriptionText =
    previewDescription?.trim() || "Базовый тип события для бронирования.";
  const previewDurationText = `${previewDuration || 30} мин`;

  async function handleFormSubmit(values: CreateEventTypeFormValues) {
    setSubmitError(null);
    try {
      const payload: CreateEventTypeRequest = {
        title: values.title.trim(),
        description: values.description.trim(),
        durationMinutes: values.durationMinutes,
      };
      await onSubmit(payload);
      form.reset();
    } catch (error) {
      let message = "Не удалось создать тип события. Попробуйте ещё раз.";
      if (error instanceof ApiRequestError) {
        if (error.status === 409) {
          message = "Тип события с таким кодом уже существует.";
        } else {
          message = error.message || message;
        }
      }
      setSubmitError(message);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto rounded-2xl p-6 shadow-xl sm:max-w-[860px] sm:p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">
            Добавить тип события
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Создайте новый тип события для бронирования.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)}>
            <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="mb-5 space-y-1">
                  <h3 className="text-base font-semibold text-foreground">
                    Информация о типе события
                  </h3>
                </div>

                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Название</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Например, Встреча 30 минут"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Описание</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Кратко опишите, для чего подходит этот тип события"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="durationMinutes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Продолжительность</FormLabel>
                        <FormControl>
                          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                            {DURATION_OPTIONS.map((duration) => {
                              const isSelected = field.value === duration;
                              return (
                                <button
                                  key={duration}
                                  type="button"
                                  className={cn(
                                    "h-10 rounded-md border px-3 text-sm font-medium transition-colors",
                                    isSelected
                                      ? "border-primary text-primary"
                                      : "border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                                  )}
                                  onClick={() => field.onChange(duration)}
                                >
                                  {duration} мин
                                </button>
                              );
                            })}
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {submitError && (
                    <Alert variant="destructive">
                      <AlertTitle>Ошибка</AlertTitle>
                      <AlertDescription>{submitError}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-foreground">
                    Предпросмотр
                  </h3>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Так карточка будет отображаться на странице выбора типа события.
                  </p>
                </div>

                <Card className="mt-6 rounded-xl border-border bg-card shadow-sm">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="text-base font-semibold text-foreground">
                        {previewTitleText}
                      </h4>
                      <Badge
                        className="shrink-0 bg-muted text-muted-foreground"
                        variant="secondary"
                      >
                        {previewDurationText}
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm text-muted-foreground">
                      {previewDescriptionText}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                className="h-12 w-full"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                className="h-12 w-full"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "Сохранение..." : "Сохранить"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function AdminEventTypesPage() {
  const [status, setStatus] = useState<PageStatus>("loading");
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [durationFilter, setDurationFilter] = useState("all");
  const [retryCount, setRetryCount] = useState(0);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        if (!cancelled) {
          setStatus("loading");
          setErrorMessage(null);
        }

        const items = await listAdminEventTypes();

        if (!cancelled) {
          setEventTypes(items);
          setStatus(items.length > 0 ? "success" : "empty");
        }
      } catch (error) {
        if (!cancelled) {
          setEventTypes([]);
          setStatus("error");
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Попробуйте обновить страницу позже."
          );
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [retryCount]);

  const durationOptions = useMemo(
    () =>
      Array.from(
        new Set(eventTypes.map((eventType) => eventType.durationMinutes))
      ).sort((a, b) => a - b),
    [eventTypes]
  );

  const filteredEventTypes = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return eventTypes.filter((eventType) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        eventType.title.toLowerCase().includes(normalizedQuery);

      const matchesDuration =
        durationFilter === "all" ||
        String(eventType.durationMinutes) === durationFilter;

      return matchesSearch && matchesDuration;
    });
  }, [durationFilter, eventTypes, searchQuery]);

  const totalCount = eventTypes.length;
  const canCreate = status !== "loading" && status !== "error";

  function resetFilters() {
    setSearchQuery("");
    setDurationFilter("all");
  }

  async function handleCreateEventType(values: CreateEventTypeRequest) {
    const created = await createEventType(values);
    setEventTypes((current) => {
      const exists = current.some((eventType) => eventType.id === created.id);

      if (exists) {
        return current.map((eventType) =>
          eventType.id === created.id ? created : eventType
        );
      }

      return [created, ...current];
    });
    setStatus("success");
    setCreateDialogOpen(false);
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
        disabled={status === "loading" || status === "error"}
        canCreate={canCreate}
        onCreateClick={() => setCreateDialogOpen(true)}
        onSearchQueryChange={setSearchQuery}
        onDurationFilterChange={setDurationFilter}
      />

      {status === "loading" && <AdminEventTypesLoading />}

      {status === "error" && (
        <AdminEventTypesError
          message={errorMessage}
          onRetry={() => setRetryCount((count) => count + 1)}
        />
      )}

      {status === "empty" && (
        <>
          <StatsPanel totalCount={0} />
          <AdminEventTypesEmpty onCreateClick={() => setCreateDialogOpen(true)} />
        </>
      )}

      {status === "success" && (
        <>
          <StatsPanel totalCount={totalCount} />
          {filteredEventTypes.length > 0 ? (
            <EventTypesGrid eventTypes={filteredEventTypes} />
          ) : (
            <FilteredEmptyState onResetFilters={resetFilters} />
          )}
        </>
      )}

      <CreateEventTypeDialog
        open={isCreateDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateEventType}
      />
    </section>
  );
}
