import { hasAnyPermission, Permissions, type AdminUser } from '@/lib/auth/rbac';
import type { TokenPayload } from '@/lib/auth/jwt';

export function toAdminUser(user: TokenPayload): AdminUser {
  return {
    id: user.userId,
    email: user.email,
    name: user.name,
    role: user.role,
    permissions: user.permissions,
  };
}

export function canReadOperations(user: TokenPayload): boolean {
  return hasAnyPermission(toAdminUser(user), [
    Permissions.OPERATIONS_READ,
    Permissions.OPERATIONS_MANAGE,
    Permissions.BOOKING_READ,
    Permissions.BOOKING_MANAGE,
  ]);
}

export function canManageOperations(user: TokenPayload): boolean {
  return hasAnyPermission(toAdminUser(user), [
    Permissions.OPERATIONS_MANAGE,
    Permissions.BOOKING_MANAGE,
  ]);
}
