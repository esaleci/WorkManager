import {
  users, type User, type InsertUser,
  workspaces, type Workspace, type InsertWorkspace,
  tasks, type Task, type InsertTask,
  taskAssignees, type TaskAssignee, type InsertTaskAssignee,
  taskAttachments, type TaskAttachment, type InsertTaskAttachment,
  voiceNotes, type VoiceNote, type InsertVoiceNote,
  comments, type Comment, type InsertComment,
  type TaskWithRelations
} from "@shared/schema";

// Storage interface for all data access
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Workspace methods
  getWorkspace(id: number): Promise<Workspace | undefined>;
  getWorkspaces(): Promise<Workspace[]>;
  createWorkspace(workspace: InsertWorkspace): Promise<Workspace>;
  
  // Task methods
  getTask(id: number): Promise<Task | undefined>;
  getTaskWithRelations(id: number): Promise<TaskWithRelations | undefined>;
  getTasks(): Promise<Task[]>;
  getTasksByWorkspace(workspaceId: number): Promise<Task[]>;
  getTasksByUser(userId: number): Promise<Task[]>;
  getTasksByStatus(status: string): Promise<Task[]>;
  getTodayTasks(): Promise<Task[]>;
  getUpcomingTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<Task>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  
  // Task assignee methods
  assignUserToTask(assignee: InsertTaskAssignee): Promise<TaskAssignee>;
  removeUserFromTask(taskId: number, userId: number): Promise<boolean>;
  getTaskAssignees(taskId: number): Promise<User[]>;
  
  // Attachment methods
  addTaskAttachment(attachment: InsertTaskAttachment): Promise<TaskAttachment>;
  getTaskAttachments(taskId: number): Promise<TaskAttachment[]>;
  deleteTaskAttachment(id: number): Promise<boolean>;
  
  // Voice note methods
  addVoiceNote(voiceNote: InsertVoiceNote): Promise<VoiceNote>;
  getVoiceNotes(taskId: number): Promise<VoiceNote[]>;
  deleteVoiceNote(id: number): Promise<boolean>;
  
  // Comment methods
  addComment(comment: InsertComment): Promise<Comment>;
  getComments(taskId: number): Promise<(Comment & { user: User })[]>;
  deleteComment(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private workspaces: Map<number, Workspace>;
  private tasks: Map<number, Task>;
  private taskAssignees: Map<number, TaskAssignee>;
  private taskAttachments: Map<number, TaskAttachment>;
  private voiceNotes: Map<number, VoiceNote>;
  private comments: Map<number, Comment>;
  
  private userId: number;
  private workspaceId: number;
  private taskId: number;
  private assigneeId: number;
  private attachmentId: number;
  private voiceNoteId: number;
  private commentId: number;
  
  constructor() {
    this.users = new Map();
    this.workspaces = new Map();
    this.tasks = new Map();
    this.taskAssignees = new Map();
    this.taskAttachments = new Map();
    this.voiceNotes = new Map();
    this.comments = new Map();
    
    this.userId = 1;
    this.workspaceId = 1;
    this.taskId = 1;
    this.assigneeId = 1;
    this.attachmentId = 1;
    this.voiceNoteId = 1;
    this.commentId = 1;
    
    // Seed data for development
    this.seedData();
  }
  
  private seedData() {
    // Create sample users
    const user1 = this.createUser({
      username: "sarahchen",
      password: "password123",
      fullName: "Sarah Chen",
      email: "sarah@workflow.com",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=64&h=64&q=80",
    });
    
    const user2 = this.createUser({
      username: "michaeltaylor",
      password: "password123",
      fullName: "Michael Taylor",
      email: "michael@workflow.com",
      avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=64&h=64&q=80",
    });
    
    // Create sample workspaces
    const marketing = this.createWorkspace({
      name: "Marketing",
      color: "#0073ea", // Primary blue
    });
    
    const development = this.createWorkspace({
      name: "Development",
      color: "#00c875", // Green
    });
    
    const sales = this.createWorkspace({
      name: "Sales",
      color: "#fdab3d", // Yellow/Orange
    });
    
    // Create sample tasks
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const task1 = this.createTask({
      title: "Client meeting for website redesign",
      description: "Review the website redesign proposal with the client team. Prepare mockups and technical specification documents.",
      status: "in-progress",
      priority: "high",
      startDate: new Date(now.setHours(14, 0, 0, 0)), // 2:00 PM today
      endDate: new Date(now.setHours(15, 30, 0, 0)),  // 3:30 PM today
      workspaceId: marketing.id,
      createdById: user1.id,
      totalBudget: 2500,
      paidAmount: 1500,
    });
    
    const task2 = this.createTask({
      title: "Prepare Q4 budget proposal",
      description: "Compile financial data and prepare budget proposal for Q4.",
      status: "in-progress",
      priority: "medium",
      startDate: new Date(now.setHours(9, 0, 0, 0)), // 9:00 AM today
      endDate: new Date(now.setHours(12, 0, 0, 0)),  // 12:00 PM today
      workspaceId: sales.id,
      createdById: user1.id,
      totalBudget: 1000,
      paidAmount: 0,
    });
    
    const task3 = this.createTask({
      title: "Team stand-up meeting",
      description: "Daily team stand-up to discuss progress and roadblocks.",
      status: "in-progress",
      priority: "medium",
      startDate: new Date(now.setHours(16, 30, 0, 0)), // 4:30 PM today
      endDate: new Date(now.setHours(17, 0, 0, 0)),    // 5:00 PM today
      workspaceId: development.id,
      createdById: user2.id,
      totalBudget: 0,
      paidAmount: 0,
    });
    
    const task4 = this.createTask({
      title: "Submit client contract for review",
      description: "Finalize and submit client contract to legal team for review.",
      status: "in-progress",
      priority: "high",
      startDate: now,
      endDate: now,
      workspaceId: sales.id,
      createdById: user2.id,
      totalBudget: 500,
      paidAmount: 0,
    });
    
    // Task for tomorrow
    const task5 = this.createTask({
      title: "Product roadmap review",
      description: "Review product roadmap and prioritize features for next release.",
      status: "to-do",
      priority: "high",
      startDate: new Date(tomorrow.setHours(9, 0, 0, 0)), // 9:00 AM tomorrow
      endDate: new Date(tomorrow.setHours(10, 30, 0, 0)),  // 10:30 AM tomorrow
      workspaceId: development.id,
      createdById: user1.id,
      totalBudget: 0,
      paidAmount: 0,
    });
    
    // Assign users to tasks
    this.assignUserToTask({ taskId: task1.id, userId: user1.id });
    this.assignUserToTask({ taskId: task1.id, userId: user2.id });
    
    this.assignUserToTask({ taskId: task2.id, userId: user1.id });
    
    this.assignUserToTask({ taskId: task3.id, userId: user1.id });
    this.assignUserToTask({ taskId: task3.id, userId: user2.id });
    
    this.assignUserToTask({ taskId: task4.id, userId: user2.id });
    this.assignUserToTask({ taskId: task4.id, userId: user1.id });
    
    this.assignUserToTask({ taskId: task5.id, userId: user1.id });
    this.assignUserToTask({ taskId: task5.id, userId: user2.id });
    
    // Add attachments
    this.addTaskAttachment({
      taskId: task1.id,
      fileName: "redesign_proposal_v2.pdf",
      fileType: "application/pdf",
      fileSize: 4200000, // 4.2 MB
      filePath: "/uploads/redesign_proposal_v2.pdf",
      uploadedById: user1.id,
    });
    
    this.addTaskAttachment({
      taskId: task1.id,
      fileName: "mockup_homepage.png",
      fileType: "image/png",
      fileSize: 2800000, // 2.8 MB
      filePath: "/uploads/mockup_homepage.png",
      uploadedById: user2.id,
    });
    
    // Add voice notes
    this.addVoiceNote({
      taskId: task1.id,
      title: "Initial client feedback",
      duration: 45, // 45 seconds
      filePath: "/uploads/initial_client_feedback.mp3",
      recordedById: user1.id,
    });
    
    // Add comments
    this.addComment({
      taskId: task1.id,
      content: "I've prepared all the mockups. Let's review them once more before the meeting.",
      userId: user1.id,
    });
    
    this.addComment({
      taskId: task1.id,
      content: "The client mentioned they want to see more vibrant color options. I've updated the palette in the document.",
      userId: user2.id,
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }
  
  async createUser(userData: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { 
      ...userData, 
      id,
      createdAt: now,
    };
    this.users.set(id, user);
    return user;
  }
  
  // Workspace methods
  async getWorkspace(id: number): Promise<Workspace | undefined> {
    return this.workspaces.get(id);
  }
  
  async getWorkspaces(): Promise<Workspace[]> {
    return Array.from(this.workspaces.values());
  }
  
  async createWorkspace(workspaceData: InsertWorkspace): Promise<Workspace> {
    const id = this.workspaceId++;
    const now = new Date();
    const workspace: Workspace = {
      ...workspaceData,
      id,
      createdAt: now,
    };
    this.workspaces.set(id, workspace);
    return workspace;
  }
  
  // Task methods
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }
  
  async getTaskWithRelations(id: number): Promise<TaskWithRelations | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const assignees = await this.getTaskAssignees(id);
    const attachments = await this.getTaskAttachments(id);
    const voiceNotes = await this.getVoiceNotes(id);
    const comments = await this.getComments(id);
    const workspace = await this.getWorkspace(task.workspaceId);
    const createdBy = await this.getUser(task.createdById);
    
    return {
      ...task,
      assignees,
      attachments,
      voiceNotes,
      comments,
      workspace,
      createdBy,
    };
  }
  
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }
  
  async getTasksByWorkspace(workspaceId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.workspaceId === workspaceId
    );
  }
  
  async getTasksByUser(userId: number): Promise<Task[]> {
    const assignedTaskIds = Array.from(this.taskAssignees.values())
      .filter(assignee => assignee.userId === userId)
      .map(assignee => assignee.taskId);
    
    return Array.from(this.tasks.values()).filter(
      (task) => assignedTaskIds.includes(task.id) || task.createdById === userId
    );
  }
  
  async getTasksByStatus(status: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.status === status
    );
  }
  
  async getTodayTasks(): Promise<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return Array.from(this.tasks.values()).filter(task => {
      if (!task.startDate) return false;
      const taskDate = new Date(task.startDate);
      return taskDate >= today && taskDate < tomorrow;
    });
  }
  
  async getUpcomingTasks(): Promise<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return Array.from(this.tasks.values()).filter(task => {
      if (!task.startDate) return false;
      const taskDate = new Date(task.startDate);
      return taskDate >= tomorrow;
    });
  }
  
  async createTask(taskData: InsertTask): Promise<Task> {
    const id = this.taskId++;
    const now = new Date();
    const task: Task = {
      ...taskData,
      id,
      createdAt: now,
      completedAt: null,
    };
    this.tasks.set(id, task);
    return task;
  }
  
  async updateTask(id: number, taskData: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, ...taskData };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }
  
  // Task assignee methods
  async assignUserToTask(assigneeData: InsertTaskAssignee): Promise<TaskAssignee> {
    const id = this.assigneeId++;
    const assignee: TaskAssignee = { ...assigneeData, id };
    this.taskAssignees.set(id, assignee);
    return assignee;
  }
  
  async removeUserFromTask(taskId: number, userId: number): Promise<boolean> {
    const assigneeEntry = Array.from(this.taskAssignees.entries()).find(
      ([_, assignee]) => assignee.taskId === taskId && assignee.userId === userId
    );
    
    if (!assigneeEntry) return false;
    return this.taskAssignees.delete(assigneeEntry[0]);
  }
  
  async getTaskAssignees(taskId: number): Promise<User[]> {
    const assignees = Array.from(this.taskAssignees.values()).filter(
      (assignee) => assignee.taskId === taskId
    );
    
    const users: User[] = [];
    for (const assignee of assignees) {
      const user = await this.getUser(assignee.userId);
      if (user) users.push(user);
    }
    
    return users;
  }
  
  // Attachment methods
  async addTaskAttachment(attachmentData: InsertTaskAttachment): Promise<TaskAttachment> {
    const id = this.attachmentId++;
    const now = new Date();
    const attachment: TaskAttachment = {
      ...attachmentData,
      id,
      uploadedAt: now,
    };
    this.taskAttachments.set(id, attachment);
    return attachment;
  }
  
  async getTaskAttachments(taskId: number): Promise<TaskAttachment[]> {
    return Array.from(this.taskAttachments.values()).filter(
      (attachment) => attachment.taskId === taskId
    );
  }
  
  async deleteTaskAttachment(id: number): Promise<boolean> {
    return this.taskAttachments.delete(id);
  }
  
  // Voice note methods
  async addVoiceNote(voiceNoteData: InsertVoiceNote): Promise<VoiceNote> {
    const id = this.voiceNoteId++;
    const now = new Date();
    const voiceNote: VoiceNote = {
      ...voiceNoteData,
      id,
      recordedAt: now,
    };
    this.voiceNotes.set(id, voiceNote);
    return voiceNote;
  }
  
  async getVoiceNotes(taskId: number): Promise<VoiceNote[]> {
    return Array.from(this.voiceNotes.values()).filter(
      (voiceNote) => voiceNote.taskId === taskId
    );
  }
  
  async deleteVoiceNote(id: number): Promise<boolean> {
    return this.voiceNotes.delete(id);
  }
  
  // Comment methods
  async addComment(commentData: InsertComment): Promise<Comment> {
    const id = this.commentId++;
    const now = new Date();
    const comment: Comment = {
      ...commentData,
      id,
      createdAt: now,
    };
    this.comments.set(id, comment);
    return comment;
  }
  
  async getComments(taskId: number): Promise<(Comment & { user: User })[]> {
    const taskComments = Array.from(this.comments.values()).filter(
      (comment) => comment.taskId === taskId
    );
    
    const commentsWithUser: (Comment & { user: User })[] = [];
    for (const comment of taskComments) {
      const user = await this.getUser(comment.userId);
      if (user) {
        commentsWithUser.push({ ...comment, user });
      }
    }
    
    return commentsWithUser;
  }
  
  async deleteComment(id: number): Promise<boolean> {
    return this.comments.delete(id);
  }
}

import { SupabaseStorage } from './storage-supabase';
import { setupSupabase } from './setupSupabase';

// Initialize Supabase tables and seed data if needed
// This will run asynchronously but we don't need to await it here
setupSupabase().catch(err => {
  console.error("Failed to set up Supabase:", err);
});

// Export the Supabase storage implementation
export const storage = new SupabaseStorage();
