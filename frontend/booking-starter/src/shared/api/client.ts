import ky, { HTTPError } from "ky";
import type { ApiError } from "./types";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://127.0.0.1:8000";
const API_PREFIX = "/api/v1";

export class ApiRequestError extends Error {
  readonly status: number;
  readonly apiError?: ApiError;
  readonly rawBody?: unknown;

  constructor(
    message: string,
    status: number,
    apiError?: ApiError,
    rawBody?: unknown,
  ) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.apiError = apiError;
    this.rawBody = rawBody;
  }
}

export async function request<T>(
  path: string,
  options?: {
    method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    body?: unknown;
    searchParams?: Record<string, string | number | boolean>;
  }
): Promise<T> {
  try {
    const response = await ky(`${BASE_URL}${API_PREFIX}${path}`, {
      method: options?.method ?? "GET",
      ...(options?.body ? { json: options.body } : {}),
      ...(options?.searchParams ? { searchParams: options.searchParams } : {}),
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.status === 204 || response.body === null) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof HTTPError) {
      const rawBody = await error.response.json().catch(() => null);

      const apiError = isApiError(rawBody) ? rawBody : undefined;

      throw new ApiRequestError(
        apiError?.message ?? `API request failed with status ${error.response.status}`,
        error.response.status,
        apiError,
        rawBody,
      );
    }
    throw error;
  }
}

function isApiError(body: unknown): body is ApiError {
  return (
    typeof body === "object" &&
    body !== null &&
    "code" in body &&
    "message" in body &&
    typeof (body as Record<string, unknown>).code === "string" &&
    typeof (body as Record<string, unknown>).message === "string"
  );
}
