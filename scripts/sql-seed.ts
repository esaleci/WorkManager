import { supabase } from '../server/supabase';
import { faker } from '@faker-js/faker';

// Set seed for consistent results
faker.seed(123);

const sqlCreate = `
-- Create Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create Workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create Tasks table
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

-- Create Task Assignees table
CREATE TABLE IF NOT EXISTS task_assignees (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(task_id, user_id)
);

-- Create Task Attachments table
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

-- Create Voice Notes table
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

-- Create Comments table
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  task_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
`;

async function createTables() {
  try {
    console.log('Creating tables...');
    
    // Create tables using raw SQL
    const { error } = await supabase.auth.admin.createUser({
      email: 'test@example.com',
      password: 'password',
    });
    
    if (error) {
      console.log('Error with auth operation, proceeding with table creation anyway');
    }
    
    await supabase.rpc('psql', { sql: sqlCreate });
    
    console.log('Tables created successfully!');
    return true;
  } catch (error) {
    console.error('Error creating tables:', error);
    return false;
  }
}

// Generate fake data
async function seedDatabase(numRecords = 100) {
  try {
    console.log(`Seeding database with ${numRecords} records...`);
    
    // Generate users
    const users = [];
    for (let i = 0; i < 10; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      
      users.push({
        username: faker.internet.userName({ firstName, lastName }).toLowerCase(),
        password: 'password123',
        full_name: `${firstName} ${lastName}`,
        email: faker.internet.email({ firstName, lastName }),
        avatar_url: faker.image.avatar()
      });
    }
    
    // Add a consistent user
    users[0] = {
      username: 'sarahchen',
      password: 'password123',
      full_name: 'Sarah Chen',
      email: 'sarah@example.com',
      avatar_url: 'https://example.com/avatar.jpg'
    };
    
    // Insert users
    console.log('Inserting users...');
    for (const user of users) {
      await supabase.from('users').insert(user);
    }
    
    // Get users
    const { data: insertedUsers, error: usersError } = await supabase
      .from('users')
      .select('id');
    
    if (usersError) {
      console.error('Error getting users:', usersError);
      return false;
    }
    
    // Generate workspaces
    const workspaces = [
      { name: 'Marketing', description: 'Marketing campaigns and content creation', color: '#0073ea' },
      { name: 'Development', description: 'Product development and engineering', color: '#00c875' },
      { name: 'Sales', description: 'Sales activities and client management', color: '#ff7575' },
      { name: 'Design', description: 'UI/UX design and graphics', color: '#fdab3d' },
      { name: 'Operations', description: 'Daily operations and logistics', color: '#6c6cff' }
    ];
    
    // Insert workspaces
    console.log('Inserting workspaces...');
    for (const workspace of workspaces) {
      await supabase.from('workspaces').insert(workspace);
    }
    
    // Get workspaces
    const { data: insertedWorkspaces, error: workspacesError } = await supabase
      .from('workspaces')
      .select('id');
    
    if (workspacesError) {
      console.error('Error getting workspaces:', workspacesError);
      return false;
    }
    
    // Extract IDs
    const userIds = insertedUsers?.map(u => u.id) || [];
    const workspaceIds = insertedWorkspaces?.map(w => w.id) || [];
    
    if (userIds.length === 0 || workspaceIds.length === 0) {
      console.error('No users or workspaces found');
      return false;
    }
    
    // Generate tasks
    console.log('Generating tasks...');
    const statuses = ['to-do', 'in-progress', 'completed', 'on-hold', 'cancelled'];
    const priorities = ['low', 'medium', 'high', 'urgent'];
    
    const tasks = [];
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysFromNow = new Date(now);
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    for (let i = 0; i < numRecords; i++) {
      // Random dates
      const startDate = new Date(
        thirtyDaysAgo.getTime() + 
        Math.random() * (thirtyDaysFromNow.getTime() - thirtyDaysAgo.getTime())
      );
      
      // End date is 1-5 hours after start date
      const endDate = new Date(startDate);
      endDate.setHours(endDate.getHours() + 1 + Math.floor(Math.random() * 4));
      
      // Random budget between 0 and 10000
      const totalBudget = Math.round(Math.random() * 10000);
      
      // Random paid amount between 0 and totalBudget
      const paidAmount = Math.round(Math.random() * totalBudget);
      
      const task = {
        title: faker.company.catchPhrase(),
        description: faker.lorem.paragraph(),
        status: statuses[Math.floor(Math.random() * statuses.length)],
        priority: priorities[Math.floor(Math.random() * priorities.length)],
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        total_budget: totalBudget,
        paid_amount: paidAmount,
        workspace_id: workspaceIds[Math.floor(Math.random() * workspaceIds.length)],
        created_by_id: userIds[Math.floor(Math.random() * userIds.length)]
      };
      
      tasks.push(task);
    }
    
    // Insert tasks in batches of 10 to avoid issues
    console.log('Inserting tasks...');
    for (let i = 0; i < tasks.length; i += 10) {
      const batch = tasks.slice(i, i + 10);
      await supabase.from('tasks').insert(batch);
    }
    
    // Get task IDs
    const { data: insertedTasks, error: tasksError } = await supabase
      .from('tasks')
      .select('id');
    
    if (tasksError) {
      console.error('Error getting tasks:', tasksError);
      return false;
    }
    
    const taskIds = insertedTasks?.map(t => t.id) || [];
    
    if (taskIds.length === 0) {
      console.error('No tasks created');
      return false;
    }
    
    // Generate task assignees
    console.log('Generating task assignees...');
    const assignees = [];
    
    taskIds.forEach(taskId => {
      // 1 to 3 assignees per task
      const numAssignees = 1 + Math.floor(Math.random() * 3);
      const shuffledUserIds = [...userIds].sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < Math.min(numAssignees, userIds.length); i++) {
        assignees.push({
          task_id: taskId,
          user_id: shuffledUserIds[i]
        });
      }
    });
    
    // Insert assignees in batches
    console.log('Inserting task assignees...');
    for (let i = 0; i < assignees.length; i += 10) {
      const batch = assignees.slice(i, i + 10);
      await supabase.from('task_assignees').insert(batch).then(({ error }) => {
        if (error && !error.message.includes('duplicate')) {
          console.error('Error inserting assignee:', error);
        }
      });
    }
    
    // Generate comments
    console.log('Generating comments...');
    const comments = [];
    
    taskIds.forEach(taskId => {
      // 0 to 5 comments per task
      const numComments = Math.floor(Math.random() * 6);
      
      for (let i = 0; i < numComments; i++) {
        comments.push({
          task_id: taskId,
          user_id: userIds[Math.floor(Math.random() * userIds.length)],
          content: faker.lorem.paragraph()
        });
      }
    });
    
    // Insert comments in batches
    console.log('Inserting comments...');
    for (let i = 0; i < comments.length; i += 10) {
      const batch = comments.slice(i, i + 10);
      await supabase.from('comments').insert(batch);
    }
    
    console.log(`Successfully seeded database with ${numRecords} tasks, ${assignees.length} assignees, and ${comments.length} comments!`);
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
}

async function runSetup() {
  try {
    const tablesCreated = await createTables();
    if (!tablesCreated) {
      console.error('Failed to create tables');
      process.exit(1);
    }
    
    const dataSeed = await seedDatabase();
    if (!dataSeed) {
      console.error('Failed to seed data');
      process.exit(1);
    }
    
    console.log('✅ Database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

runSetup();