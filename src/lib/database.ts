
import { getDatabaseConfig } from '@/config/database';

// Database client untuk PostgreSQL hosting
class DatabaseClient {
  private config;

  constructor() {
    this.config = getDatabaseConfig();
  }

  // Simulate Supabase-like interface untuk compatibility
  async query(sql: string, params: any[] = []) {
    try {
      const response = await fetch('/api/database/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sql, params })
      });

      if (!response.ok) {
        throw new Error(`Database query failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  // Simulate Supabase table operations
  from(table: string) {
    return {
      select: (columns = '*') => ({
        eq: (column: string, value: any) => this.query(
          `SELECT ${columns} FROM ${table} WHERE ${column} = $1`,
          [value]
        ),
        order: (column: string, options?: { ascending?: boolean }) => {
          const direction = options?.ascending ? 'ASC' : 'DESC';
          return this.query(`SELECT ${columns} FROM ${table} ORDER BY ${column} ${direction}`);
        },
        limit: (count: number) => this.query(
          `SELECT ${columns} FROM ${table} LIMIT $1`,
          [count]
        ),
        single: () => this.query(`SELECT ${columns} FROM ${table} LIMIT 1`),
        maybeSingle: () => this.query(`SELECT ${columns} FROM ${table} LIMIT 1`)
      }),
      insert: (data: any) => ({
        select: () => this.query(
          `INSERT INTO ${table} (${Object.keys(data).join(', ')}) VALUES (${Object.keys(data).map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`,
          Object.values(data)
        ),
        single: () => this.query(
          `INSERT INTO ${table} (${Object.keys(data).join(', ')}) VALUES (${Object.keys(data).map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *`,
          Object.values(data)
        )
      }),
      update: (data: any) => ({
        eq: (column: string, value: any) => ({
          select: () => this.query(
            `UPDATE ${table} SET ${Object.keys(data).map((key, i) => `${key} = $${i + 1}`).join(', ')} WHERE ${column} = $${Object.keys(data).length + 1} RETURNING *`,
            [...Object.values(data), value]
          ),
          single: () => this.query(
            `UPDATE ${table} SET ${Object.keys(data).map((key, i) => `${key} = $${i + 1}`).join(', ')} WHERE ${column} = $${Object.keys(data).length + 1} RETURNING *`,
            [...Object.values(data), value]
          )
        })
      }),
      delete: () => ({
        eq: (column: string, value: any) => this.query(
          `DELETE FROM ${table} WHERE ${column} = $1`,
          [value]
        )
      })
    };
  }
}

export const database = new DatabaseClient();
