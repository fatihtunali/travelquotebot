const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const localEnvPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath });
} else {
  dotenv.config();
}

const requiredEnvVars = [
  'DATABASE_HOST',
  'DATABASE_USER',
  'DATABASE_PASSWORD',
  'DATABASE_NAME',
];

const missingEnv = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  throw new Error(
    `Missing required database environment variables: ${missingEnv.join(', ')}`
  );
}

async function exportSchema() {
  const connection = await mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
  });

  try {
    // Get all tables
    const [tables] = await connection.execute('SHOW TABLES');

    let markdown = '# TravelQuoteBot Database Schema\n\n';
    markdown += '---\n\n';

    // For each table, get structure and sample data count
    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];

      // Get table structure
      const [columns] = await connection.execute(`DESCRIBE ${tableName}`);

      // Get row count
      const [countResult] = await connection.execute(
        `SELECT COUNT(*) as count FROM ${tableName}`
      );
      const rowCount = countResult[0].count;

      // Get CREATE TABLE statement
      const [createTable] = await connection.execute(
        `SHOW CREATE TABLE ${tableName}`
      );
      const createStatement = createTable[0]['Create Table'];

      markdown += `## Table: \`${tableName}\`\n\n`;
      markdown += `**Row Count:** ${rowCount}\n\n`;
      markdown += '### Columns\n\n';
      markdown += '| Field | Type | Null | Key | Default | Extra |\n';
      markdown += '|-------|------|------|-----|---------|-------|\n';

      for (const col of columns) {
        markdown += `| ${col.Field} | ${col.Type} | ${col.Null} | ${
          col.Key || '-'
        } | ${col.Default || 'NULL'} | ${col.Extra || '-'} |\n`;
      }

      markdown += '\n### CREATE TABLE Statement\n\n';
      markdown += '```sql\n';
      markdown += createStatement;
      markdown += '\n```\n\n';

      // Get sample data (first 3 rows)
      const [sampleData] = await connection.execute(
        `SELECT * FROM ${tableName} LIMIT 3`
      );
      if (sampleData.length > 0) {
        markdown += '### Sample Data (First 3 rows)\n\n';
        markdown += '```json\n';
        markdown += JSON.stringify(sampleData, null, 2);
        markdown += '\n```\n\n';
      }

      markdown += '---\n\n';
    }

    // Write to file
    fs.writeFileSync('DATABASE_SCHEMA.md', markdown);
    console.log('Database schema exported to DATABASE_SCHEMA.md');
  } catch (error) {
    console.error('Error exporting schema:', error);
  } finally {
    await connection.end();
  }
}

exportSchema();
