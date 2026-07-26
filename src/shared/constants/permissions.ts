export const PERMISSIONS = {
  // Organization
  ORGANIZATION_READ: "organization.read",
  ORGANIZATION_MANAGE: "organization.manage",
  // Billing
  BILLING_READ: "billing.read",
  BILLING_MANAGE: "billing.manage",
  // Churches
  CHURCH_READ: "church.read",
  CHURCH_MANAGE: "church.manage",
  // Cells
  CELLS_READ: "cells.read",
  CELLS_CREATE: "cells.create",
  CELLS_UPDATE: "cells.update",
  CELLS_DELETE: "cells.delete",
  // Members
  MEMBERS_READ: "members.read",
  MEMBERS_MANAGE: "members.manage",
  // Meetings
  MEETINGS_READ: "meetings.read",
  MEETINGS_MANAGE: "meetings.manage",
  // Finance
  FINANCE_READ: "finance.read",
  FINANCE_MANAGE: "finance.manage",
  // Files
  FILES_UPLOAD: "files.upload",
  FILES_READ: "files.read",
  FILES_DELETE: "files.delete",
  // Reports
  REPORTS_READ: "reports.read",
  REPORTS_ADVANCED: "reports.advanced",
  // Audit
  AUDIT_READ: "audit.read",
  // Plans
  PLANS_READ: "plans.read",
} as const;

export const PLATFORM_PERMISSIONS = {
  ORGANIZATIONS_READ: "platform.organizations.read",
  ORGANIZATIONS_MANAGE: "platform.organizations.manage",
  SUBSCRIPTIONS_READ: "platform.subscriptions.read",
  SUBSCRIPTIONS_MANAGE: "platform.subscriptions.manage",
  PAYMENTS_READ: "platform.payments.read",
  SUPPORT_IMPERSONATION: "platform.support.impersonation",
  AUDIT_READ: "platform.audit.read",
} as const;
