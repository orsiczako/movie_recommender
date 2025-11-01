const fs = require('fs');
const path = require('path');

/**
 * Database Migration Script for Render.com Deployment
 * Supports both MySQL and PostgreSQL databases
 * Automatically creates tables if they don't exist
 */
async function runMigration() {
  console.log('Starting database migration...');

  const dbType = process.env.DB_TYPE || 'mysql';
  console.log('Database type:', dbType);

  // Get database connection details from environment variables
  const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || (dbType === 'postgres' ? 5432 : 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASS || process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  };

  console.log('Connecting to database:', {
    type: dbType,
    host: dbConfig.host,
    port: dbConfig.port,
    user: dbConfig.user,
    database: dbConfig.database
  });

  let connection;
  try {
    // Create connection based on database type
    if (dbType === 'postgres') {
      const { Client } = require('pg');
      connection = new Client({
        host: dbConfig.host,
        port: dbConfig.port,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
        ssl: process.env.NODE_ENV === 'production' ? {
          require: true,
          rejectUnauthorized: false
        } : false
      });
      await connection.connect();
    } else {
      const mysql = require('mysql2/promise');
      connection = await mysql.createConnection({
        ...dbConfig,
        multipleStatements: true
      });
    }
    
    console.log('Database connection established');

    // Read the SQL setup file
    const sqlPath = path.join(__dirname, '..', 'database_setup.sql');
    let sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Convert MySQL syntax to PostgreSQL if needed
    if (dbType === 'postgres') {
      sqlContent = convertMySQLToPostgreSQL(sqlContent);
    }

    console.log('Loaded and processed database_setup.sql');

    // Execute the SQL commands
    if (dbType === 'postgres') {
      await connection.query(sqlContent);
    } else {
      await connection.execute(sqlContent);
    }
    
    console.log('Database migration completed successfully');

    // Verify tables were created
    let tables;
    if (dbType === 'postgres') {
      const result = await connection.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      tables = result.rows.map(row => row.table_name);
    } else {
      const [results] = await connection.execute('SHOW TABLES');
      tables = results.map(row => Object.values(row)[0]);
    }
    
    console.log('Created tables:', tables);
    console.log('Migration completed successfully!');

  } catch (error) {
    console.error('Migration failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  } finally {
    if (connection) {
      if (dbType === 'postgres') {
        await connection.end();
      } else {
        await connection.end();
      }
      console.log('Database connection closed');
    }
  }
}

/**
 * Convert MySQL SQL syntax to PostgreSQL
 */
function convertMySQLToPostgreSQL(sql) {
  return sql
    // Convert AUTO_INCREMENT to SERIAL
    .replace(/AUTO_INCREMENT/gi, '')
    .replace(/INT\s+PRIMARY KEY/gi, 'SERIAL PRIMARY KEY')
    .replace(/BIGINT\s+PRIMARY KEY/gi, 'BIGSERIAL PRIMARY KEY')
    
    // Convert MySQL data types to PostgreSQL
    .replace(/TINYINT\(1\)/gi, 'BOOLEAN')
    .replace(/TINYINT/gi, 'SMALLINT')
    .replace(/LONGTEXT/gi, 'TEXT')
    .replace(/DATETIME/gi, 'TIMESTAMP')
    .replace(/DOUBLE/gi, 'DOUBLE PRECISION')
    
    // Convert backticks to double quotes
    .replace(/`([^`]+)`/g, '"$1"')
    
    // Convert ENGINE and CHARSET clauses (remove them for PostgreSQL)
    .replace(/ENGINE=\w+/gi, '')
    .replace(/DEFAULT CHARSET=\w+/gi, '')
    .replace(/COLLATE=\w+/gi, '')
    
    // Handle IF NOT EXISTS
    .replace(/CREATE TABLE IF NOT EXISTS/gi, 'CREATE TABLE IF NOT EXISTS')
    
    // Clean up extra commas and whitespace
    .replace(/,\s*\)/g, ')')
    .replace(/\s+/g, ' ')
    .trim();
}

// Run migration if this file is executed directly
if (require.main === module) {
  runMigration();
}

module.exports = runMigration;