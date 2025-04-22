import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users Table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  fullName: true,
  email: true,
  avatarUrl: true,
});

// Workspaces Table
export const workspaces = pgTable("workspaces", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertWorkspaceSchema = createInsertSchema(workspaces).pick({
  name: true,
  color: true,
});

// Tasks Table
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default("to-do"),
  priority: text("priority").notNull().default("medium"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  workspaceId: integer("workspace_id").notNull(),
  createdById: integer("created_by_id").notNull(),
  totalBudget: real("total_budget").default(0),
  paidAmount: real("paid_amount").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  description: true,
  status: true,
  priority: true,
  startDate: true,
  endDate: true,
  workspaceId: true,
  createdById: true,
  totalBudget: true,
  paidAmount: true,
});

// Task assignees
export const taskAssignees = pgTable("task_assignees", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull(),
  userId: integer("user_id").notNull(),
});

export const insertTaskAssigneeSchema = createInsertSchema(taskAssignees).pick({
  taskId: true,
  userId: true,
});

// Task attachments
export const taskAttachments = pgTable("task_attachments", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull(),
  fileName: text("file_name").notNull(),
  fileType: text("file_type").notNull(),
  fileSize: integer("file_size").notNull(),
  filePath: text("file_path").notNull(),
  uploadedById: integer("uploaded_by_id").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const insertTaskAttachmentSchema = createInsertSchema(taskAttachments).pick({
  taskId: true,
  fileName: true,
  fileType: true,
  fileSize: true,
  filePath: true,
  uploadedById: true,
});

// Voice notes
export const voiceNotes = pgTable("voice_notes", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull(),
  title: text("title").notNull(),
  duration: integer("duration").notNull(),
  filePath: text("file_path").notNull(),
  recordedById: integer("recorded_by_id").notNull(),
  recordedAt: timestamp("recorded_at").defaultNow(),
});

export const insertVoiceNoteSchema = createInsertSchema(voiceNotes).pick({
  taskId: true,
  title: true,
  duration: true,
  filePath: true,
  recordedById: true,
});

// Comments
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull(),
  content: text("content").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  taskId: true,
  content: true,
  userId: true,
});

// Types for TypeScript
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Workspace = typeof workspaces.$inferSelect;
export type InsertWorkspace = z.infer<typeof insertWorkspaceSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type TaskAssignee = typeof taskAssignees.$inferSelect;
export type InsertTaskAssignee = z.infer<typeof insertTaskAssigneeSchema>;

export type TaskAttachment = typeof taskAttachments.$inferSelect;
export type InsertTaskAttachment = z.infer<typeof insertTaskAttachmentSchema>;

export type VoiceNote = typeof voiceNotes.$inferSelect;
export type InsertVoiceNote = z.infer<typeof insertVoiceNoteSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

// Task Status Enum
export const TaskStatusEnum = {
  TODO: "to-do",
  IN_PROGRESS: "in-progress", 
  COMPLETED: "completed",
  ON_HOLD: "on-hold",
  CANCELLED: "cancelled"
} as const;

// Task Priority Enum
export const TaskPriorityEnum = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high"
} as const;

// Task with related data
export type TaskWithRelations = Task & {
  assignees?: User[];
  attachments?: TaskAttachment[];
  voiceNotes?: VoiceNote[];
  comments?: (Comment & { user: User })[];
  workspace?: Workspace;
  createdBy?: User;
};
