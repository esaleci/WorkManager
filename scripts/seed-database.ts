#!/usr/bin/env tsx

import { seedDatabase } from '../server/seed-data';

const NUM_RECORDS = 100; // Change this to control how many task records to create

console.log(`Starting database seeding with ${NUM_RECORDS} records...`);

seedDatabase(NUM_RECORDS)
  .then(success => {
    if (success) {
      console.log(`✅ Successfully seeded database with ${NUM_RECORDS} records!`);
      process.exit(0);
    } else {
      console.error('❌ Failed to seed database!');
      process.exit(1);
    }
  })
  .catch(error => {
    console.error('Unexpected error during seeding:', error);
    process.exit(1);
  });