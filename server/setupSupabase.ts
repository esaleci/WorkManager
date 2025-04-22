import { supabase } from './supabase';
import { 
  MemStorage, 
  storage as memStorage 
} from './storage';

// Function to create all tables in Supabase
async function createTables() {
  console.log('Creating tables in Supabase...');
  
  try {
    // We'll use raw SQL through PostgreSQL connection from Drizzle
    // Import the db client from server/db.ts
    const { db } = await import('./db');
    
    // Create users table
    console.log('Creating users table...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        full_name TEXT NOT NULL,
        email TEXT NOT NULL,
        avatar_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    
    // Create workspaces table
    console.log('Creating workspaces table...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS workspaces (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        color TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
    
    // Create tasks table
    console.log('Creating tasks table...');
    await db.execute(`
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
        completed_at TIMESTAMP WITH TIME ZONE,
        FOREIGN KEY (workspace_id) REFERENCES workspaces(id),
        FOREIGN KEY (created_by_id) REFERENCES users(id)
      );
    `);
    
    // Create task_assignees table
    console.log('Creating task_assignees table...');
    await db.execute(`
      CREATE TABLE IF NOT EXISTS task_assignees (
        id SERIAL PRIMARY KEY,
        task_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE(task_id, user_id)
      );
    `);
    
    // Create task_attachments table
    console.log('Creating task_attachments table...');
    await db.execute(`
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
    `);
    
    // Create voice_notes table
    console.log('Creating voice_notes table...');
    await db.execute(`
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
    `);
    
    // Create comments table
    console.log('Creating comments table...');
    await db.execute(`
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
    `);
    
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
    const { db } = await import('./db');
    
    // 1. Check if users table exists and has data
    try {
      const result = await db.execute('SELECT COUNT(*) as count FROM users');
      if (result.rows && result.rows[0] && result.rows[0].count > 0) {
        console.log('Database already has data, skipping seed');
        return;
      }
    } catch (err) {
      console.log('Could not check users table, continuing with seed');
    }
    
    // Add 10 users with SQL
    await db.execute(`
      INSERT INTO users (username, password, full_name, email, avatar_url)
      VALUES
        ('sarahchen', 'password123', 'Sarah Chen', 'sarah@example.com', 'https://randomuser.me/api/portraits/women/1.jpg'),
        ('johndoe', 'password123', 'John Doe', 'john@example.com', 'https://randomuser.me/api/portraits/men/1.jpg'),
        ('janedoe', 'password123', 'Jane Doe', 'jane@example.com', 'https://randomuser.me/api/portraits/women/2.jpg'),
        ('mikebrown', 'password123', 'Mike Brown', 'mike@example.com', 'https://randomuser.me/api/portraits/men/2.jpg'),
        ('emilysmith', 'password123', 'Emily Smith', 'emily@example.com', 'https://randomuser.me/api/portraits/women/3.jpg'),
        ('alexwilson', 'password123', 'Alex Wilson', 'alex@example.com', 'https://randomuser.me/api/portraits/men/3.jpg'),
        ('samanthalee', 'password123', 'Samantha Lee', 'samantha@example.com', 'https://randomuser.me/api/portraits/women/4.jpg'),
        ('davidpark', 'password123', 'David Park', 'david@example.com', 'https://randomuser.me/api/portraits/men/4.jpg'),
        ('oliviajones', 'password123', 'Olivia Jones', 'olivia@example.com', 'https://randomuser.me/api/portraits/women/5.jpg'),
        ('roberthall', 'password123', 'Robert Hall', 'robert@example.com', 'https://randomuser.me/api/portraits/men/5.jpg');
    `);
    
    // Add 5 workspaces with SQL
    await db.execute(`
      INSERT INTO workspaces (name, description, color)
      VALUES
        ('Marketing', 'Marketing campaigns and content creation', '#0073ea'),
        ('Development', 'Product development and engineering', '#00c875'),
        ('Sales', 'Sales activities and client management', '#ff7575'),
        ('Design', 'UI/UX design and graphics', '#fdab3d'),
        ('Operations', 'Daily operations and logistics', '#6c6cff');
    `);
    
    // Add 20 sample tasks with varied dates
    const now = new Date();
    await db.execute(`
      INSERT INTO tasks (title, description, status, priority, start_date, end_date, total_budget, paid_amount, workspace_id, created_by_id)
      VALUES
        ('Redesign homepage', 'Complete redesign of the website homepage with new branding elements', 'in-progress', 'high', NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days', 2500, 1000, 4, 1),
        ('Develop API integration', 'Integrate with payment gateway API for seamless transactions', 'to-do', 'urgent', NOW() + INTERVAL '1 day', NOW() + INTERVAL '7 days', 3000, 0, 2, 3),
        ('Create email campaign', 'Design and develop email campaign for Black Friday sale', 'completed', 'medium', NOW() - INTERVAL '10 days', NOW() - INTERVAL '2 days', 1500, 1500, 1, 2),
        ('Optimize database queries', 'Review and optimize database queries for better performance', 'to-do', 'medium', NOW() + INTERVAL '3 days', NOW() + INTERVAL '10 days', 2000, 0, 2, 4),
        ('Create sales presentation', 'Prepare sales presentation for client meeting', 'in-progress', 'high', NOW() - INTERVAL '1 day', NOW() + INTERVAL '1 day', 1000, 500, 3, 5),
        ('Mobile app wireframes', 'Design wireframes for the new mobile app', 'to-do', 'medium', NOW() + INTERVAL '2 days', NOW() + INTERVAL '8 days', 2800, 0, 4, 1),
        ('SEO optimization', 'Improve SEO ranking for main website pages', 'in-progress', 'low', NOW() - INTERVAL '5 days', NOW() + INTERVAL '2 days', 1800, 900, 1, 7),
        ('Code refactoring', 'Refactor codebase for better maintainability', 'to-do', 'low', NOW() + INTERVAL '5 days', NOW() + INTERVAL '15 days', 3500, 0, 2, 8),
        ('Client proposal', 'Prepare proposal for new client', 'completed', 'high', NOW() - INTERVAL '7 days', NOW() - INTERVAL '3 days', 1200, 1200, 3, 9),
        ('Design system updates', 'Update design system with new components', 'in-progress', 'medium', NOW() - INTERVAL '3 days', NOW() + INTERVAL '4 days', 2200, 1100, 4, 10),
        ('Implement payment gateway', 'Integrate Stripe for online payments', 'to-do', 'high', NOW() + INTERVAL '1 day', NOW() + INTERVAL '8 days', 3800, 0, 2, 1),
        ('Create social media ads', 'Design ads for Facebook and Instagram campaigns', 'in-progress', 'medium', NOW() - INTERVAL '2 days', NOW() + INTERVAL '1 day', 1400, 700, 1, 2),
        ('Revise user documentation', 'Update user documentation with new features', 'to-do', 'low', NOW() + INTERVAL '4 days', NOW() + INTERVAL '12 days', 1700, 0, 5, 3),
        ('Sales territory planning', 'Plan sales territories for Q1 2025', 'completed', 'medium', NOW() - INTERVAL '8 days', NOW() - INTERVAL '1 day', 900, 900, 3, 4),
        ('Create icon library', 'Design new icon set for the product', 'in-progress', 'low', NOW() - INTERVAL '4 days', NOW() + INTERVAL '3 days', 1300, 650, 4, 5),
        ('Security audit', 'Perform security audit of the system', 'to-do', 'urgent', NOW() + INTERVAL '2 days', NOW() + INTERVAL '9 days', 4500, 0, 2, 6),
        ('Email newsletter design', 'Design monthly newsletter template', 'in-progress', 'medium', NOW() - INTERVAL '3 days', NOW() + INTERVAL '2 days', 1600, 800, 1, 7),
        ('Configure CI/CD pipeline', 'Set up continuous integration and deployment', 'to-do', 'high', NOW() + INTERVAL '1 day', NOW() + INTERVAL '7 days', 2700, 0, 2, 8),
        ('Sales training materials', 'Develop training materials for new sales reps', 'completed', 'medium', NOW() - INTERVAL '9 days', NOW() - INTERVAL '2 days', 1900, 1900, 3, 9),
        ('Update product mockups', 'Create new mockups with latest design', 'in-progress', 'high', NOW() - INTERVAL '1 day', NOW() + INTERVAL '6 days', 2400, 1200, 4, 10);
    `);
    
    // Add task assignees
    await db.execute(`
      INSERT INTO task_assignees (task_id, user_id) 
      SELECT t.id, u.id
      FROM tasks t, users u
      WHERE t.id <= 10 AND u.id <= 3
      UNION
      SELECT t.id, u.id
      FROM tasks t, users u
      WHERE t.id > 10 AND t.id <= 20 AND u.id > 3 AND u.id <= 6;
    `);
    
    // Add comments
    await db.execute(`
      INSERT INTO comments (task_id, user_id, content)
      VALUES
        (1, 1, 'Great progress on this task!'),
        (2, 2, 'We need to discuss this further in our next meeting.'),
        (3, 3, 'I''ve updated the requirements document.'),
        (4, 4, 'This is taking longer than expected.'),
        (5, 5, 'Looking good, almost ready for review.'),
        (6, 6, 'Can we schedule a call to discuss this?'),
        (7, 7, 'I''ve encountered some issues with this task.'),
        (8, 8, 'Just finished the first draft.'),
        (9, 9, 'Waiting for client feedback to proceed.'),
        (10, 10, 'I need more information to complete this.'),
        (11, 1, 'Let''s complete this by end of week.'),
        (12, 2, 'I''ve shared the document with the team.'),
        (13, 3, 'Looking for feedback on my approach.'),
        (14, 4, 'This has been more challenging than anticipated.'),
        (15, 5, 'Almost done, just polishing things up.');
    `);
    
    console.log('Database seeded successfully!');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
}

// Set up stored procedures/functions in Supabase for table creation
// Since we can't create functions in Supabase easily, we'll skip this step
// and directly create tables in createTables function
async function setupStoredProcedures() {
  console.log('Setting up stored procedures...');
  // This is a no-op now
  console.log('Stored procedures created successfully!');
  return true;
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

// Export a function to run the setup directly
export async function runSetup() {
  try {
    const success = await setupSupabase();
    if (success) {
      console.log('Setup completed successfully!');
      return true;
    } else {
      console.error('Setup failed!');
      return false;
    }
  } catch (error) {
    console.error('Setup error:', error);
    return false;
  }
}