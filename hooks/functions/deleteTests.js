// Simple script to delete test users
const db = require('./db');

const testIds = ['test_user1', 'test_user2', 'test_user3'];
console.log('Attempting to delete test users:', testIds);

// Delete from both tables
db.serialize(() => {
  for (const tid of testIds) {
    db.run('DELETE FROM pending WHERE telegramId = ?', [tid], function(err) {
      if (err) console.error(`Error deleting ${tid} from pending:`, err);
      else console.log(`Deleted ${this.changes} rows from pending for ${tid}`);
    });
    
    db.run('DELETE FROM participants WHERE telegramId = ?', [tid], function(err) {
      if (err) console.error(`Error deleting ${tid} from participants:`, err);
      else console.log(`Deleted ${this.changes} rows from participants for ${tid}`);
    });
  }
  
  // Wait a bit to ensure all operations complete before exiting
  setTimeout(() => {
    console.log('Cleanup completed');
    process.exit(0);
  }, 1000);
});
