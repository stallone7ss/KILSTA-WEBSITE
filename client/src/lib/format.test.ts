import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatPrice,
  humanize,
  statusTone,
  truncate
} from './format';
import {
  QUOTE_TRANSITIONS,
  REGISTRATION_TRANSITIONS,
  QUOTE_STATUSES,
  REGISTRATION_STATUSES
} from './workflow';

describe('formatting helpers', () => {
  it('never presents an unknown price as free', () => {
    expect(formatPrice(null)).toBe('Price on request');
    expect(formatPrice(undefined)).toBe('Price on request');
    expect(formatPrice(0)).toContain('0');
  });

  it('formats dates and degrades safely on invalid input', () => {
    expect(formatDate('2026-10-25')).toContain('2026');
    expect(formatDate(null)).toBe('—');
    expect(formatDate('not-a-date')).toBe('—');
    expect(formatDateTime(null)).toBe('—');
    expect(formatDateTime('not-a-date')).toBe('—');
  });

  it('humanizes machine values and truncates long text', () => {
    expect(humanize('microsoft-office')).toBe('Microsoft Office');
    expect(humanize('under_review')).toBe('Under Review');
    expect(truncate('abc', 5)).toBe('abc');
    expect(truncate('abcdef', 4)).toBe('abcd…');
  });

  it('maps workflow statuses to badge tones', () => {
    expect(statusTone('New')).toBe('info');
    expect(statusTone('Quoted')).toBe('warning');
    expect(statusTone('Completed')).toBe('success');
    expect(statusTone('Rejected')).toBe('danger');
    expect(statusTone('Unknown')).toBe('neutral');
  });
});

describe('admin workflow metadata', () => {
  it('covers every quote status in the transition map', () => {
    expect(Object.keys(QUOTE_TRANSITIONS)).toEqual(QUOTE_STATUSES);
  });

  it('covers every registration status in the transition map', () => {
    expect(Object.keys(REGISTRATION_TRANSITIONS)).toEqual(REGISTRATION_STATUSES);
  });

  it('keeps completed records terminal', () => {
    expect(QUOTE_TRANSITIONS.Completed).toEqual([]);
    expect(REGISTRATION_TRANSITIONS.Completed).toEqual([]);
  });
});
