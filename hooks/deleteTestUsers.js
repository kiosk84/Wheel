// Script to delete test users from the database
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// Connect to the database
const dbPath = path.join(__dirname, 'functions', 'db', 'fortune.db');
console.log('Attempting to connect to database at:', dbPath);

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the database');
});

// List of test user IDs to delete
const testIds = ['test_user1', 'test_user2', 'test_user3'];
console.log('Deleting test users with IDs:', testIds);

// Delete test users from both tables
db.serialize(() => {
  // Begin transaction
  db.run('BEGIN TRANSACTION');
  
  let deletedCount = 0;
  let errorCount = 0;
  
  // Delete from pending table
  for (const tid of testIds) {
    db.run('DELETE FROM pending WHERE telegramId = ?', [tid], function(err) {
      if (err) {
        console.error(`Error deleting ${tid} from pending:`, err.message);
        errorCount++;
      } else if (this.changes > 0) {
        console.log(`Deleted ${tid} from pending table (${this.changes} rows)`);
        deletedCount += this.changes;
      }
    });
  }
  
  // Delete from participants table
  for (const tid of testIds) {
    db.run('DELETE FROM participants WHERE telegramId = ?', [tid], function(err) {
      if (err) {
        console.error(`Error deleting ${tid} from participants:`, err.message);
        errorCount++;
      } else if (this.changes > 0) {
        console.log(`Deleted ${tid} from participants table (${this.changes} rows)`);
        deletedCount += this.changes;
      }
    });
  }
  
  // Commit transaction
  db.run('COMMIT', (err) => {
    if (err) {
      console.error('Error committing transaction:', err.message);
      db.run('ROLLBACK');
    } else {
      console.log(`Operation completed. Deleted ${deletedCount} entries with ${errorCount} errors.`);
    }
    
    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
    });
  });
});
