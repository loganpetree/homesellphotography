import 'dotenv/config';
import { startMigration } from '../lib/hdphotohub-migration';
import { runVerification } from '../lib/migration-verification';

async function runTestMigration() {
  try {
    console.log('Starting test migration with 5 orders...');
    await startMigration({ limit: 5 });
    
    console.log('\nRunning verification...');
    await runVerification();
  } catch (error) {
    console.error('Test migration failed:', error);
    process.exit(1);
  }
}

runTestMigration();
