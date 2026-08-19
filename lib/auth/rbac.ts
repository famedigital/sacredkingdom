/**
 * Role-Based Access Control (RBAC) System
 * Provides granular permission checking for admin users
 */

// User interface for RBAC
export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions?: string[] | null;
}

/**
 * Normalize permissions from DB/JWT (JSONB default may be `{}`).
 */
export function normalizePermissions(permissions: unknown): string[] {
  return Array.isArray(permissions) ? permissions.filter((p): p is string => typeof p === 'string') : [];
}

/**
 * Check if user has specific permission
 * @param user - Admin user object
 * @param permission - Permission string to check
 * @returns true if user has permission or is admin
 */
export function hasPermission(user: AdminUser, permission: string): boolean {
  // Admins and super_admins have all permissions (case-insensitive)
  const role = user.role?.toLowerCase() ?? '';
  if (role === 'admin' || role === 'super_admin') {
    return true;
  }

  const permissions = normalizePermissions(user.permissions);
  return permissions.includes(permission);
}

/**
 * Require permission or throw error
 * @param user - Admin user object
 * @param permission - Permission string to require
 * @throws Error if user lacks permission
 */
export function requirePermission(user: AdminUser, permission: string): void {
  if (!hasPermission(user, permission)) {
    throw new Error(`Insufficient permissions: ${permission} required`);
  }
}

/**
 * Check if user has any of the specified permissions
 * @param user - Admin user object
 * @param permissions - Array of permissions to check
 * @returns true if user has any of the permissions
 */
export function hasAnyPermission(user: AdminUser, permissions: string[]): boolean {
  return permissions.some(permission => hasPermission(user, permission));
}

/**
 * Check if user has all of the specified permissions
 * @param user - Admin user object
 * @param permissions - Array of permissions to check
 * @returns true if user has all permissions
 */
export function hasAllPermissions(user: AdminUser, permissions: string[]): boolean {
  return permissions.every(permission => hasPermission(user, permission));
}

/**
 * Permission constants for type safety
 */
export const Permissions = {
  // Blog permissions
  BLOG_CREATE: 'blog.create',
  BLOG_READ: 'blog.read',
  BLOG_EDIT: 'blog.edit',
  BLOG_DELETE: 'blog.delete',
  BLOG_PUBLISH: 'blog.publish',

  // Tour permissions
  TOUR_CREATE: 'tour.create',
  TOUR_READ: 'tour.read',
  TOUR_EDIT: 'tour.edit',
  TOUR_DELETE: 'tour.delete',
  TOUR_PUBLISH: 'tour.publish',

  // User management
  USER_MANAGE: 'user.manage',
  USER_READ: 'user.read',

  // Settings management
  SETTINGS_EDIT: 'settings.edit',
  SETTINGS_READ: 'settings.read',

  // Booking management
  BOOKING_MANAGE: 'booking.manage',
  BOOKING_READ: 'booking.read',

  // Inquiry management
  INQUIRY_MANAGE: 'inquiry.manage',
  INQUIRY_READ: 'inquiry.read',

  // Analytics access
  ANALYTICS_VIEW: 'analytics.view',

  // Media management
  MEDIA_UPLOAD: 'media.upload',
  MEDIA_DELETE: 'media.delete',
  MEDIA_MANAGE: 'media.manage',

  // Operations department
  OPERATIONS_READ: 'operations.read',
  OPERATIONS_MANAGE: 'operations.manage',
} as const;

/**
 * Permission groups for easy assignment
 */
export const PermissionGroups = {
  // Full admin access
  ADMIN: Object.values(Permissions),

  // Content management (blog + tours)
  CONTENT_MANAGER: [
    Permissions.BLOG_CREATE,
    Permissions.BLOG_READ,
    Permissions.BLOG_EDIT,
    Permissions.BLOG_DELETE,
    Permissions.BLOG_PUBLISH,
    Permissions.TOUR_CREATE,
    Permissions.TOUR_READ,
    Permissions.TOUR_EDIT,
    Permissions.TOUR_DELETE,
    Permissions.TOUR_PUBLISH,
    Permissions.MEDIA_UPLOAD,
    Permissions.MEDIA_MANAGE,
  ],

  // Blog management only
  BLOG_EDITOR: [
    Permissions.BLOG_CREATE,
    Permissions.BLOG_READ,
    Permissions.BLOG_EDIT,
    Permissions.BLOG_DELETE,
    Permissions.BLOG_PUBLISH,
    Permissions.MEDIA_UPLOAD,
  ],

  // Tour management only
  TOUR_EDITOR: [
    Permissions.TOUR_CREATE,
    Permissions.TOUR_READ,
    Permissions.TOUR_EDIT,
    Permissions.TOUR_DELETE,
    Permissions.TOUR_PUBLISH,
    Permissions.MEDIA_UPLOAD,
  ],

  // Read-only access
  VIEWER: [
    Permissions.BLOG_READ,
    Permissions.TOUR_READ,
    Permissions.USER_READ,
    Permissions.SETTINGS_READ,
    Permissions.BOOKING_READ,
    Permissions.INQUIRY_READ,
    Permissions.ANALYTICS_VIEW,
  ],

  // Customer service
  SUPPORT: [
    Permissions.BOOKING_READ,
    Permissions.BOOKING_MANAGE,
    Permissions.INQUIRY_READ,
    Permissions.INQUIRY_MANAGE,
    Permissions.ANALYTICS_VIEW,
  ],

  // Operations department without full CMS access
  OPERATIONS: [
    Permissions.OPERATIONS_READ,
    Permissions.OPERATIONS_MANAGE,
    Permissions.BOOKING_READ,
    Permissions.BOOKING_MANAGE,
    Permissions.MEDIA_UPLOAD,
  ],
};