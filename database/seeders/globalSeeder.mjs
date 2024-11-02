// database/seeders/globalSeeder.js
import { connectDB, disconnectDB } from '../connection.mjs';
import seedSlots from './slotSeeder.mjs';  // Import your slot seeder
// import seedUsers from './userSeeder.js'; // Uncomment if you have a user seeder

async function runSeeders() {
  await connectDB();

  try {
    await seedSlots();         // Seed slots
    // await seedUsers();       // Uncomment to seed users or other collections
    console.log('All seeders have run successfully');
  } catch (error) {
    console.error('Error running seeders:', error);
  } finally {
    await disconnectDB();
  }
}

runSeeders();
