import { supabase } from './supabase';
import { faker } from '@faker-js/faker';
import { 
  TaskStatusEnum, 
  TaskPriorityEnum 
} from '@shared/schema';

// Set a seed for reproducible data
faker.seed(123);

interface User {
  username: string;
  password: string;
  fullName: string;
  email: string;
  avatarUrl: string;
}

interface Workspace {
  name: string;
  description: string;
  color: string;
}

interface Task {
  title: string;
  description: string;
  status: string;
  priority: string;
  startDate: string;
  endDate: string;
  totalBudget: number;
  paidAmount: number;
  workspaceId: number;
  createdById: number;
}

// Helper to get a random array element
const getRandomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

// Helper to get a random date within a range
const getRandomDate = (start: Date, end: Date): string => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

// Generate random users
const generateUsers = (count: number): User[] => {
  const users: User[] = [];
  
  // First user is always the same for consistency
  users.push({
    username: 'sarahchen',
    password: 'password123',
    fullName: 'Sarah Chen',
    email: 'sarah@example.com',
    avatarUrl: faker.image.avatar()
  });
  
  // Generate additional random users
  for (let i = 1; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    
    users.push({
      username: faker.internet.userName({ firstName, lastName }).toLowerCase(),
      password: 'password123',
      fullName: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }),
      avatarUrl: faker.image.avatar()
    });
  }
  
  return users;
};

// Generate random workspaces
const generateWorkspaces = (count: number): Workspace[] => {
  const workspaces: Workspace[] = [];
  
  // Fixed workspaces for consistency
  const fixedWorkspaces = [
    { name: 'Marketing', description: 'Marketing campaigns and content creation', color: '#0073ea' },
    { name: 'Development', description: 'Product development and engineering', color: '#00c875' },
    { name: 'Sales', description: 'Sales activities and client management', color: '#ff7575' },
    { name: 'Design', description: 'UI/UX design and graphics', color: '#fdab3d' },
    { name: 'Operations', description: 'Daily operations and logistics', color: '#6c6cff' }
  ];
  
  // Add fixed workspaces first
  workspaces.push(...fixedWorkspaces);
  
  // Generate additional random workspaces if needed
  const colors = ['#ff158a', '#9d28ac', '#387aff', '#808080', '#ff5ac4', '#784bd1', '#a25ddc', '#5b76f7', '#e2445c'];
  
  for (let i = fixedWorkspaces.length; i < count; i++) {
    workspaces.push({
      name: faker.company.name(),
      description: faker.company.catchPhrase(),
      color: getRandomElement(colors)
    });
  }
  
  return workspaces;
};

// Generate random tasks
const generateTasks = (count: number, workspaceIds: number[], userIds: number[]): Task[] => {
  const tasks: Task[] = [];
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const thirtyDaysFromNow = new Date(now);
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  
  const statusValues = Object.values(TaskStatusEnum);
  const priorityValues = Object.values(TaskPriorityEnum);
  
  for (let i = 0; i < count; i++) {
    // Random dates in a reasonable range
    const startDate = getRandomDate(thirtyDaysAgo, thirtyDaysFromNow);
    
    // End date is 1-5 hours after start date
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(startDateObj.getTime() + (1 + Math.floor(Math.random() * 4)) * 60 * 60 * 1000);
    
    // Random budget between 0 and 10000
    const totalBudget = Math.round(Math.random() * 10000);
    
    // Random paid amount between 0 and totalBudget
    const paidAmount = Math.round(Math.random() * totalBudget);
    
    tasks.push({
      title: faker.company.catchPhrase(),
      description: faker.lorem.paragraph(),
      status: getRandomElement(statusValues),
      priority: getRandomElement(priorityValues),
      startDate,
      endDate: endDateObj.toISOString(),
      totalBudget,
      paidAmount,
      workspaceId: getRandomElement(workspaceIds),
      createdById: getRandomElement(userIds)
    });
  }
  
  return tasks;
};

// Generate task assignees
const generateTaskAssignees = (taskIds: number[], userIds: number[], maxAssigneesPerTask: number = 3): { taskId: number; userId: number }[] => {
  const assignees: { taskId: number; userId: number }[] = [];
  
  taskIds.forEach(taskId => {
    // Randomly decide how many assignees for this task (1 to maxAssigneesPerTask)
    const numAssignees = 1 + Math.floor(Math.random() * maxAssigneesPerTask);
    
    // Shuffle userIds and pick the first numAssignees
    const shuffledUserIds = [...userIds].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < Math.min(numAssignees, userIds.length); i++) {
      assignees.push({
        taskId,
        userId: shuffledUserIds[i]
      });
    }
  });
  
  return assignees;
};

// Generate comments
const generateComments = (taskIds: number[], userIds: number[], maxCommentsPerTask: number = 5): { taskId: number; userId: number; content: string }[] => {
  const comments: { taskId: number; userId: number; content: string }[] = [];
  
  taskIds.forEach(taskId => {
    // Randomly decide how many comments for this task (0 to maxCommentsPerTask)
    const numComments = Math.floor(Math.random() * (maxCommentsPerTask + 1));
    
    for (let i = 0; i < numComments; i++) {
      comments.push({
        taskId,
        userId: getRandomElement(userIds),
        content: faker.lorem.paragraph()
      });
    }
  });
  
  return comments;
};

// Create tables and seed the database
export async function seedDatabase(numRecords: number = 100) {
  try {
    console.log('Creating tables in Supabase...');
    
    // Create Users table
    const { error: usersTableError } = await supabase
      .from('_dummy_table_for_check')
      .select('count')
      .limit(1)
      .catch(() => {
        // This is expected to fail, we just want to check if tables exist
        return { error: null };
      });
    
    // Use Supabase SQL feature to create tables
    // Create Users table
    const { error: createUsersError } = await supabase
      .rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL,
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
          );
        `
      });
    
    if (createUsersError) {
      console.error('Error creating users table:', createUsersError);
      return false;
    }
    
    // Create Workspaces table
    const { error: createWorkspacesError } = await supabase
      .rpc('execute_sql', { 
        sql_query: `
          CREATE TABLE IF NOT EXISTS workspaces (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            color TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
          );
        `
      });
    
    if (createWorkspacesError) {
      console.error('Error creating workspaces table:', createWorkspacesError);
      return false;
    }
    
    // Create Tasks table
    const { error: createTasksError } = await supabase
      .rpc('execute_sql', { 
        sql_query: `
          CREATE TABLE IF NOT EXISTS tasks (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            status TEXT NOT NULL DEFAULT 'to-do',
            priority TEXT NOT NULL DEFAULT 'medium',
            start_date TIMESTAMP WITH TIME ZONE,
            end_date TIMESTAMP WITH TIME ZONE,
            total_budget REAL,
            paid_amount REAL DEFAULT 0,
            workspace_id INTEGER NOT NULL,
            created_by_id INTEGER NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            completed_at TIMESTAMP WITH TIME ZONE
          );
        `
      });
    
    if (createTasksError) {
      console.error('Error creating tasks table:', createTasksError);
      return false;
    }
    
    // Create Task Assignees table
    const { error: createAssigneesError } = await supabase
      .rpc('execute_sql', { 
        sql_query: `
          CREATE TABLE IF NOT EXISTS task_assignees (
            id SERIAL PRIMARY KEY,
            task_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            UNIQUE(task_id, user_id)
          );
        `
      });
    
    if (createAssigneesError) {
      console.error('Error creating task_assignees table:', createAssigneesError);
      return false;
    }
    
    // Create Task Attachments table
    const { error: createAttachmentsError } = await supabase
      .rpc('execute_sql', { 
        sql_query: `
          CREATE TABLE IF NOT EXISTS task_attachments (
            id SERIAL PRIMARY KEY,
            task_id INTEGER NOT NULL,
            file_name TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            file_type TEXT NOT NULL,
            file_url TEXT NOT NULL,
            uploaded_by_id INTEGER NOT NULL,
            uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
          );
        `
      });
    
    if (createAttachmentsError) {
      console.error('Error creating task_attachments table:', createAttachmentsError);
      return false;
    }
    
    // Create Voice Notes table
    const { error: createVoiceNotesError } = await supabase
      .rpc('execute_sql', { 
        sql_query: `
          CREATE TABLE IF NOT EXISTS voice_notes (
            id SERIAL PRIMARY KEY,
            task_id INTEGER NOT NULL,
            file_name TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            duration INTEGER NOT NULL,
            file_url TEXT NOT NULL,
            recorded_by_id INTEGER NOT NULL,
            recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
          );
        `
      });
    
    if (createVoiceNotesError) {
      console.error('Error creating voice_notes table:', createVoiceNotesError);
      return false;
    }
    
    // Create Comments table
    const { error: createCommentsError } = await supabase
      .rpc('execute_sql', { 
        sql_query: `
          CREATE TABLE IF NOT EXISTS comments (
            id SERIAL PRIMARY KEY,
            task_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
          );
        `
      });
    
    if (createCommentsError) {
      console.error('Error creating comments table:', createCommentsError);
      return false;
    }
    
    console.log('All tables created successfully!');
    
    // Clear existing data
    await supabase.from('comments').delete().neq('id', 0);
    await supabase.from('voice_notes').delete().neq('id', 0);
    await supabase.from('task_attachments').delete().neq('id', 0);
    await supabase.from('task_assignees').delete().neq('id', 0);
    await supabase.from('tasks').delete().neq('id', 0);
    await supabase.from('workspaces').delete().neq('id', 0);
    await supabase.from('users').delete().neq('id', 0);
    
    console.log('Generating seed data...');
    
    // Generate data
    const numUsers = Math.min(10, numRecords / 10); // 10 users or 10% of numRecords, whichever is smaller
    const numWorkspaces = Math.min(10, numRecords / 20); // 10 workspaces or 5% of numRecords, whichever is smaller
    const users = generateUsers(numUsers);
    const workspaces = generateWorkspaces(numWorkspaces);
    
    // Insert Users
    console.log('Inserting users...');
    const { data: insertedUsers, error: usersError } = await supabase
      .from('users')
      .insert(users.map(user => ({
        username: user.username,
        password: user.password,
        full_name: user.fullName,
        email: user.email,
        avatar_url: user.avatarUrl
      })))
      .select();
    
    if (usersError) {
      console.error('Error inserting users:', usersError);
      return false;
    }
    
    // Insert Workspaces
    console.log('Inserting workspaces...');
    const { data: insertedWorkspaces, error: workspacesError } = await supabase
      .from('workspaces')
      .insert(workspaces.map(workspace => ({
        name: workspace.name,
        description: workspace.description,
        color: workspace.color
      })))
      .select();
    
    if (workspacesError) {
      console.error('Error inserting workspaces:', workspacesError);
      return false;
    }
    
    // Extract IDs for relationship creation
    const userIds = insertedUsers?.map(user => user.id) || [];
    const workspaceIds = insertedWorkspaces?.map(workspace => workspace.id) || [];
    
    if (userIds.length === 0 || workspaceIds.length === 0) {
      console.error('No users or workspaces were created.');
      return false;
    }
    
    // Generate and insert Tasks
    console.log('Inserting tasks...');
    const tasks = generateTasks(numRecords, workspaceIds, userIds);
    
    const { data: insertedTasks, error: tasksError } = await supabase
      .from('tasks')
      .insert(tasks.map(task => ({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        start_date: task.startDate,
        end_date: task.endDate,
        total_budget: task.totalBudget,
        paid_amount: task.paidAmount,
        workspace_id: task.workspaceId,
        created_by_id: task.createdById
      })))
      .select();
    
    if (tasksError) {
      console.error('Error inserting tasks:', tasksError);
      return false;
    }
    
    const taskIds = insertedTasks?.map(task => task.id) || [];
    
    if (taskIds.length === 0) {
      console.error('No tasks were created.');
      return false;
    }
    
    // Generate and insert Task Assignees
    console.log('Inserting task assignees...');
    const assignees = generateTaskAssignees(taskIds, userIds);
    
    if (assignees.length > 0) {
      const { error: assigneesError } = await supabase
        .from('task_assignees')
        .insert(assignees.map(assignee => ({
          task_id: assignee.taskId,
          user_id: assignee.userId
        })));
      
      if (assigneesError) {
        console.error('Error inserting task assignees:', assigneesError);
        // Continue anyway as this is not critical
      }
    }
    
    // Generate and insert Comments
    console.log('Inserting comments...');
    const comments = generateComments(taskIds, userIds);
    
    if (comments.length > 0) {
      const { error: commentsError } = await supabase
        .from('comments')
        .insert(comments.map(comment => ({
          task_id: comment.taskId,
          user_id: comment.userId,
          content: comment.content
        })));
      
      if (commentsError) {
        console.error('Error inserting comments:', commentsError);
        // Continue anyway as this is not critical
      }
    }
    
    console.log(`Successfully seeded database with ${numRecords} records!`);
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
}

// Run the seeding function if called directly
if (import.meta.url === import.meta.main) {
  seedDatabase()
    .then(success => {
      if (success) {
        console.log('Database seeded successfully!');
        process.exit(0);
      } else {
        console.error('Failed to seed database!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Unexpected error:', error);
      process.exit(1);
    });
}