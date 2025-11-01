const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

/**
 * Database Migration Script for Railway Deployment
 * Automatically creates tables if they don't exist
 */
async function runMigration() {
  console.log('Starting database migration...');

  // Get database connection details from environment variables
  const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    multipleStatements: true
  };

  console.log('Connecting to database:', {
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database
  });

  let connection;
  try {
    // Create connection
    connection = await mysql.createConnection(dbConfig);
    console.log('Database connection established');

    // Read the SQL setup file
    const sqlPath = path.join(__dirname, 'database_setup.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    console.log('Loaded database_setup.sql');

    // Execute the SQL commands
    const [results] = await connection.execute(sqlContent);
    console.log('Database migration completed successfully');

    // Verify tables were created
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Created tables:', tables.map(row => Object.values(row)[0]));

    console.log('Migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  runMigration();
}

module.exports = runMigration;