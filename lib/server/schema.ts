import { sqliteTable, text, integer, real, uniqueIndex, index } from "drizzle-orm/sqlite-core";

// String union types for status/type columns
export type UserStatus = "active" | "admin" | "suspended" | "deleted";
export type SubscriptionStatus = "active" | "grace_period" | "expired" | "cancelled";
export type BondStatus = "active" | "archived";
export type BondEntryMethod = "manual" | "csv" | "xlsx" | "ocr";
export type PaymentStatus = "pending" | "approved" | "rejected";
export type ImportJobStatus = "pending" | "processing" | "completed" | "failed";
export type ImportJobFileType = "csv" | "xlsx";
export type MatchStatus = "unseen" | "viewed";
export type NotificationBatchStatus = "pending" | "sent" | "failed";
export type NotificationStatus = "pending" | "sent" | "failed" | "read";
export type NotificationChannel = "email" | "whatsapp" | "sms";
export type DrawImportJobStatus = "pending" | "processing" | "completed" | "failed";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
  phone: text("phone"),
  phoneVerified: integer("phone_verified", { mode: "boolean" }).notNull().default(false),
  whatsappNumber: text("whatsapp_number"),
  whatsappVerified: integer("whatsapp_verified", { mode: "boolean" }).notNull().default(false),
  name: text("name").notNull().default(""),
  image: text("image"),
  fullName: text("full_name"),
  status: text("status").$type<UserStatus>().notNull().default("active"),
  lastLoginAt: text("last_login_at"),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
  updatedAt: text("updated_at").notNull().default("(datetime('now'))"),
  deletedAt: text("deleted_at"),
}, (table) => [
  index("idx_users_email").on(table.email),
  index("idx_users_status").on(table.status),
]);

export const sessions = sqliteTable("session", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: text("expires_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
  updatedAt: text("updated_at").notNull().default("(datetime('now'))"),
}, (table) => [
  index("idx_sessions_user_id").on(table.userId),
  index("idx_sessions_token").on(table.token),
]);

export const accounts = sqliteTable("account", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  password: text("password_hash"),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  expiresAt: text("expires_at"),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
  updatedAt: text("updated_at").notNull().default("(datetime('now'))"),
}, (table) => [
  index("idx_accounts_user_id").on(table.userId),
]);

export const verifications = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
  updatedAt: text("updated_at").notNull().default("(datetime('now'))"),
});

export const userPreferences = sqliteTable("user_preferences", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  timezone: text("timezone"),
  language: text("language"),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
  updatedAt: text("updated_at").notNull().default("(datetime('now'))"),
}, (table) => [
  uniqueIndex("idx_user_prefs_user_id").on(table.userId),
]);

export const notificationPreferences = sqliteTable("notification_preferences", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  emailEnabled: integer("email_enabled", { mode: "boolean" }).notNull().default(true),
  whatsappEnabled: integer("whatsapp_enabled", { mode: "boolean" }).notNull().default(false),
  smsEnabled: integer("sms_enabled", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
  updatedAt: text("updated_at").notNull().default("(datetime('now'))"),
}, (table) => [
  uniqueIndex("idx_notif_prefs_user_id").on(table.userId),
]);

export const plans = sqliteTable("plans", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  priceUsd: real("price_usd").notNull(),
  durationDays: integer("duration_days").notNull(),
  ocrLimit: integer("ocr_limit").notNull(),
  importsEnabled: integer("imports_enabled", { mode: "boolean" }).notNull(),
  alertsEnabled: integer("alerts_enabled", { mode: "boolean" }).notNull(),
  exportsEnabled: integer("exports_enabled", { mode: "boolean" }).notNull(),
  autoMonitoringEnabled: integer("auto_monitoring_enabled", { mode: "boolean" }).notNull(),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
  updatedAt: text("updated_at").notNull().default("(datetime('now'))"),
});

export const subscriptions = sqliteTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  planId: text("plan_id").notNull().references(() => plans.id),
  status: text("status").$type<SubscriptionStatus>().notNull().default("active"),
  startedAt: text("started_at").notNull(),
  expiresAt: text("expires_at").notNull(),
  graceEndsAt: text("grace_ends_at"),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
  updatedAt: text("updated_at").notNull().default("(datetime('now'))"),
}, (table) => [
  index("idx_subs_user_id").on(table.userId),
  index("idx_subs_status").on(table.status),
  index("idx_subs_expires_at").on(table.expiresAt),
]);

export const subscriptionHistory = sqliteTable("subscription_history", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  planId: text("plan_id").notNull().references(() => plans.id),
  amountPaid: real("amount_paid").notNull(),
  startedAt: text("started_at").notNull(),
  expiredAt: text("expired_at").notNull(),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});

export const bonds = sqliteTable("bonds", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bondNumber: text("bond_number").notNull(),
  denomination: integer("denomination").notNull(),
  status: text("status").$type<BondStatus>().notNull().default("active"),
  entryMethod: text("entry_method").$type<BondEntryMethod>().notNull().default("manual"),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
  updatedAt: text("updated_at").notNull().default("(datetime('now'))"),
  deletedAt: text("deleted_at"),
}, (table) => [
  uniqueIndex("idx_bonds_user_denom_num").on(table.userId, table.denomination, table.bondNumber),
  index("idx_bonds_user_id").on(table.userId),
  index("idx_bonds_bond_number").on(table.bondNumber),
  index("idx_bonds_denomination").on(table.denomination),
  index("idx_bonds_status").on(table.status),
  index("idx_bonds_user_denomination").on(table.userId, table.denomination),
  index("idx_bonds_user_status").on(table.userId, table.status),
]);

export const ocrUsage = sqliteTable("ocr_usage", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  year: integer("year").notNull(),
  month: integer("month").notNull(),
  successfulScans: integer("successful_scans").notNull().default(0),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
  updatedAt: text("updated_at").notNull().default("(datetime('now'))"),
}, (table) => [
  uniqueIndex("idx_ocr_usage_user_period").on(table.userId, table.year, table.month),
]);

export const importJobs = sqliteTable("import_jobs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  fileType: text("file_type").$type<ImportJobFileType>().notNull(),
  status: text("status").$type<ImportJobStatus>().notNull().default("pending"),
  totalRecords: integer("total_records").notNull().default(0),
  successfulRecords: integer("successful_records").notNull().default(0),
  duplicateRecords: integer("duplicate_records").notNull().default(0),
  invalidRecords: integer("invalid_records").notNull().default(0),
  r2FileKey: text("r2_file_key"),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
  updatedAt: text("updated_at").notNull().default("(datetime('now'))"),
  deletedAt: text("deleted_at"),
});

export const payments = sqliteTable("payments", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  planId: text("plan_id").notNull().references(() => plans.id),
  amount: real("amount").notNull(),
  paymentMethod: text("payment_method"),
  status: text("status").$type<PaymentStatus>().notNull().default("pending"),
  reviewedBy: text("reviewed_by"),
  reviewedAt: text("reviewed_at"),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
  updatedAt: text("updated_at").notNull().default("(datetime('now'))"),
  deletedAt: text("deleted_at"),
}, (table) => [
  index("idx_payments_user_id").on(table.userId),
  index("idx_payments_status").on(table.status),
]);

export const paymentReceipts = sqliteTable("payment_receipts", {
  id: text("id").primaryKey(),
  paymentId: text("payment_id").notNull().references(() => payments.id, { onDelete: "cascade" }),
  r2FileKey: text("r2_file_key").notNull(),
  hash: text("hash").notNull(),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});

export const draws = sqliteTable("draws", {
  id: text("id").primaryKey(),
  denomination: integer("denomination").notNull(),
  drawNumber: text("draw_number"),
  drawDate: text("draw_date").notNull(),
  source: text("source"),
  pdfR2Key: text("pdf_r2_key"),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
  updatedAt: text("updated_at").notNull().default("(datetime('now'))"),
}, (table) => [
  index("idx_draws_denomination").on(table.denomination),
  index("idx_draws_draw_date").on(table.drawDate),
]);

export const drawImportJobs = sqliteTable("draw_import_jobs", {
  id: text("id").primaryKey(),
  drawId: text("draw_id").references(() => draws.id),
  status: text("status").$type<DrawImportJobStatus>().notNull().default("pending"),
  startedAt: text("started_at"),
  completedAt: text("completed_at"),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});

export const winningNumbers = sqliteTable("winning_numbers", {
  id: text("id").primaryKey(),
  drawId: text("draw_id").notNull().references(() => draws.id, { onDelete: "cascade" }),
  bondNumber: text("bond_number").notNull(),
  prizeType: text("prize_type").notNull(),
  prizeAmount: real("prize_amount").notNull(),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
}, (table) => [
  index("idx_winning_draw_id").on(table.drawId),
  index("idx_winning_bond_number").on(table.bondNumber),
  index("idx_winning_draw_bond").on(table.drawId, table.bondNumber),
]);

export const matches = sqliteTable("matches", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  bondId: text("bond_id").notNull().references(() => bonds.id, { onDelete: "cascade" }),
  winningNumberId: text("winning_number_id").notNull().references(() => winningNumbers.id, { onDelete: "cascade" }),
  drawId: text("draw_id").notNull().references(() => draws.id),
  bondNumberSnapshot: text("bond_number_snapshot"),
  denominationSnapshot: integer("denomination_snapshot"),
  prizeTypeSnapshot: text("prize_type_snapshot"),
  prizeAmountSnapshot: real("prize_amount_snapshot"),
  drawDateSnapshot: text("draw_date_snapshot"),
  status: text("status").$type<MatchStatus>().notNull().default("unseen"),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
  updatedAt: text("updated_at").notNull().default("(datetime('now'))"),
}, (table) => [
  index("idx_matches_user_id").on(table.userId),
  index("idx_matches_bond_id").on(table.bondId),
  index("idx_matches_draw_id").on(table.drawId),
  index("idx_matches_status").on(table.status),
  index("idx_matches_user_status").on(table.userId, table.status),
]);

export const notificationBatches = sqliteTable("notification_batches", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  channel: text("channel").$type<NotificationChannel>().notNull(),
  matchCount: integer("match_count").notNull(),
  status: text("status").$type<NotificationBatchStatus>().notNull().default("pending"),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
});

export const notifications = sqliteTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  batchId: text("batch_id").references(() => notificationBatches.id),
  channel: text("channel").$type<NotificationChannel>().notNull(),
  title: text("title"),
  message: text("message"),
  status: text("status").$type<NotificationStatus>().notNull().default("pending"),
  sentAt: text("sent_at"),
  readAt: text("read_at"),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
}, (table) => [
  index("idx_notifications_user_id").on(table.userId),
  index("idx_notifications_status").on(table.status),
]);

export const auditLogs = sqliteTable("audit_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id"),
  action: text("action").notNull(),
  entityType: text("entity_type"),
  entityId: text("entity_id"),
  ipAddress: text("ip_address"),
  metadataJson: text("metadata_json"),
  createdAt: text("created_at").notNull().default("(datetime('now'))"),
}, (table) => [
  index("idx_audit_user_id").on(table.userId),
  index("idx_audit_entity_type").on(table.entityType),
  index("idx_audit_created_at").on(table.createdAt),
]);

export const systemSettings = sqliteTable("system_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updatedAt: text("updated_at").notNull().default("(datetime('now'))"),
});

// Aliases for Better Auth (expects singular model names)
export const user = users;
export const session = sessions;
export const account = accounts;
export const verification = verifications;
