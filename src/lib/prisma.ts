import { PrismaClient } from '@prisma/client';
import { PrismaNeonHTTP } from '@prisma/adapter-neon';
import { neon } from '@neondatabase/serverless';

function createPrismaClient() {
  // PrismaNeonHTTP necesita la URL directa (sin pooler ni channel_binding)
  const rawUrl = process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL!;
  // Eliminar channel_binding si está presente (no compatible con HTTP driver)
  const connectionString = rawUrl.replace(/[?&]channel_binding=[^&]*/g, '').replace(/[?&]$/, '');
  const sql = neon(connectionString);
  const adapter = new PrismaNeonHTTP(sql);
  return new PrismaClient({ adapter } as any);
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
