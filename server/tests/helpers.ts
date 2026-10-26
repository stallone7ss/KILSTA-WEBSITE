import type { SupabaseClient } from '@supabase/supabase-js';
import { env } from '../src/config/env';
import type { AppConfig } from '../src/config/env';
import type { Database } from '../src/types/database.types';
import type { EmailResult, EmailService, EmailMessage } from '../src/services/email.service';
import type { Logger } from '../src/utils/logger';

type Row = Record<string, unknown>;
type Filter = { column: string; value: unknown };

/** In-memory stand-in for the subset of the Supabase query builder used by the API. */
export class FakeDb {
  readonly tables: Record<string, Row[]> = {};
  private sequence = 0;
  private readonly now: () => Date;

  constructor(seed: Record<string, Row[]> = {}, now = () => new Date('2026-10-25T08:30:00.000Z')) {
    for (const [table, rows] of Object.entries(seed)) {
      this.tables[table] = rows.map((row) => ({ ...row }));
    }
    this.now = now;
  }

  from(table: string) {
    return new FakeQuery(this, table);
  }

  rows(table: string): Row[] {
    this.tables[table] ??= [];
    return this.tables[table];
  }

  nextId(): string {
    this.sequence += 1;
    return `00000000-0000-4000-8000-${String(this.sequence).padStart(12, '0')}`;
  }

  timestamp(): string {
    return this.now().toISOString();
  }

  asClient(): SupabaseClient<Database> {
    return this as unknown as SupabaseClient<Database>;
  }
}

interface QueryState {
  operation: 'select' | 'insert' | 'update' | 'delete';
  payload: Row | Row[] | null;
  filters: Filter[];
  columns: string;
  head: boolean;
  single: 'none' | 'single' | 'maybe';
  order: Array<{ column: string; ascending: boolean }>;
  limit: number | null;
}

class FakeQuery implements PromiseLike<{ data: unknown; error: unknown; count?: number }> {
  private state: QueryState = {
    operation: 'select',
    payload: null,
    filters: [],
    columns: '*',
    head: false,
    single: 'none',
    order: [],
    limit: null
  };

  constructor(
    private readonly db: FakeDb,
    private readonly table: string
  ) {}

  select(columns = '*', options?: { head?: boolean; count?: string }) {
    if (this.state.operation === 'select') this.state.operation = 'select';
    this.state.columns = columns;
    this.state.head = options?.head ?? false;
    return this;
  }

  insert(payload: Row | Row[]) {
    this.state.operation = 'insert';
    this.state.payload = payload;
    return this;
  }

  update(payload: Row) {
    this.state.operation = 'update';
    this.state.payload = payload;
    return this;
  }

  delete() {
    this.state.operation = 'delete';
    return this;
  }

  eq(column: string, value: unknown) {
    this.state.filters.push({ column, value });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.state.order.push({ column, ascending: options?.ascending ?? true });
    return this;
  }

  limit(value: number) {
    this.state.limit = value;
    return this;
  }

  single() {
    this.state.single = 'single';
    return this;
  }

  maybeSingle() {
    this.state.single = 'maybe';
    return this;
  }

  private matches(row: Row): boolean {
    return this.state.filters.every((filter) => row[filter.column] === filter.value);
  }

  private execute(): { data: unknown; error: unknown; count?: number } {
    const rows = this.db.rows(this.table);

    if (this.state.operation === 'insert') {
      const payload = Array.isArray(this.state.payload)
        ? this.state.payload
        : [this.state.payload ?? {}];
      const inserted = payload.map((values) => ({
        id: values.id ?? this.db.nextId(),
        created_at: values.created_at ?? this.db.timestamp(),
        updated_at: values.updated_at ?? this.db.timestamp(),
        ...(this.table === 'quote_requests' || this.table === 'contact_messages'
          ? { status: values.status ?? 'New' }
          : this.table === 'course_registrations'
            ? { status: values.status ?? 'Pending' }
            : {}),
        ...values
      }));
      rows.push(...inserted);
      return { data: this.shape(inserted), error: null };
    }

    if (this.state.operation === 'update') {
      const updated: Row[] = [];
      for (const row of rows) {
        if (!this.matches(row)) continue;
        Object.assign(row, this.state.payload, { updated_at: this.db.timestamp() });
        updated.push(row);
      }
      return { data: this.shape(updated), error: null };
    }

    if (this.state.operation === 'delete') {
      const kept = rows.filter((row) => !this.matches(row));
      const removed = rows.length - kept.length;
      this.db.tables[this.table] = kept;
      return { data: null, error: null, count: removed };
    }

    let selected = rows.filter((row) => this.matches(row));
    for (const order of [...this.state.order].reverse()) {
      selected = [...selected].sort((a, b) => {
        const left = String(a[order.column] ?? '');
        const right = String(b[order.column] ?? '');
        return order.ascending ? left.localeCompare(right) : right.localeCompare(left);
      });
    }
    if (this.state.limit !== null) selected = selected.slice(0, this.state.limit);
    if (this.state.head) return { data: null, error: null, count: selected.length };
    return { data: this.shape(selected), error: null, count: selected.length };
  }

  private shape(rows: Row[]): unknown {
    const projected = rows.map((row) => {
      if (this.state.columns === '*' || this.state.columns.trim() === '') return { ...row };
      const columns = this.state.columns.split(',').map((column) => column.trim());
      const output: Row = {};
      for (const column of columns) output[column] = row[column];
      return output;
    });
    if (this.state.single === 'single') {
      if (projected.length === 0) {
        return null;
      }
      return projected[0];
    }
    if (this.state.single === 'maybe') return projected[0] ?? null;
    return projected;
  }

  then<TResult1 = { data: unknown; error: unknown; count?: number }, TResult2 = never>(
    onfulfilled?:
      | ((value: { data: unknown; error: unknown; count?: number }) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ): PromiseLike<TResult1 | TResult2> {
    const result = this.execute();
    if (this.state.single === 'single' && result.data === null) {
      return Promise.resolve({
        data: null,
        error: { code: 'PGRST116', message: 'No rows returned' }
      }).then(onfulfilled, onrejected);
    }
    return Promise.resolve(result).then(onfulfilled, onrejected);
  }
}

export const silentLogger: Logger = {
  debug: () => undefined,
  info: () => undefined,
  warn: () => undefined,
  error: () => undefined,
  child: () => silentLogger
};

export function testConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    ...env,
    NODE_ENV: 'test',
    isProduction: false,
    isTest: true,
    SUPABASE_URL: undefined,
    SUPABASE_SECRET_KEY: undefined,
    EMAIL_PROVIDER: 'none',
    ...overrides
  } as AppConfig;
}

export const skippedEmail: EmailService = {
  provider: 'none',
  async send(_message: EmailMessage): Promise<EmailResult> {
    return { status: 'skipped', provider: 'none', reason: 'Email delivery is disabled.' };
  }
};

export const TEST_QUOTE = {
  fullName: 'Maria Kila',
  organization: 'Kila Trading',
  email: 'MARIA@EXAMPLE.COM',
  phone: '+675 82545274',
  serviceCategory: 'business',
  requestedService: 'Business plan review',
  projectDescription:
    'We need help reviewing an existing business plan before approaching a bank for finance.',
  preferredContactMethod: 'email',
  budgetRange: 'PGK 5,000 - 10,000',
  preferredCompletionDate: '2027-03-31',
  contactConsent: true
};
