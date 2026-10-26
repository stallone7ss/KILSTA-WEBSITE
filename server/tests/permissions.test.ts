import { describe, expect, it } from 'vitest';
import {
  QUOTE_STATUSES,
  REGISTRATION_STATUSES,
  canTransitionQuote,
  canTransitionRegistration,
  hasPermission,
  permissionsForRoles
} from '../src/config/permissions';

describe('role permissions', () => {
  it('gives admins every known permission', () => {
    const permissions = permissionsForRoles(['admin']);
    expect(permissions).toContain('settings:write');
    expect(permissions).toContain('users:manage');
    expect(permissions).toContain('audit:read');
    expect(permissions).toContain('content:write');
    expect(permissions).toContain('staff:write');
  });

  it('give staff operational access without content, user or audit control', () => {
    expect(hasPermission(['staff'], 'quotes:write')).toBe(true);
    expect(hasPermission(['staff'], 'contacts:write')).toBe(true);
    expect(hasPermission(['staff'], 'registrations:write')).toBe(true);
    expect(hasPermission(['staff'], 'products:stock')).toBe(true);
    expect(hasPermission(['staff'], 'exports:read')).toBe(true);

    expect(hasPermission(['staff'], 'settings:write')).toBe(false);
    expect(hasPermission(['staff'], 'users:manage')).toBe(false);
    expect(hasPermission(['staff'], 'audit:read')).toBe(false);
    expect(hasPermission(['staff'], 'content:write')).toBe(false);
    expect(hasPermission(['staff'], 'products:write')).toBe(false);
    expect(hasPermission(['staff'], 'staff:write')).toBe(false);
  });

  it('gives junior roles nothing even when combined with unknown values', () => {
    expect(permissionsForRoles([])).toEqual([]);
    expect(hasPermission([], 'quotes:read')).toBe(false);
  });

  it('lets an admin role win regardless of other roles', () => {
    expect(hasPermission(['staff', 'admin'], 'settings:write')).toBe(true);
  });
});

describe('quote workflow transitions', () => {
  it('follows the documented sequence', () => {
    expect(canTransitionQuote('New', 'Under Review')).toBe(true);
    expect(canTransitionQuote('Under Review', 'Quoted')).toBe(true);
    expect(canTransitionQuote('Quoted', 'Accepted')).toBe(true);
    expect(canTransitionQuote('Accepted', 'In Progress')).toBe(true);
    expect(canTransitionQuote('In Progress', 'Completed')).toBe(true);
  });

  it('allows rejection from every active stage and reopening a rejected quote', () => {
    for (const status of ['New', 'Under Review', 'Quoted', 'Accepted', 'In Progress']) {
      expect(canTransitionQuote(status, 'Rejected')).toBe(true);
    }
    expect(canTransitionQuote('Rejected', 'Under Review')).toBe(true);
  });

  it('blocks skipping stages and reopening completed quotes', () => {
    expect(canTransitionQuote('New', 'Completed')).toBe(false);
    expect(canTransitionQuote('Under Review', 'In Progress')).toBe(false);
    expect(canTransitionQuote('Completed', 'Under Review')).toBe(false);
    expect(canTransitionQuote('New', 'Accepted')).toBe(false);
  });

  it('treats a no-op transition as valid without changing status', () => {
    for (const status of QUOTE_STATUSES) {
      expect(canTransitionQuote(status, status)).toBe(true);
    }
  });

  it('does not allow transitions from unknown statuses', () => {
    expect(canTransitionQuote('Deleted', 'New')).toBe(false);
  });
});

describe('registration workflow transitions', () => {
  it('confirms, completes and cancels registrations in order', () => {
    expect(canTransitionRegistration('Pending', 'Confirmed')).toBe(true);
    expect(canTransitionRegistration('Confirmed', 'Completed')).toBe(true);
    expect(canTransitionRegistration('Pending', 'Cancelled')).toBe(true);
    expect(canTransitionRegistration('Cancelled', 'Pending')).toBe(true);
  });

  it('blocks skipping confirmation and reopening a completed registration', () => {
    expect(canTransitionRegistration('Pending', 'Completed')).toBe(false);
    expect(canTransitionRegistration('Completed', 'Pending')).toBe(false);
    expect(canTransitionRegistration('Cancelled', 'Confirmed')).toBe(false);
  });

  it('treats no-op transitions as valid for every defined status', () => {
    for (const status of REGISTRATION_STATUSES) {
      expect(canTransitionRegistration(status, status)).toBe(true);
    }
  });
});
