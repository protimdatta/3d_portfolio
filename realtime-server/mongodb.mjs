import { MongoClient } from "mongodb";

let clientPromise;
let indexesPromise;

function getConfig() {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) return null;
  return {
    uri,
    dbName: process.env.MONGODB_DB_NAME?.trim() || "portfolio",
  };
}

export function isMongoConfigured() {
  return Boolean(getConfig());
}

export async function getMongoDb() {
  const config = getConfig();
  if (!config) return null;

  if (!clientPromise) {
    const client = new MongoClient(config.uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
    });
    clientPromise = client.connect();
  }

  const client = await clientPromise;
  const db = client.db(config.dbName);

  if (!indexesPromise) {
    indexesPromise = Promise.all([
      db.collection("messages").createIndex({ numericId: -1 }),
      db.collection("messages").createIndex({ createdAt: -1 }),
      db.collection("reactions").createIndex({ messageId: 1 }, { unique: true }),
    ]);
  }
  await indexesPromise;
  return db;
}

export async function closeMongo() {
  if (!clientPromise) return;
  const client = await clientPromise;
  await client.close();
  clientPromise = undefined;
  indexesPromise = undefined;
}
