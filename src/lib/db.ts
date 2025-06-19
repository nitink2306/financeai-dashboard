import { PrismaClient, Prisma } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const client = new PrismaClient({
    log: [
      { level: "error", emit: "event" },
      { level: "warn", emit: "event" },
    ],
    errorFormat: "pretty",
  });

  // Add error handling
  client.$on("error" as any, (e) => {
    console.error("Prisma Client Error:", e);
  });

  client.$on("warn" as any, (e) => {
    console.warn("Prisma Client Warning:", e);
  });

  return client;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Test database connection
prisma
  .$connect()
  .then(() => {
    console.log("Database connection successful");
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
  });
