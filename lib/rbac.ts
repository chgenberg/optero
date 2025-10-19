// Role-Based Access Control (RBAC) utilities

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
  VIEWER = 'VIEWER'
}

export enum Permission {
  // Bot management
  CREATE_BOT = 'create_bot',
  EDIT_BOT = 'edit_bot',
  DELETE_BOT = 'delete_bot',
  VIEW_BOT = 'view_bot',
  
  // User management
  MANAGE_USERS = 'manage_users',
  INVITE_USERS = 'invite_users',
  VIEW_USERS = 'view_users',
  
  // Company settings
  MANAGE_COMPANY = 'manage_company',
  VIEW_ANALYTICS = 'view_analytics',
  
  // Internal bot
  CHAT_INTERNAL = 'chat_internal',
  UPLOAD_DOCUMENTS = 'upload_documents',
  EXPORT_CONVERSATIONS = 'export_conversations'
}

// Role permission matrix
export const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Full access
    Permission.CREATE_BOT,
    Permission.EDIT_BOT,
    Permission.DELETE_BOT,
    Permission.VIEW_BOT,
    Permission.MANAGE_USERS,
    Permission.INVITE_USERS,
    Permission.VIEW_USERS,
    Permission.MANAGE_COMPANY,
    Permission.VIEW_ANALYTICS,
    Permission.CHAT_INTERNAL,
    Permission.UPLOAD_DOCUMENTS,
    Permission.EXPORT_CONVERSATIONS
  ],
  [UserRole.USER]: [
    // Standard user access
    Permission.VIEW_BOT,
    Permission.EDIT_BOT,
    Permission.VIEW_USERS,
    Permission.VIEW_ANALYTICS,
    Permission.CHAT_INTERNAL,
    Permission.UPLOAD_DOCUMENTS,
    Permission.EXPORT_CONVERSATIONS
  ],
  [UserRole.VIEWER]: [
    // Read-only access
    Permission.VIEW_BOT,
    Permission.VIEW_USERS,
    Permission.CHAT_INTERNAL
  ]
};

// Role metadata
export const roleMetadata = {
  [UserRole.ADMIN]: {
    label: 'Admin',
    description: 'Full system access including user and bot management',
    color: 'red',
    icon: 'Shield'
  },
  [UserRole.USER]: {
    label: 'User',
    description: 'Can use bots, edit configurations, and access analytics',
    color: 'blue',
    icon: 'User'
  },
  [UserRole.VIEWER]: {
    label: 'Viewer',
    description: 'Read-only access to bots and conversations',
    color: 'gray',
    icon: 'Eye'
  }
};

/**
 * Check if a user has a specific permission
 */
export function hasPermission(
  userRole: UserRole,
  permission: Permission,
  customPermissions?: Permission[]
): boolean {
  // Check custom permissions first
  if (customPermissions?.includes(permission)) {
    return true;
  }
  
  // Check role-based permissions
  return rolePermissions[userRole]?.includes(permission) || false;
}

/**
 * Check if a user has any of the specified permissions
 */
export function hasAnyPermission(
  userRole: UserRole,
  permissions: Permission[],
  customPermissions?: Permission[]
): boolean {
  return permissions.some(permission => 
    hasPermission(userRole, permission, customPermissions)
  );
}

/**
 * Check if a user has all of the specified permissions
 */
export function hasAllPermissions(
  userRole: UserRole,
  permissions: Permission[],
  customPermissions?: Permission[]
): boolean {
  return permissions.every(permission => 
    hasPermission(userRole, permission, customPermissions)
  );
}

/**
 * Get all permissions for a role
 */
export function getRolePermissions(
  role: UserRole,
  customPermissions?: Permission[]
): Permission[] {
  const basePermissions = rolePermissions[role] || [];
  return customPermissions 
    ? [...new Set([...basePermissions, ...customPermissions])]
    : basePermissions;
}

/**
 * Check if role A can manage role B
 */
export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  const roleHierarchy = {
    [UserRole.ADMIN]: 3,
    [UserRole.USER]: 2,
    [UserRole.VIEWER]: 1
  };
  
  return roleHierarchy[managerRole] >= roleHierarchy[targetRole];
}

/**
 * Validate role change
 */
export function canChangeRole(
  currentUserRole: UserRole,
  targetUserRole: UserRole,
  newRole: UserRole
): boolean {
  // Only admins can change roles
  if (currentUserRole !== UserRole.ADMIN) {
    return false;
  }
  
  // Can't change your own role if you're the last admin
  // (This check should be done with DB query in actual implementation)
  
  return canManageRole(currentUserRole, targetUserRole) && 
         canManageRole(currentUserRole, newRole);
}
