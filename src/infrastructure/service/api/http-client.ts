/* ═══════════════════════════════════════════
   Cliente HTTP — Trainify
   ═══════════════════════════════════════════ */

import { DEFAULT_TIMEOUT } from "@/constants";

/** Configuração de requisição HTTP */
export interface HttpRequestConfig {
  url: string;
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  headers?: Record<string, string>;
  body?: unknown;
  timeout?: number;
}

/** Resposta de requisição HTTP */
export interface HttpResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

/** Erro de requisição HTTP */
export class HttpError extends Error {
  status: number;
  statusText: string;

  constructor(
    status: number,
    statusText: string,
    message?: string
  ) {
    super(message ?? `HTTP ${status}: ${statusText}`);
    this.name = "HttpError";
    this.status = status;
    this.statusText = statusText;
  }
}

/** Cliente HTTP simples usando fetch */
export class HttpClient {
  private baseURL: string;
  private defaultTimeout: number;

  constructor(baseURL: string, timeout = DEFAULT_TIMEOUT) {
    this.baseURL = baseURL;
    this.defaultTimeout = timeout;
  }

  /** Executar requisição HTTP */
  async request<T>(config: HttpRequestConfig): Promise<HttpResponse<T>> {
    const {
      url,
      method = "GET",
      headers = {},
      body,
      timeout = this.defaultTimeout,
    } = config;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new HttpError(
          response.status,
          response.statusText,
          `Erro na requisição: ${response.status}`
        );
      }

      const data = await response.json();

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === "AbortError") {
          throw new Error("Timeout da requisição");
        }
        throw error;
      }

      throw new Error("Erro desconhecido na requisição");
    }
  }

  /** Requisição GET */
  async get<T>(url: string, headers?: Record<string, string>): Promise<HttpResponse<T>> {
    return this.request<T>({ url, method: "GET", headers });
  }

  /** Requisição POST */
  async post<T>(
    url: string,
    body: unknown,
    headers?: Record<string, string>
  ): Promise<HttpResponse<T>> {
    return this.request<T>({ url, method: "POST", body, headers });
  }

  /** Requisição PUT */
  async put<T>(
    url: string,
    body: unknown,
    headers?: Record<string, string>
  ): Promise<HttpResponse<T>> {
    return this.request<T>({ url, method: "PUT", body, headers });
  }

  /** Requisição DELETE */
  async delete<T>(url: string, headers?: Record<string, string>): Promise<HttpResponse<T>> {
    return this.request<T>({ url, method: "DELETE", headers });
  }

  /** Requisição PATCH */
  async patch<T>(
    url: string,
    body: unknown,
    headers?: Record<string, string>
  ): Promise<HttpResponse<T>> {
    return this.request<T>({ url, method: "PATCH", body, headers });
  }
}
