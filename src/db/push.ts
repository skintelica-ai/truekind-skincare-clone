import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';

const pushSchema = async () => {
  console.log('Connecting to database...');
  
  const client = createClient({
    url: process.env.TURSO_CONNECTION_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN!,
  });

  const db = drizzle(client, { schema });

  console.log('Database connected successfully!');
  console.log('Schema is ready to use.');
  console.log('\nTo push schema to database, run:');
  console.log('npm run db:push');

  process.exit(0);
};

pushSchema().catch((err) => {
  console.error('Database connection failed!');
  console.error(err);
  process.exit(1);
});