import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client.ts";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not configured");
}

let database;
try {
  database = new URL(databaseUrl);
} catch {
  throw new Error("DATABASE_URL must be a valid MySQL connection URL");
}

if (!["mysql:", "mariadb:"].includes(database.protocol)) {
  throw new Error("DATABASE_URL must use the mysql:// or mariadb:// protocol");
}

const databaseName = decodeURIComponent(database.pathname.slice(1));
if (!database.hostname || !database.username || !databaseName) {
  throw new Error("DATABASE_URL must include a host, user, and database name");
}

const adapter = new PrismaMariaDb({
  host: database.hostname,
  port: Number(database.port) || 3306,
  user: decodeURIComponent(database.username),
  password: decodeURIComponent(database.password),
  database: databaseName,
  connectionLimit: 15,
});

const prisma = new PrismaClient({ adapter });

export default prisma;
