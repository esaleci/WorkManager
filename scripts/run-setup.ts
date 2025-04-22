#!/usr/bin/env tsx

import { runSetup } from '../server/setupSupabase';

// Run the setup
runSetup()
  .then(success => {
    if (success) {
      console.log('Database setup completed successfully!');
      process.exit(0);
    } else {
      console.error('Database setup failed!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Error during setup:', error);
    process.exit(1);
  });