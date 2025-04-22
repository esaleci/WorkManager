import { supabase } from './supabase';
import { 
  MemStorage, 
  storage as memStorage 
} from './storage';

// Function to create all tables in Supabase
async function createTables() {
  console.log('Creating tables in Supabase...');
  
  try {
    // Create users table
    const { error: usersError } = await supabase.from('users').select('id').limit(1);
    if (usersError && usersError.code === '42P01') { // Table doesn't exist
      console.log('Creating users table...');
      await supabase.rpc('create_users_table');
    }
    
    // Create workspaces table
    const { error: workspacesError } = await supabase.from('workspaces').select('id').limit(1);
    if (workspacesError && workspacesError.code === '42P01') {
      console.log('Creating workspaces table...');
      await supabase.rpc('create_workspaces_table');
    }
    
    // Create tasks table
    const { error: tasksError } = await supabase.from('tasks').select('id').limit(1);
    if (tasksError && tasksError.code === '42P01') {
      console.log('Creating tasks table...');
      await supabase.rpc('create_tasks_table');
    }
    
    // Create task_assignees table
    const { error: assigneesError } = await supabase.from('task_assignees').select('id').limit(1);
    if (assigneesError && assigneesError.code === '42P01') {
      console.log('Creating task_assignees table...');
      await supabase.rpc('create_task_assignees_table');
    }
    
    // Create task_attachments table
    const { error: attachmentsError } = await supabase.from('task_attachments').select('id').limit(1);
    if (attachmentsError && attachmentsError.code === '42P01') {
      console.log('Creating task_attachments table...');
      await supabase.rpc('create_task_attachments_table');
    }
    
    // Create voice_notes table
    const { error: voiceNotesError } = await supabase.from('voice_notes').select('id').limit(1);
    if (voiceNotesError && voiceNotesError.code === '42P01') {
      console.log('Creating voice_notes table...');
      await supabase.rpc('create_voice_notes_table');
    }
    
    // Create comments table
    const { error: commentsError } = await supabase.from('comments').select('id').limit(1);
    if (commentsError && commentsError.code === '42P01') {
      console.log('Creating comments table...');
      await supabase.rpc('create_comments_table');
    }
    
    console.log('All tables created successfully!');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

// Function to seed the database with initial data
async function seedDatabase() {
  console.log('Seeding database with initial data...');
  
  try {
    // Check if data already exists
    const { data: existingUsers, error: usersCheckError } = await supabase
      .from('users')
      .select('count');
    
    if (usersCheckError) {
      console.error('Error checking users:', usersCheckError);
      return;
    }
    
    if (existingUsers[0].count > 0) {
      console.log('Database already has data, skipping seed.');
      return;
    }
    
    // Get seed data from MemStorage
    // 1. Users
    await supabase.from('users').insert([
      {
        username: 'sarahchen',
        password: 'password123', // In production, this would be hashed
        fullName: 'Sarah Chen',
        email: 'sarah@example.com',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=Sarah',
        createdAt: new Date().toISOString()
      }
    ]);
    
    // 2. Workspaces
    await supabase.from('workspaces').insert([
      {
        name: 'Marketing',
        description: 'Marketing campaigns and content creation',
        color: '#0073ea',
        createdAt: new Date().toISOString()
      },
      {
        name: 'Development',
        description: 'Product development and engineering',
        color: '#00c875',
        createdAt: new Date().toISOString()
      },
      {
        name: 'Sales',
        description: 'Sales activities and client management',
        color: '#ff7575',
        createdAt: new Date().toISOString()
      }
    ]);
    
    // 3. Tasks
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    await supabase.from('tasks').insert([
      {
        title: 'Client meeting for website redesign',
        description: 'Discuss project scope, timeline, and requirements with the client',
        status: 'to-do',
        priority: 'high',
        startDate: now.toISOString(),
        endDate: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
        totalBudget: 5000,
        paidAmount: 2500,
        workspaceId: 1,
        createdById: 1,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      },
      {
        title: 'Prepare Q4 budget proposal',
        description: 'Compile financial data and create budget proposal for Q4',
        status: 'in-progress',
        priority: 'medium',
        startDate: now.toISOString(),
        endDate: tomorrow.toISOString(),
        totalBudget: 0,
        paidAmount: 0,
        workspaceId: 1,
        createdById: 1,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      },
      {
        title: 'Update landing page content',
        description: 'Revise copy and update images on the main landing page',
        status: 'to-do',
        priority: 'medium',
        startDate: tomorrow.toISOString(),
        endDate: new Date(tomorrow.getTime() + 3 * 60 * 60 * 1000).toISOString(), // 3 hours later
        totalBudget: 1500,
        paidAmount: 0,
        workspaceId: 1,
        createdById: 1,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      },
      {
        title: 'Team stand-up meeting',
        description: 'Daily team stand-up to discuss progress and blockers',
        status: 'to-do',
        priority: 'medium',
        startDate: tomorrow.toISOString(),
        endDate: new Date(tomorrow.getTime() + 30 * 60 * 1000).toISOString(), // 30 minutes later
        totalBudget: 0,
        paidAmount: 0,
        workspaceId: 2,
        createdById: 1,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      },
      {
        title: 'Product roadmap review',
        description: 'Review and prioritize features for the next quarter',
        status: 'to-do',
        priority: 'high',
        startDate: nextWeek.toISOString(),
        endDate: new Date(nextWeek.getTime() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours later
        totalBudget: 0,
        paidAmount: 0,
        workspaceId: 2,
        createdById: 1,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      }
    ]);
    
    // 4. Task assignees
    await supabase.from('task_assignees').insert([
      {
        taskId: 1,
        userId: 1,
        assignedAt: now.toISOString()
      },
      {
        taskId: 2,
        userId: 1,
        assignedAt: now.toISOString()
      },
      {
        taskId: 3,
        userId: 1,
        assignedAt: now.toISOString()
      }
    ]);
    
    // 5. Comments
    await supabase.from('comments').insert([
      {
        taskId: 1,
        userId: 1,
        content: 'Let\'s prepare a detailed agenda for this meeting',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      },
      {
        taskId: 2,
        userId: 1,
        content: 'We need to include the new marketing campaign expenses',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString()
      }
    ]);
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Set up stored procedures/functions in Supabase for table creation
async function setupStoredProcedures() {
  console.log('Setting up stored procedures...');
  
  try {
    // Create users table function
    await supabase.rpc('create_function_users_table', {
      function_sql: `
        CREATE OR REPLACE FUNCTION create_users_table()
        RETURNS void AS $$
        BEGIN
          CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            full_name TEXT NOT NULL,
            email TEXT NOT NULL,
            avatar_url TEXT,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
          );
        END;
        $$ LANGUAGE plpgsql;
      `
    });
    
    // Create workspaces table function
    await supabase.rpc('create_function_workspaces_table', {
      function_sql: `
        CREATE OR REPLACE FUNCTION create_workspaces_table()
        RETURNS void AS $$
        BEGIN
          CREATE TABLE IF NOT EXISTS workspaces (
            id SERIAL PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            color TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
          );
        END;
        $$ LANGUAGE plpgsql;
      `
    });
    
    // Create tasks table function
    await supabase.rpc('create_function_tasks_table', {
      function_sql: `
        CREATE OR REPLACE FUNCTION create_tasks_table()
        RETURNS void AS $$
        BEGIN
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
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
            FOREIGN KEY (created_by_id) REFERENCES users(id)
          );
        END;
        $$ LANGUAGE plpgsql;
      `
    });
    
    // Create task_assignees table function
    await supabase.rpc('create_function_task_assignees_table', {
      function_sql: `
        CREATE OR REPLACE FUNCTION create_task_assignees_table()
        RETURNS void AS $$
        BEGIN
          CREATE TABLE IF NOT EXISTS task_assignees (
            id SERIAL PRIMARY KEY,
            task_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id),
            UNIQUE(task_id, user_id)
          );
        END;
        $$ LANGUAGE plpgsql;
      `
    });
    
    // Create task_attachments table function
    await supabase.rpc('create_function_task_attachments_table', {
      function_sql: `
        CREATE OR REPLACE FUNCTION create_task_attachments_table()
        RETURNS void AS $$
        BEGIN
          CREATE TABLE IF NOT EXISTS task_attachments (
            id SERIAL PRIMARY KEY,
            task_id INTEGER NOT NULL,
            file_name TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            file_type TEXT NOT NULL,
            file_url TEXT NOT NULL,
            uploaded_by_id INTEGER NOT NULL,
            uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
            FOREIGN KEY (uploaded_by_id) REFERENCES users(id)
          );
        END;
        $$ LANGUAGE plpgsql;
      `
    });
    
    // Create voice_notes table function
    await supabase.rpc('create_function_voice_notes_table', {
      function_sql: `
        CREATE OR REPLACE FUNCTION create_voice_notes_table()
        RETURNS void AS $$
        BEGIN
          CREATE TABLE IF NOT EXISTS voice_notes (
            id SERIAL PRIMARY KEY,
            task_id INTEGER NOT NULL,
            file_name TEXT NOT NULL,
            file_size INTEGER NOT NULL,
            duration INTEGER NOT NULL,
            file_url TEXT NOT NULL,
            recorded_by_id INTEGER NOT NULL,
            recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
            FOREIGN KEY (recorded_by_id) REFERENCES users(id)
          );
        END;
        $$ LANGUAGE plpgsql;
      `
    });
    
    // Create comments table function
    await supabase.rpc('create_function_comments_table', {
      function_sql: `
        CREATE OR REPLACE FUNCTION create_comments_table()
        RETURNS void AS $$
        BEGIN
          CREATE TABLE IF NOT EXISTS comments (
            id SERIAL PRIMARY KEY,
            task_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
            FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users(id)
          );
        END;
        $$ LANGUAGE plpgsql;
      `
    });
    
    console.log('Stored procedures created successfully!');
  } catch (error) {
    console.error('Error setting up stored procedures:', error);
    throw error;
  }
}

// Main setup function
export async function setupSupabase() {
  try {
    console.log('Starting Supabase setup...');
    
    await setupStoredProcedures();
    await createTables();
    await seedDatabase();
    
    console.log('Supabase setup completed successfully!');
    return true;
  } catch (error) {
    console.error('Supabase setup failed:', error);
    return false;
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupSupabase()
    .then(success => {
      if (success) {
        console.log('Setup completed successfully!');
        process.exit(0);
      } else {
        console.error('Setup failed!');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Setup error:', error);
      process.exit(1);
    });
}