import type { Response } from 'express';

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: PaginationMeta | Record<string, unknown>;
}

export interface ApiFailure {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  requestId?: string;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  options: { status?: number; meta?: ApiSuccess<T>['meta'] } = {}
): void {
  const body: ApiSuccess<T> = {
    success: true,
    data,
    ...(options.meta ? { meta: options.meta } : {})
  };
  res.status(options.status ?? 200).json(body);
}

export function sendCreated<T>(res: Response, data: T, meta?: ApiSuccess<T>['meta']): void {
  sendSuccess(res, data, { status: 201, meta });
}

export function sendFailure(
  res: Response,
  status: number,
  code: string,
  message: string,
  details?: unknown
): void {
  const body: ApiFailure = {
    success: false,
    error: { code, message, ...(details !== undefined ? { details } : {}) },
    ...(res.locals.requestId ? { requestId: res.locals.requestId as string } : {})
  };
  res.status(status).json(body);
}

export function buildPaginationMeta(page: number, pageSize: number, total: number): PaginationMeta {
  return {
    page,
    pageSize,
    total,
    totalPages: Math.max(1, Math.ceil(total / pageSize))
  };
}
