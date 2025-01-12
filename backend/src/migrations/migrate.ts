import fs from 'fs';
import path from 'path';
import db from '../services/database';

async function runMigration() {
  try {
    const sqlPath = path.join(__dirname, 'migrations_1.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    await db.none(sqlContent);
    
    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();