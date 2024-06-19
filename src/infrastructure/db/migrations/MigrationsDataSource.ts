import * as path from 'path';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.PG_PORT) {
  throw new Error('Environment variable PG_PORT is not defined');
}

export const migrationDS = new DataSource({
  type: 'postgres',
  host: process.env.HOST,
  port: parseInt(process.env.PG_PORT, 10) || 5432,
  username: process.env.DB_USER,
  password: process.env.PSW,
  database: process.env.DATABASE,
  migrations: [path.resolve(__dirname, 'migrations', '*')],
  ssl: process.env.SSL === 'true',
  extra: {
    ssl: process.env.SSL === 'true' ? {
      rejectUnauthorized: false,
    } : null,
  },
});
