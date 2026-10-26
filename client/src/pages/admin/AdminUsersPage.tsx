import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, ShieldCheck, UserCog } from 'lucide-react';
import {
  AdminPageHeader,
  FilterBar,
  FilterSelect,
  SearchInput,
  TableEmpty,
  TableWrap
} from '../../components/admin/AdminUi';
import { Alert, ErrorBlock, LoadingBlock } from '../../components/ui/Feedback';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Overlay';
import { Pagination } from '../../components/ui/Pagination';
import { useAdminList, useDebouncedValue, type AdminListParams } from '../../hooks/useAdminList';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { formatDate } from '../../lib/format';
import { updateUserRoles } from '../../services/admin';
import type { PublicUserRow } from '../../types';

type Role = 'admin' | 'staff';

const ROLE_HELP: Record<Role, string> = {
  admin:
    'Full access, including content publishing, products, staff profiles, settings, user roles, audit logs and exports.',
  staff:
    'Operational access only: enquiries, registrations, read-only content and stock adjustments. No settings, user, profile or publishing rights.'
};

function RolesModal({
  user,
  isSelf,
  onClose,
  onSaved
}: {
  user: PublicUserRow;
  isSelf: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const toast = useToast();
  const [roles, setRoles] = useState<Role[]>(user.roles);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setRoles(user.roles);
    setError(null);
  }, [user]);

  const toggle = (role: Role) => {
    setRoles((current) =>
      current.includes(role) ? current.filter((entry) => entry !== role) : [...current, role]
    );
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateUserRoles(user.id, roles);
      toast.success('Roles updated', `${user.full_name || user.email} now has ${roles.length} role${roles.length === 1 ? '' : 's'}.`);
      onSaved();
      onClose();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'The roles could not be updated.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title="Manage user roles"
      description={`${user.full_name || 'Unnamed user'} · ${user.email}`}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={() => void save()} loading={saving}>
            Save roles
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {error ? (
          <Alert tone="danger" title="Not saved">
            <p>{error}</p>
          </Alert>
        ) : null}

        {isSelf ? (
          <Alert tone="warning" title="This is your account">
            <p>
              Your own administrator role cannot be removed here. Ask another administrator to review
              it if necessary.
            </p>
          </Alert>
        ) : null}

        {(['admin', 'staff'] as const).map((role) => {
          const checked = roles.includes(role);
          const locked = isSelf && role === 'admin' && user.roles.includes('admin');
          return (
            <label
              key={role}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                checked ? 'border-teal-300 bg-teal-50/50' : 'border-slate-200 bg-white'
              }`}
            >
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                checked={checked}
                disabled={locked}
                onChange={() => toggle(role)}
              />
              <span>
                <span className="block text-sm font-semibold capitalize text-navy-900">{role}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">
                  {ROLE_HELP[role]}
                </span>
              </span>
            </label>
          );
        })}

        <p className="text-xs leading-5 text-slate-500">
          Removing every role prevents access to the administration area. The server also prevents
          removing the final administrator.
        </p>
      </div>
    </Modal>
  );
}

export function AdminUsersPage() {
  const { me } = useAuth();
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [sort, setSort] = useState('created_at:desc');
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<PublicUserRow | null>(null);

  const params = useMemo<AdminListParams>(() => {
    const [nextSort, nextOrder] = sort.split(':');
    return {
      page,
      pageSize: 20,
      search: debouncedSearch || undefined,
      sort: nextSort,
      order: nextOrder === 'asc' ? 'asc' : 'desc'
    };
  }, [page, debouncedSearch, sort]);

  const { items, total, totalPages, loading, error, reload } = useAdminList<PublicUserRow>(
    '/admin/users',
    params
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sort]);

  return (
    <>
      <AdminPageHeader
        title="Users & roles"
        description="Review registered accounts and assign administrative roles. Accounts are created in Supabase Auth by an operator; this website has no public administrator registration."
        actions={
          <Button variant="outline" small onClick={reload}>
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </Button>
        }
      />

      <div className="mb-5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs leading-5 text-slate-500">
        <ShieldCheck className="mb-1 h-4 w-4 text-teal-600" aria-hidden="true" />
        A user with no role cannot access the administration area. Only administrators can change
        roles, and every change is recorded in the activity log.
      </div>

      <FilterBar>
        <SearchInput value={search} onChange={setSearch} placeholder="Search name or email" />
        <FilterSelect label="Sort" value={sort} onChange={setSort}>
          <option value="created_at:desc">Newest accounts</option>
          <option value="created_at:asc">Oldest accounts</option>
          <option value="full_name:asc">Name A–Z</option>
          <option value="email:asc">Email A–Z</option>
        </FilterSelect>
        <span className="ml-auto text-xs text-slate-500">
          {total} account{total === 1 ? '' : 's'}
        </span>
      </FilterBar>

      {error ? (
        <ErrorBlock message={error} onRetry={reload} />
      ) : loading && items.length === 0 ? (
        <LoadingBlock label="Loading user accounts" rows={4} />
      ) : (
        <>
          <TableWrap>
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">Roles</th>
                  <th className="px-4 py-3 font-semibold">Account created</th>
                  <th className="px-4 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.length === 0 ? (
                  <TableEmpty
                    colSpan={5}
                    message={
                      debouncedSearch
                        ? 'No accounts match this search.'
                        : 'No accounts have profiles yet.'
                    }
                  />
                ) : (
                  items.map((user) => (
                    <tr key={user.id} className="transition hover:bg-slate-50/70">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-navy-900">
                          {user.full_name || 'Unnamed user'}
                          {me?.user.id === user.id ? (
                            <span className="ml-2 text-[10px] font-semibold uppercase tracking-wide text-teal-700">
                              You
                            </span>
                          ) : null}
                        </p>
                        <p className="text-[11px] text-slate-400">{user.phone || 'No phone'}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{user.email}</td>
                      <td className="px-4 py-3">
                        {user.roles.length === 0 ? (
                          <Badge tone="neutral">No access</Badge>
                        ) : (
                          <div className="flex flex-wrap gap-1.5">
                            {user.roles.map((role) => (
                              <Badge key={role} tone={role === 'admin' ? 'teal' : 'info'}>
                                {role}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {formatDate(user.created_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="outline" small onClick={() => setSelectedUser(user)}>
                          <UserCog className="h-3.5 w-3.5" aria-hidden="true" />
                          Manage roles
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </TableWrap>

          <div className="mt-4">
            <Pagination page={page} totalPages={totalPages} total={total} onChange={setPage} />
          </div>
        </>
      )}

      {selectedUser ? (
        <RolesModal
          user={selectedUser}
          isSelf={me?.user.id === selectedUser.id}
          onClose={() => setSelectedUser(null)}
          onSaved={reload}
        />
      ) : null}
    </>
  );
}
