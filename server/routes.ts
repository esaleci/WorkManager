import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fs from 'fs/promises';
import path from 'path';
import { insertTaskSchema, insertCommentSchema, insertTaskAttachmentSchema, insertVoiceNoteSchema } from '@shared/schema';

export async function registerRoutes(app: Express): Promise<Server> {
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'uploads');
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch (err) {
    console.error('Failed to create uploads directory:', err);
  }

  // API Routes
  const apiRouter = app.route('/api');

  // Get current user
  app.get('/api/me', async (req, res) => {
    // For demo purposes, always return the first user
    const user = await storage.getUser(1);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove password from response
    const { password, ...safeUser } = user;
    res.json(safeUser);
  });

  // Get all workspaces
  app.get('/api/workspaces', async (req, res) => {
    const workspaces = await storage.getWorkspaces();
    res.json(workspaces);
  });

  // Get workspace by ID
  app.get('/api/workspaces/:id', async (req, res) => {
    const workspace = await storage.getWorkspace(Number(req.params.id));
    if (!workspace) {
      return res.status(404).json({ message: 'Workspace not found' });
    }
    res.json(workspace);
  });

  // Get today's tasks
  app.get('/api/tasks/today', async (req, res) => {
    const tasks = await storage.getTodayTasks();
    res.json(tasks);
  });

  // Get upcoming tasks
  app.get('/api/tasks/upcoming', async (req, res) => {
    const tasks = await storage.getUpcomingTasks();
    res.json(tasks);
  });

  // Get all tasks
  app.get('/api/tasks', async (req, res) => {
    const tasks = await storage.getTasks();
    res.json(tasks);
  });

  // Get task by ID with relations
  app.get('/api/tasks/:id', async (req, res) => {
    const task = await storage.getTaskWithRelations(Number(req.params.id));
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  });

  // Get tasks by workspace
  app.get('/api/workspaces/:id/tasks', async (req, res) => {
    const tasks = await storage.getTasksByWorkspace(Number(req.params.id));
    res.json(tasks);
  });

  // Create a new task
  app.post('/api/tasks', async (req, res) => {
    try {
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(validatedData);
      res.status(201).json(task);
    } catch (error) {
      res.status(400).json({ message: 'Invalid task data', error });
    }
  });

  // Update a task
  app.patch('/api/tasks/:id', async (req, res) => {
    try {
      const task = await storage.updateTask(Number(req.params.id), req.body);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      res.json(task);
    } catch (error) {
      res.status(400).json({ message: 'Invalid task data', error });
    }
  });

  // Delete a task
  app.delete('/api/tasks/:id', async (req, res) => {
    const success = await storage.deleteTask(Number(req.params.id));
    if (!success) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.status(204).end();
  });

  // Assign user to task
  app.post('/api/tasks/:taskId/assignees/:userId', async (req, res) => {
    try {
      const taskId = Number(req.params.taskId);
      const userId = Number(req.params.userId);
      
      const assignee = await storage.assignUserToTask({
        taskId,
        userId
      });
      
      res.status(201).json(assignee);
    } catch (error) {
      res.status(400).json({ message: 'Failed to assign user to task', error });
    }
  });

  // Remove user from task
  app.delete('/api/tasks/:taskId/assignees/:userId', async (req, res) => {
    const taskId = Number(req.params.taskId);
    const userId = Number(req.params.userId);
    
    const success = await storage.removeUserFromTask(taskId, userId);
    if (!success) {
      return res.status(404).json({ message: 'Assignee not found' });
    }
    
    res.status(204).end();
  });

  // Get task assignees
  app.get('/api/tasks/:taskId/assignees', async (req, res) => {
    const assignees = await storage.getTaskAssignees(Number(req.params.taskId));
    res.json(assignees);
  });

  // Add a comment to a task
  app.post('/api/tasks/:taskId/comments', async (req, res) => {
    try {
      const taskId = Number(req.params.taskId);
      
      const validatedData = insertCommentSchema.parse({
        ...req.body,
        taskId
      });
      
      const comment = await storage.addComment(validatedData);
      const user = await storage.getUser(comment.userId);
      
      res.status(201).json({ ...comment, user });
    } catch (error) {
      res.status(400).json({ message: 'Invalid comment data', error });
    }
  });

  // Get task comments
  app.get('/api/tasks/:taskId/comments', async (req, res) => {
    const comments = await storage.getComments(Number(req.params.taskId));
    res.json(comments);
  });

  // Get task attachments
  app.get('/api/tasks/:taskId/attachments', async (req, res) => {
    const attachments = await storage.getTaskAttachments(Number(req.params.taskId));
    res.json(attachments);
  });

  // Add an attachment to a task
  app.post('/api/tasks/:taskId/attachments', async (req, res) => {
    try {
      const taskId = Number(req.params.taskId);
      
      // In a real app, you would handle file upload here
      // For this demo, we'll just create a reference
      
      const validatedData = insertTaskAttachmentSchema.parse({
        ...req.body,
        taskId
      });
      
      const attachment = await storage.addTaskAttachment(validatedData);
      res.status(201).json(attachment);
    } catch (error) {
      res.status(400).json({ message: 'Invalid attachment data', error });
    }
  });

  // Get voice notes for a task
  app.get('/api/tasks/:taskId/voice-notes', async (req, res) => {
    const voiceNotes = await storage.getVoiceNotes(Number(req.params.taskId));
    res.json(voiceNotes);
  });

  // Add a voice note to a task
  app.post('/api/tasks/:taskId/voice-notes', async (req, res) => {
    try {
      const taskId = Number(req.params.taskId);
      
      // In a real app, you would handle audio file upload here
      // For this demo, we'll just create a reference
      
      const validatedData = insertVoiceNoteSchema.parse({
        ...req.body,
        taskId
      });
      
      const voiceNote = await storage.addVoiceNote(validatedData);
      res.status(201).json(voiceNote);
    } catch (error) {
      res.status(400).json({ message: 'Invalid voice note data', error });
    }
  });

  // Dashboard stats
  app.get('/api/dashboard/stats', async (req, res) => {
    const tasks = await storage.getTasks();
    
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.status === 'completed').length;
    
    const totalBudget = tasks.reduce((sum, task) => sum + (task.totalBudget || 0), 0);
    const paidAmount = tasks.reduce((sum, task) => sum + (task.paidAmount || 0), 0);
    
    // For demo purposes, simulate hours tracked data
    const hoursTracked = 32.5;
    const totalHours = 40;
    
    res.json({
      tasks: {
        completed: completedTasks,
        total: totalTasks
      },
      budget: {
        total: totalBudget,
        paid: paidAmount
      },
      hours: {
        tracked: hoursTracked,
        total: totalHours
      }
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
