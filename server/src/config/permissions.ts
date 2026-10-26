export type Role = 'admin' | 'staff';

export type Permission =
  | 'dashboard:read'
  | 'quotes:read'
  | 'quotes:write'
  | 'contacts:read'
  | 'contacts:write'
  | 'registrations:read'
  | 'registrations:write'
  | 'content:read'
  | 'content:write'
  | 'products:read'
  | 'products:stock'
  | 'products:write'
  | 'staff:write'
  | 'settings:write'
  | 'users:manage'
  | 'audit:read'
  | 'exports:read';

const staffPermissions: ReadonlySet<Permission> = new Set<Permission>([
  'dashboard:read',
  'quotes:read',
  'quotes:write',
  'contacts:read',
  'contacts:write',
  'registrations:read',
  'registrations:write',
  'content:read',
  'products:read',
  'products:stock',
  'exports:read'
]);

const allPermissions: Permission[] = [
  'dashboard:read',
  'quotes:read',
  'quotes:write',
  'contacts:read',
  'contacts:write',
  'registrations:read',
  'registrations:write',
  'content:read',
  'content:write',
  'products:read',
  'products:stock',
  'products:write',
  'staff:write',
  'settings:write',
  'users:manage',
  'audit:read',
  'exports:read'
];

export function permissionsForRoles(roles: Role[]): Permission[] {
  if (roles.includes('admin')) return [...allPermissions];
  if (roles.includes('staff')) return [...staffPermissions];
  return [];
}

export function hasPermission(roles: Role[], permission: Permission): boolean {
  if (roles.includes('admin')) return true;
  if (roles.includes('staff')) return staffPermissions.has(permission);
  return false;
}

export function isAdministrativeRole(role: string): role is Role {
  return role === 'admin' || role === 'staff';
}

/** Allowed quote workflow transitions. */
export const QUOTE_STATUS_TRANSITIONS: Record<string, string[]> = {
  New: ['Under Review', 'Rejected'],
  'Under Review': ['Quoted', 'Rejected'],
  Quoted: ['Accepted', 'Rejected'],
  Accepted: ['In Progress', 'Rejected'],
  'In Progress': ['Completed', 'Rejected'],
  Completed: [],
  Rejected: ['Under Review']
};

export const QUOTE_STATUSES = [
  'New',
  'Under Review',
  'Quoted',
  'Accepted',
  'In Progress',
  'Completed',
  'Rejected'
] as const;

export const CONTACT_STATUSES = ['New', 'In Progress', 'Resolved'] as const;
export const REGISTRATION_STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'] as const;

/** Allowed registration workflow transitions. */
export const REGISTRATION_STATUS_TRANSITIONS: Record<string, string[]> = {
  Pending: ['Confirmed', 'Cancelled'],
  Confirmed: ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: ['Pending']
};

export function canTransitionQuote(from: string, to: string): boolean {
  if (from === to) return true;
  return (QUOTE_STATUS_TRANSITIONS[from] ?? []).includes(to);
}

export function canTransitionRegistration(from: string, to: string): boolean {
  if (from === to) return true;
  return (REGISTRATION_STATUS_TRANSITIONS[from] ?? []).includes(to);
}
