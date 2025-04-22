import { supabase } from './supabase';
import { 
  User, InsertUser,
  Workspace, InsertWorkspace,
  Task, InsertTask, TaskWithRelations,
  TaskAssignee, InsertTaskAssignee,
  TaskAttachment, InsertTaskAttachment,
  VoiceNote, InsertVoiceNote,
  Comment, InsertComment
} from '@shared/schema';
import { IStorage } from './storage';

// Implementation of IStorage using Supabase
export class SupabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching user:', error.message);
      return undefined;
    }
    
    return data as User;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .single();
    
    if (error) {
      console.error('Error fetching user by username:', error.message);
      return undefined;
    }
    
    return data as User;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert([user])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating user:', error.message);
      throw new Error(`Failed to create user: ${error.message}`);
    }
    
    return data as User;
  }
  
  // Workspace methods
  async getWorkspace(id: number): Promise<Workspace | undefined> {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching workspace:', error.message);
      return undefined;
    }
    
    return data as Workspace;
  }
  
  async getWorkspaces(): Promise<Workspace[]> {
    const { data, error } = await supabase
      .from('workspaces')
      .select('*')
      .order('id', { ascending: true });
    
    if (error) {
      console.error('Error fetching workspaces:', error.message);
      return [];
    }
    
    return data as Workspace[];
  }
  
  async createWorkspace(workspace: InsertWorkspace): Promise<Workspace> {
    const { data, error } = await supabase
      .from('workspaces')
      .insert([workspace])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating workspace:', error.message);
      throw new Error(`Failed to create workspace: ${error.message}`);
    }
    
    return data as Workspace;
  }
  
  // Task methods
  async getTask(id: number): Promise<Task | undefined> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching task:', error.message);
      return undefined;
    }
    
    return data as Task;
  }
  
  async getTaskWithRelations(id: number): Promise<TaskWithRelations | undefined> {
    // Get the task
    const task = await this.getTask(id);
    if (!task) return undefined;
    
    // Get the associated data
    const assignees = await this.getTaskAssignees(id);
    const attachments = await this.getTaskAttachments(id);
    const voiceNotes = await this.getVoiceNotes(id);
    const comments = await this.getComments(id);
    const workspace = await this.getWorkspace(task.workspaceId);
    const createdBy = await this.getUser(task.createdById);
    
    // Combine all data
    return {
      ...task,
      assignees,
      attachments,
      voiceNotes,
      comments,
      workspace,
      createdBy
    };
  }
  
  async getTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (error) {
      console.error('Error fetching tasks:', error.message);
      return [];
    }
    
    return data as Task[];
  }
  
  async getTasksByWorkspace(workspaceId: number): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('workspaceId', workspaceId)
      .order('createdAt', { ascending: false });
    
    if (error) {
      console.error('Error fetching tasks by workspace:', error.message);
      return [];
    }
    
    return data as Task[];
  }
  
  async getTasksByUser(userId: number): Promise<Task[]> {
    // Get task IDs where the user is assigned
    const { data: assignedTaskIds, error: assigneeError } = await supabase
      .from('task_assignees')
      .select('taskId')
      .eq('userId', userId);
    
    if (assigneeError) {
      console.error('Error fetching assigned tasks:', assigneeError.message);
      return [];
    }
    
    if (assignedTaskIds.length === 0) {
      return [];
    }
    
    // Get tasks by those IDs
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .in('id', assignedTaskIds.map(item => item.taskId))
      .order('createdAt', { ascending: false });
    
    if (error) {
      console.error('Error fetching tasks by user:', error.message);
      return [];
    }
    
    return data as Task[];
  }
  
  async getTasksByStatus(status: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('status', status)
      .order('createdAt', { ascending: false });
    
    if (error) {
      console.error('Error fetching tasks by status:', error.message);
      return [];
    }
    
    return data as Task[];
  }
  
  async getTodayTasks(): Promise<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .gte('startDate', today.toISOString())
      .lt('startDate', tomorrow.toISOString())
      .order('startDate', { ascending: true });
    
    if (error) {
      console.error('Error fetching today tasks:', error.message);
      return [];
    }
    
    return data as Task[];
  }
  
  async getUpcomingTasks(): Promise<Task[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = new Date(today);
    upcoming.setDate(upcoming.getDate() + 7); // Next 7 days
    
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .gt('startDate', today.toISOString())
      .lte('startDate', upcoming.toISOString())
      .order('startDate', { ascending: true });
    
    if (error) {
      console.error('Error fetching upcoming tasks:', error.message);
      return [];
    }
    
    return data as Task[];
  }
  
  async createTask(task: InsertTask): Promise<Task> {
    const { data, error } = await supabase
      .from('tasks')
      .insert([task])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating task:', error.message);
      throw new Error(`Failed to create task: ${error.message}`);
    }
    
    return data as Task;
  }
  
  async updateTask(id: number, task: Partial<Task>): Promise<Task | undefined> {
    const { data, error } = await supabase
      .from('tasks')
      .update(task)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating task:', error.message);
      return undefined;
    }
    
    return data as Task;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting task:', error.message);
      return false;
    }
    
    return true;
  }
  
  // Task assignee methods
  async assignUserToTask(assignee: InsertTaskAssignee): Promise<TaskAssignee> {
    const { data, error } = await supabase
      .from('task_assignees')
      .insert([assignee])
      .select()
      .single();
    
    if (error) {
      console.error('Error assigning user to task:', error.message);
      throw new Error(`Failed to assign user to task: ${error.message}`);
    }
    
    return data as TaskAssignee;
  }
  
  async removeUserFromTask(taskId: number, userId: number): Promise<boolean> {
    const { error } = await supabase
      .from('task_assignees')
      .delete()
      .eq('taskId', taskId)
      .eq('userId', userId);
    
    if (error) {
      console.error('Error removing user from task:', error.message);
      return false;
    }
    
    return true;
  }
  
  async getTaskAssignees(taskId: number): Promise<User[]> {
    // Get user IDs assigned to this task
    const { data: assignees, error: assigneeError } = await supabase
      .from('task_assignees')
      .select('userId')
      .eq('taskId', taskId);
    
    if (assigneeError) {
      console.error('Error fetching task assignees:', assigneeError.message);
      return [];
    }
    
    if (assignees.length === 0) {
      return [];
    }
    
    // Get users by those IDs
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .in('id', assignees.map(a => a.userId));
    
    if (error) {
      console.error('Error fetching assignee users:', error.message);
      return [];
    }
    
    return data as User[];
  }
  
  // Attachment methods
  async addTaskAttachment(attachment: InsertTaskAttachment): Promise<TaskAttachment> {
    const { data, error } = await supabase
      .from('task_attachments')
      .insert([attachment])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding task attachment:', error.message);
      throw new Error(`Failed to add task attachment: ${error.message}`);
    }
    
    return data as TaskAttachment;
  }
  
  async getTaskAttachments(taskId: number): Promise<TaskAttachment[]> {
    const { data, error } = await supabase
      .from('task_attachments')
      .select('*')
      .eq('taskId', taskId)
      .order('uploadedAt', { ascending: false });
    
    if (error) {
      console.error('Error fetching task attachments:', error.message);
      return [];
    }
    
    return data as TaskAttachment[];
  }
  
  async deleteTaskAttachment(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('task_attachments')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting task attachment:', error.message);
      return false;
    }
    
    return true;
  }
  
  // Voice note methods
  async addVoiceNote(voiceNote: InsertVoiceNote): Promise<VoiceNote> {
    const { data, error } = await supabase
      .from('voice_notes')
      .insert([voiceNote])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding voice note:', error.message);
      throw new Error(`Failed to add voice note: ${error.message}`);
    }
    
    return data as VoiceNote;
  }
  
  async getVoiceNotes(taskId: number): Promise<VoiceNote[]> {
    const { data, error } = await supabase
      .from('voice_notes')
      .select('*')
      .eq('taskId', taskId)
      .order('recordedAt', { ascending: false });
    
    if (error) {
      console.error('Error fetching voice notes:', error.message);
      return [];
    }
    
    return data as VoiceNote[];
  }
  
  async deleteVoiceNote(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('voice_notes')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting voice note:', error.message);
      return false;
    }
    
    return true;
  }
  
  // Comment methods
  async addComment(comment: InsertComment): Promise<Comment> {
    const { data, error } = await supabase
      .from('comments')
      .insert([comment])
      .select()
      .single();
    
    if (error) {
      console.error('Error adding comment:', error.message);
      throw new Error(`Failed to add comment: ${error.message}`);
    }
    
    return data as Comment;
  }
  
  async getComments(taskId: number): Promise<(Comment & { user: User })[]> {
    // First get all comments for the task
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select('*')
      .eq('taskId', taskId)
      .order('createdAt', { ascending: true });
    
    if (commentsError) {
      console.error('Error fetching comments:', commentsError.message);
      return [];
    }
    
    if (comments.length === 0) {
      return [];
    }
    
    // Get users for these comments
    const userIds = [...new Set(comments.map(c => c.userId))];
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .in('id', userIds);
    
    if (usersError) {
      console.error('Error fetching comment users:', usersError.message);
      return [];
    }
    
    // Map users to comments
    const usersMap = new Map<number, User>();
    users.forEach(user => {
      usersMap.set(user.id, user as User);
    });
    
    // Combine comment with user
    return comments.map(comment => ({
      ...comment,
      user: usersMap.get(comment.userId) as User
    })) as (Comment & { user: User })[];
  }
  
  async deleteComment(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting comment:', error.message);
      return false;
    }
    
    return true;
  }
}