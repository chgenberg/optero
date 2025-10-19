# Role-Based Access Control (RBAC) Guide

## Overview

The system implements a comprehensive role-based access control system with three distinct roles: **Admin**, **User**, and **Viewer**.

## Roles

### 👑 Admin
**Full system access including user and bot management**

#### Permissions
- ✅ Create, edit, and delete bots
- ✅ View all bots
- ✅ Manage users (invite, change roles, delete)
- ✅ Invite new users
- ✅ View all users
- ✅ Manage company settings
- ✅ View analytics
- ✅ Chat with internal bot
- ✅ Upload documents
- ✅ Export conversations

#### Use Cases
- Company administrators
- IT managers
- System owners

### 👤 User
**Standard user access for daily operations**

#### Permissions
- ✅ View bots
- ✅ Edit bot configurations
- ✅ View other users
- ✅ View analytics
- ✅ Chat with internal bot
- ✅ Upload documents
- ✅ Export conversations
- ❌ Create or delete bots
- ❌ Manage users
- ❌ Manage company settings

#### Use Cases
- Regular employees
- Team members
- Content contributors

### 👁️ Viewer
**Read-only access for observation purposes**

#### Permissions
- ✅ View bots
- ✅ View users
- ✅ Chat with internal bot (read-only)
- ❌ Edit anything
- ❌ Upload documents
- ❌ Export conversations
- ❌ Manage users or settings

#### Use Cases
- Stakeholders
- Observers
- Auditors

## Setup

### 1. Database Migration

Run the migration to add role support:

```bash
npx prisma migrate dev --name add-rbac
```

### 2. Seed Demo Data

Create demo users with different roles:

```bash
npx ts-node scripts/seed-demo-company.ts
```

This creates:
- **Admin**: admin@company.com / demo123
- **User**: user@company.com / demo123
- **Viewer**: viewer@company.com / demo123

### 3. Company Code

Use company code `DEMO2024` for signup.

## Usage

### Checking Permissions

```typescript
import { hasPermission, Permission, UserRole } from '@/lib/rbac';

// Check if user has specific permission
const canCreateBot = hasPermission(
  UserRole.USER, 
  Permission.CREATE_BOT
);

// Check if user has any of multiple permissions
const canEdit = hasAnyPermission(
  userRole,
  [Permission.EDIT_BOT, Permission.MANAGE_USERS]
);
```

### API Route Protection

```typescript
import { requireRole, requirePermission } from '@/middleware/role-guard';
import { UserRole, Permission } from '@/lib/rbac';

// Require specific role
export async function POST(request: NextRequest) {
  const roleCheck = requireRole([UserRole.ADMIN]);
  if (roleCheck) return roleCheck;
  
  // Admin-only logic here
}

// Require specific permission
export async function DELETE(request: NextRequest) {
  const permCheck = requirePermission(Permission.DELETE_BOT);
  if (permCheck) return permCheck;
  
  // Delete logic here
}
```

### Frontend Role Checks

```tsx
'use client';

import { useEffect, useState } from 'react';

export default function MyComponent() {
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => res.json())
      .then(data => setUser(data));
  }, []);
  
  return (
    <div>
      {user?.role === 'ADMIN' && (
        <button onClick={handleAdminAction}>
          Admin Action
        </button>
      )}
      
      {user?.role !== 'VIEWER' && (
        <input type="file" />
      )}
    </div>
  );
}
```

## Admin Panel

Access the admin panel at `/internal/admin` (Admin only).

### Features
- View all company users
- Change user roles
- Delete users
- Invite new users
- User activity statistics

### Security Rules
- Cannot delete yourself
- Cannot remove the last admin
- Can only manage users in your company
- All actions are logged

## Role Hierarchy

```
ADMIN (Level 3)
  ├─ Can manage USER
  ├─ Can manage VIEWER
  └─ Can manage other ADMINS

USER (Level 2)
  ├─ Can view other users
  └─ Cannot manage anyone

VIEWER (Level 1)
  └─ Can only view
```

## Custom Permissions

You can add custom permissions to individual users via the `permissions` JSON field:

```typescript
// In database or API
await prisma.user.update({
  where: { id: userId },
  data: {
    permissions: ['special_feature', 'beta_access']
  }
});

// Check custom permission
hasPermission(
  userRole,
  'special_feature' as Permission,
  user.permissions
);
```

## Best Practices

### 1. Principle of Least Privilege
- Start users as VIEWER
- Promote to USER as needed
- Only essential people as ADMIN

### 2. Regular Audits
- Review user roles quarterly
- Remove inactive users
- Check for unused permissions

### 3. Onboarding
- New employees start as USER
- Temporary access as VIEWER
- Contractors limited to specific permissions

### 4. Offboarding
- Immediately downgrade to VIEWER
- Delete after data export
- Review access logs

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login with role info
- `GET /api/auth/me` - Get current user with role
- `POST /api/auth/signup` - Signup (first user becomes admin)
- `POST /api/auth/logout` - Logout

### Admin Endpoints
- `GET /api/admin/users` - List all company users (Admin only)
- `PATCH /api/admin/users/:id/role` - Change user role (Admin only)
- `DELETE /api/admin/users/:id` - Delete user (Admin only)

## Troubleshooting

### Cannot access admin panel
- Verify you have ADMIN role: `GET /api/auth/me`
- Check company membership
- Clear cookies and re-login

### Cannot change user role
- Only admins can change roles
- Cannot remove last admin
- Cannot change users from other companies

### Permission denied errors
- Check user role matches required permissions
- Verify JWT token is valid
- Ensure user is in correct company

## Future Enhancements

### Planned Features
- [ ] Fine-grained permissions per bot
- [ ] Team-based access control
- [ ] Time-limited role assignments
- [ ] Approval workflows
- [ ] Audit log viewer
- [ ] Role templates
- [ ] SCIM integration

### Security Roadmap
- [ ] 2FA for admin accounts
- [ ] IP whitelisting
- [ ] Session management
- [ ] Anomaly detection
- [ ] Compliance reporting

## Support

For questions or issues with RBAC:
- Check `/internal/admin` for user management
- Review this guide for permissions
- Contact admin@company.com for access requests
