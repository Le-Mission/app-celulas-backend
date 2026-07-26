import { PrismaClient } from "@prisma/client";
import { hash } from "node:crypto";

const prisma = new PrismaClient();

// Permission catalog
const permissions = [
  // Organization
  "organization.read",
  "organization.manage",
  // Billing
  "billing.read",
  "billing.manage",
  // Churches
  "church.read",
  "church.manage",
  // Cells
  "cells.read",
  "cells.create",
  "cells.update",
  "cells.delete",
  // Members
  "members.read",
  "members.manage",
  // Meetings
  "meetings.read",
  "meetings.manage",
  // Finance
  "finance.read",
  "finance.manage",
  // Files
  "files.upload",
  "files.read",
  "files.delete",
  // Reports
  "reports.read",
  "reports.advanced",
  // Audit
  "audit.read",
  // Plans
  "plans.read",
  // Platform
  "platform.organizations.read",
  "platform.organizations.manage",
  "platform.subscriptions.read",
  "platform.subscriptions.manage",
  "platform.payments.read",
  "platform.support.impersonation",
  "platform.audit.read",
];

// Role definitions with permissions
const roleDefinitions = [
  {
    name: "ORGANIZATION_OWNER",
    scope: "ORGANIZATION" as const,
    permissions: permissions.filter(
      (p) => !p.startsWith("platform.") && !p.startsWith("reports.advanced")
    ),
  },
  {
    name: "ORGANIZATION_ADMIN",
    scope: "ORGANIZATION" as const,
    permissions: permissions.filter(
      (p) =>
        !p.startsWith("platform.") &&
        !p.startsWith("billing.manage") &&
        !p.startsWith("reports.advanced")
    ),
  },
  {
    name: "BILLING_ADMIN",
    scope: "ORGANIZATION" as const,
    permissions: [
      "organization.read",
      "billing.read",
      "billing.manage",
      "church.read",
      "members.read",
      "audit.read",
    ],
  },
  {
    name: "SUPPORT_ADMIN",
    scope: "ORGANIZATION" as const,
    permissions: [
      "organization.read",
      "church.read",
      "members.read",
      "audit.read",
    ],
  },
  {
    name: "CHURCH_ADMIN",
    scope: "CHURCH" as const,
    permissions: permissions.filter(
      (p) =>
        !p.startsWith("platform.") &&
        !p.startsWith("billing.") &&
        !p.startsWith("organization.") &&
        !p.startsWith("reports.advanced")
    ),
  },
  {
    name: "PASTOR",
    scope: "CHURCH" as const,
    permissions: [
      "church.read",
      "cells.read",
      "cells.create",
      "cells.update",
      "members.read",
      "members.manage",
      "meetings.read",
      "meetings.manage",
      "files.upload",
      "files.read",
    ],
  },
  {
    name: "LEADER",
    scope: "CELL" as const,
    permissions: [
      "church.read",
      "cells.read",
      "cells.update",
      "members.read",
      "meetings.read",
      "meetings.manage",
      "files.upload",
      "files.read",
    ],
  },
  {
    name: "SECRETARY",
    scope: "CHURCH" as const,
    permissions: [
      "church.read",
      "cells.read",
      "members.read",
      "members.manage",
      "meetings.read",
      "meetings.manage",
      "files.upload",
      "files.read",
      "reports.read",
    ],
  },
  {
    name: "TREASURER",
    scope: "CHURCH" as const,
    permissions: [
      "church.read",
      "members.read",
      "finance.read",
      "finance.manage",
      "reports.read",
      "audit.read",
    ],
  },
  {
    name: "MEMBER",
    scope: "CHURCH" as const,
    permissions: ["church.read", "cells.read", "members.read"],
  },
];

// Platform roles
const platformRoleDefinitions = [
  {
    name: "PLATFORM_OWNER",
    permissions: permissions.filter((p) => p.startsWith("platform.")),
  },
  {
    name: "PLATFORM_ADMIN",
    permissions: permissions.filter(
      (p) =>
        p.startsWith("platform.") && !p.includes("impersonation")
    ),
  },
  {
    name: "PLATFORM_SUPPORT",
    permissions: [
      "platform.organizations.read",
      "platform.subscriptions.read",
      "platform.payments.read",
      "platform.support.impersonation",
    ],
  },
  {
    name: "PLATFORM_FINANCE",
    permissions: [
      "platform.organizations.read",
      "platform.subscriptions.read",
      "platform.payments.read",
    ],
  },
  {
    name: "PLATFORM_READONLY",
    permissions: [
      "platform.organizations.read",
      "platform.subscriptions.read",
      "platform.payments.read",
    ],
  },
];

// Dev plans
const devPlans = [
  {
    code: "SOLO" as const,
    name: "Solo",
    description: "Ideal para igrejas pequenas com até 1 célula",
    billingInterval: "MONTHLY" as const,
    priceInCents: 2990,
    trialDays: 14,
    isPublic: true,
    status: "ACTIVE" as const,
    features: [
      { featureKey: "churches.max", valueType: "NUMBER" as const, limitType: "FIXED" as const, numericValue: BigInt(1) },
      { featureKey: "members.max", valueType: "NUMBER" as const, limitType: "FIXED" as const, numericValue: BigInt(50) },
      { featureKey: "cells.max", valueType: "NUMBER" as const, limitType: "FIXED" as const, numericValue: BigInt(3) },
      { featureKey: "users.max", valueType: "NUMBER" as const, limitType: "FIXED" as const, numericValue: BigInt(5) },
      { featureKey: "storage.bytes", valueType: "NUMBER" as const, limitType: "FIXED" as const, numericValue: BigInt(1073741824) },
      { featureKey: "advanced_reports", valueType: "BOOLEAN" as const, booleanValue: false },
      { featureKey: "financial_module", valueType: "BOOLEAN" as const, booleanValue: false },
      { featureKey: "custom_branding", valueType: "BOOLEAN" as const, booleanValue: false },
      { featureKey: "priority_support", valueType: "BOOLEAN" as const, booleanValue: false },
      { featureKey: "export_data", valueType: "BOOLEAN" as const, booleanValue: false },
      { featureKey: "multi_church", valueType: "BOOLEAN" as const, booleanValue: false },
    ],
  },
  {
    code: "LOCAL" as const,
    name: "Local",
    description: "Para igrejas em crescimento com múltiplas células",
    billingInterval: "MONTHLY" as const,
    priceInCents: 7990,
    trialDays: 14,
    isPublic: true,
    status: "ACTIVE" as const,
    features: [
      { featureKey: "churches.max", valueType: "NUMBER" as const, limitType: "FIXED" as const, numericValue: BigInt(3) },
      { featureKey: "members.max", valueType: "NUMBER" as const, limitType: "FIXED" as const, numericValue: BigInt(500) },
      { featureKey: "cells.max", valueType: "NUMBER" as const, limitType: "FIXED" as const, numericValue: BigInt(20) },
      { featureKey: "users.max", valueType: "NUMBER" as const, limitType: "FIXED" as const, numericValue: BigInt(25) },
      { featureKey: "storage.bytes", valueType: "NUMBER" as const, limitType: "FIXED" as const, numericValue: BigInt(5368709120) },
      { featureKey: "advanced_reports", valueType: "BOOLEAN" as const, booleanValue: true },
      { featureKey: "financial_module", valueType: "BOOLEAN" as const, booleanValue: true },
      { featureKey: "custom_branding", valueType: "BOOLEAN" as const, booleanValue: false },
      { featureKey: "priority_support", valueType: "BOOLEAN" as const, booleanValue: false },
      { featureKey: "export_data", valueType: "BOOLEAN" as const, booleanValue: true },
      { featureKey: "multi_church", valueType: "BOOLEAN" as const, booleanValue: true },
    ],
  },
  {
    code: "INSTITUTIONAL" as const,
    name: "Institucional",
    description: "Para redes e denominações com múltiplas igrejas",
    billingInterval: "MONTHLY" as const,
    priceInCents: 19990,
    trialDays: 30,
    isPublic: true,
    status: "ACTIVE" as const,
    features: [
      { featureKey: "churches.max", valueType: "NUMBER" as const, limitType: "UNLIMITED" as const, numericValue: BigInt(-1) },
      { featureKey: "members.max", valueType: "NUMBER" as const, limitType: "UNLIMITED" as const, numericValue: BigInt(-1) },
      { featureKey: "cells.max", valueType: "NUMBER" as const, limitType: "UNLIMITED" as const, numericValue: BigInt(-1) },
      { featureKey: "users.max", valueType: "NUMBER" as const, limitType: "UNLIMITED" as const, numericValue: BigInt(-1) },
      { featureKey: "storage.bytes", valueType: "NUMBER" as const, limitType: "UNLIMITED" as const, numericValue: BigInt(-1) },
      { featureKey: "advanced_reports", valueType: "BOOLEAN" as const, booleanValue: true },
      { featureKey: "financial_module", valueType: "BOOLEAN" as const, booleanValue: true },
      { featureKey: "custom_branding", valueType: "BOOLEAN" as const, booleanValue: true },
      { featureKey: "priority_support", valueType: "BOOLEAN" as const, booleanValue: true },
      { featureKey: "export_data", valueType: "BOOLEAN" as const, booleanValue: true },
      { featureKey: "multi_church", valueType: "BOOLEAN" as const, booleanValue: true },
    ],
  },
];

async function main() {
  console.log("Seeding permissions...");
  for (const key of permissions) {
    await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key, description: `Permission: ${key}` },
    });
  }

  console.log("Seeding roles...");
  for (const def of roleDefinitions) {
    const role = await prisma.role.upsert({
      where: { id: hash("md5", def.name) },
      update: {},
      create: {
        id: hash("md5", def.name),
        name: def.name,
        scope: def.scope,
        description: `Role: ${def.name}`,
      },
    });

    // Clear existing permissions and re-add
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    for (const permKey of def.permissions) {
      const perm = await prisma.permission.findUnique({ where: { key: permKey } });
      if (perm) {
        await prisma.rolePermission.create({
          data: { roleId: role.id, permissionId: perm.id },
        });
      }
    }
  }

  console.log("Seeding dev plans...");
  for (const planData of devPlans) {
    const { features, ...planFields } = planData;
    const plan = await prisma.plan.upsert({
      where: { code: planFields.code },
      update: planFields,
      create: planFields,
    });

    for (const feat of features) {
      await prisma.planFeature.upsert({
        where: { planId_featureKey: { planId: plan.id, featureKey: feat.featureKey } },
        update: feat,
        create: { ...feat, planId: plan.id },
      });
    }
  }

  console.log("Seed completed successfully.");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
