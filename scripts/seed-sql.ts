#!/usr/bin/env ts-node
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function runSqlFile() {
  console.log('🌱 Running SQL seed file...');

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'db', 'seed.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Process the SQL content line by line to preserve order and handle multi-line statements properly
    const lines = sqlContent.split('\n');
    const statements: string[] = [];
    let currentStatement = '';
    let inStatement = false;

    for (const line of lines) {
      const trimmedLine = line.trim();

      // Skip empty lines and comment-only lines
      if (
        !trimmedLine ||
        trimmedLine.startsWith('--') ||
        trimmedLine.match(/^-+$/)
      ) {
        continue;
      }

      // Skip database connection commands
      if (trimmedLine.startsWith('\\c ')) {
        continue;
      }

      // Check if this line starts a new statement
      if (trimmedLine.toUpperCase().startsWith('INSERT INTO')) {
        // If we were already building a statement, finish it first
        if (inStatement && currentStatement.trim()) {
          statements.push(currentStatement.trim());
        }
        currentStatement = line;
        inStatement = true;
      } else if (inStatement) {
        // Continue building the current statement
        currentStatement += '\n' + line;
      }

      // Check if this line ends the current statement
      if (inStatement && trimmedLine.endsWith(';')) {
        statements.push(currentStatement.trim());
        currentStatement = '';
        inStatement = false;
      }
    }

    // Add any remaining statement
    if (inStatement && currentStatement.trim()) {
      statements.push(currentStatement.trim());
    }

    console.log(`📊 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.trim() === '') {
        continue;
      }

      try {
        // Extract table name for better logging
        const tableMatch = statement.match(/INSERT INTO (\w+)/i);
        const tableName = tableMatch ? tableMatch[1] : 'unknown';

        console.log(
          `Executing statement ${i + 1}/${statements.length} (${tableName})...`,
        );
        await prisma.$executeRawUnsafe(statement);
      } catch (error) {
        console.error(
          `❌ Error executing statement ${i + 1}:`,
          statement.split('\n')[0].substring(0, 100) + '...',
        );
        console.error('Error:', error);
        // Continue with next statement
      }
    }

    console.log('✅ SQL seed file executed successfully!');
  } catch (error) {
    console.error('❌ Error reading or executing SQL file:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

runSqlFile().catch((error) => {
  console.error(error);
  process.exit(1);
});
