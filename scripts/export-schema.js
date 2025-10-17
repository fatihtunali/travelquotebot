const mysql = require('mysql2/promise');
const fs = require('fs');

async function exportSchema() {
  const connection = await mysql.createConnection({
    host: '188.132.230.193',
    port: 3306,
    user: 'tqb',
    password: 'Dlr235672.-Yt',
    database: 'tqb_db'
  });

  try {
    // Get all tables
    const [tables] = await connection.execute('SHOW TABLES');

    let markdown = '# TravelQuoteBot Database Schema\n\n';
    markdown += '**Database:** `tqb_db`\n';
    markdown += '**Host:** `188.132.230.193:3306`\n';
    markdown += '**User:** `tqb`\n\n';
    markdown += '---\n\n';

    // For each table, get structure and sample data count
    for (const tableRow of tables) {
      const tableName = Object.values(tableRow)[0];

      // Get table structure
      const [columns] = await connection.execute(`DESCRIBE ${tableName}`);

      // Get row count
      const [countResult] = await connection.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
      const rowCount = countResult[0].count;

      // Get CREATE TABLE statement
      const [createTable] = await connection.execute(`SHOW CREATE TABLE ${tableName}`);
      const createStatement = createTable[0]['Create Table'];

      markdown += `## Table: \`${tableName}\`\n\n`;
      markdown += `**Row Count:** ${rowCount}\n\n`;
      markdown += '### Columns\n\n';
      markdown += '| Field | Type | Null | Key | Default | Extra |\n';
      markdown += '|-------|------|------|-----|---------|-------|\n';

      for (const col of columns) {
        markdown += `| ${col.Field} | ${col.Type} | ${col.Null} | ${col.Key || '-'} | ${col.Default || 'NULL'} | ${col.Extra || '-'} |\n`;
      }

      markdown += '\n### CREATE TABLE Statement\n\n';
      markdown += '```sql\n';
      markdown += createStatement;
      markdown += '\n```\n\n';

      // Get sample data (first 3 rows)
      const [sampleData] = await connection.execute(`SELECT * FROM ${tableName} LIMIT 3`);
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
    console.log('✅ Database schema exported to DATABASE_SCHEMA.md');

  } catch (error) {
    console.error('❌ Error exporting schema:', error);
  } finally {
    await connection.end();
  }
}

exportSchema();
