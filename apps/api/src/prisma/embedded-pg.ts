import * as net from 'net';
import * as path from 'path';
import * as fs from 'fs';
import { PGlite } from '@electric-sql/pglite';

let activeServer: net.Server | null = null;
let activeDb: PGlite | null = null;

function isPortListening(port: number, host = '127.0.0.1'): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(400);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

function findMigrationSqlPath(): string | null {
  const candidates = [
    path.resolve(process.cwd(), 'prisma/migrations/20261117000000_init/migration.sql'),
    path.resolve(process.cwd(), 'apps/api/prisma/migrations/20261117000000_init/migration.sql'),
    path.resolve(__dirname, '../../prisma/migrations/20261117000000_init/migration.sql'),
    path.resolve(__dirname, '../../../prisma/migrations/20261117000000_init/migration.sql'),
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return null;
}

export async function ensurePostgresAvailable(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL =
      'postgresql://postgres:postgres@127.0.0.1:5432/postgres?schema=public&sslmode=disable&connection_limit=1';
  }
  const dbUrl = process.env.DATABASE_URL;

  let parsed: URL;
  try {
    parsed = new URL(dbUrl);
  } catch {
    return;
  }

  const host = parsed.hostname || '127.0.0.1';
  const port = Number(parsed.port || 5432);

  if (host !== 'localhost' && host !== '127.0.0.1') {
    return;
  }

  const alreadyListening = await isPortListening(port, '127.0.0.1');
  if (alreadyListening) {
    return;
  }

  const dataDir =
    process.env.PGLITE_DATA_DIR ||
    path.resolve(process.cwd(), '.pglite', 'kirans_pgdata');

  if (dataDir !== 'memory://') {
    fs.mkdirSync(path.dirname(dataDir), { recursive: true });
  }

  const db = dataDir === 'memory://' ? await PGlite.create() : await PGlite.create(dataDir);
  await db.waitReady;
  activeDb = db;

  const checkRes = await db.query<{ exists: string | null }>(
    `SELECT to_regclass('public.users') as exists;`,
  );
  if (!checkRes.rows[0]?.exists) {
    const migrationPath = findMigrationSqlPath();
    if (migrationPath) {
      const sql = fs.readFileSync(migrationPath, 'utf-8');
      await db.exec(sql);
    }
  }

  let mutex = Promise.resolve();

  activeServer = net.createServer((socket) => {
    socket.setNoDelay(true);
    socket.on('data', (chunk: Buffer) => {
      if (chunk.length === 8 && chunk.readInt32BE(0) === 8 && chunk.readInt32BE(4) === 80877103) {
        socket.write(Buffer.from('N'));
        return;
      }
      mutex = mutex
        .then(async () => {
          if (!socket.writable || !activeDb) return;
          const response = await activeDb.execProtocolRaw(new Uint8Array(chunk));
          if (socket.writable && response.byteLength > 0) {
            socket.write(Buffer.from(response));
          }
        })
        .catch(() => {});
    });
    socket.on('error', () => {});
  });

  await new Promise<void>((resolve, reject) => {
    activeServer!.once('error', reject);
    activeServer!.listen(port, '127.0.0.1', () => resolve());
  });
}

export async function stopEmbeddedPostgres(): Promise<void> {
  if (activeServer) {
    await new Promise<void>((resolve) => activeServer!.close(() => resolve()));
    activeServer = null;
  }
  if (activeDb) {
    await activeDb.close();
    activeDb = null;
  }
}
