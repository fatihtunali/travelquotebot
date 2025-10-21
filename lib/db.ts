import mysql from 'mysql2/promise';

const requiredEnvVars = [
  'DATABASE_HOST',
  'DATABASE_USER',
  'DATABASE_PASSWORD',
  'DATABASE_NAME',
] as const;

const missingEnv = requiredEnvVars.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  throw new Error(
    `Missing required database environment variables: ${missingEnv.join(', ')}`
  );
}

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DATABASE_HOST!,
  port: parseInt(process.env.DATABASE_PORT || '3306', 10),
  user: process.env.DATABASE_USER!,
  password: process.env.DATABASE_PASSWORD!,
  database: process.env.DATABASE_NAME!,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Test connection
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Database connected successfully');
    connection.release();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

// Query helper with proper typing
export async function query<T = any>(
  sql: string,
  params?: any[]
): Promise<T[]> {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Single row query
export async function queryOne<T = any>(
  sql: string,
  params?: any[]
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] || null;
}

// Execute (for INSERT, UPDATE, DELETE)
export async function execute(sql: string, params?: any[]) {
  try {
    const [result] = await pool.execute(sql, params);
    return result;
  } catch (error) {
    console.error('Database execute error:', error);
    throw error;
  }
}

// Fetch training examples for AI learning with intelligent selection
export async function getTrainingExamples(days: number, tourType: string = 'Private', limit: number = 2) {
  try {
    const normalizedDays = Number.isFinite(days) ? Number(days) : Number(days ?? 0);
    const normalizedTourType = tourType || 'Private';
    const normalizedLimit = Number.isFinite(limit) ? Number(limit) : Number(limit ?? 0);
    const safeLimit = Math.max(0, Math.min(Math.trunc(normalizedLimit), 10));

    if (safeLimit === 0) {
      return [];
    }

    // Strategy: Get diverse examples (different city combinations) for better learning
    // 1. Try exact day match first
    let examples = await query<{title: string; days: number; cities: string; content: string; quality_score: number}>(
      `SELECT title, days, cities, content,
              COALESCE(quality_score, 3) as quality_score
       FROM training_itineraries
       WHERE days = ? AND tour_type = ?
       ORDER BY quality_score DESC, created_at DESC
       LIMIT ${safeLimit}`,
      [normalizedDays, normalizedTourType]
    );

    // 2. If not enough examples, get similar duration (+/- 1 day)
    if (examples.length < safeLimit) {
      const remaining = safeLimit - examples.length;

      if (remaining > 0) {
        const additionalExamples = await query<{title: string; days: number; cities: string; content: string; quality_score: number}>(
          `SELECT title, days, cities, content,
                  COALESCE(quality_score, 3) as quality_score
           FROM training_itineraries
           WHERE days BETWEEN ? AND ? AND tour_type = ?
             AND days != ?
           ORDER BY quality_score DESC, ABS(days - ?) ASC, created_at DESC
           LIMIT ${remaining}`,
          [normalizedDays - 1, normalizedDays + 1, normalizedTourType, normalizedDays, normalizedDays]
        );
        examples = [...examples, ...additionalExamples];
      }
    }

    // 3. Diversify: prefer examples with different city combinations
    const diversifiedExamples = diversifyExamples(examples, safeLimit);

    return diversifiedExamples;
  } catch (error) {
    console.error('Error fetching training examples:', error);
    return [];
  }
}

// Helper: Diversify examples by selecting different city combinations
function diversifyExamples(examples: any[], limit: number): any[] {
  if (examples.length <= limit) return examples;

  const selected: any[] = [];
  const seenCityCombos = new Set<string>();

  // First pass: select examples with unique city combinations
  for (const example of examples) {
    const cityKey = example.cities.toLowerCase().replace(/\s/g, '');
    if (!seenCityCombos.has(cityKey)) {
      selected.push(example);
      seenCityCombos.add(cityKey);
      if (selected.length >= limit) break;
    }
  }

  // Second pass: fill remaining slots with highest quality
  if (selected.length < limit) {
    for (const example of examples) {
      if (!selected.includes(example)) {
        selected.push(example);
        if (selected.length >= limit) break;
      }
    }
  }

  return selected;
}

export default pool;

