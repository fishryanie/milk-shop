import "server-only";
import { MongoClient } from "mongodb";
import { CommerceStore } from "@/shared/commerce/store";
import { mongoConfig } from "./mongo-config";
const globalDb = globalThis as typeof globalThis & {
  storefrontMongo?: Promise<MongoClient>;
};
export async function store() {
  const { uri, dbName } = mongoConfig();
  globalDb.storefrontMongo ??= new MongoClient(uri, {
    maxPoolSize: 8,
    minPoolSize: 0,
    serverSelectionTimeoutMS: 5000,
    appName: "milk-order-public",
  })
    .connect()
    .catch((error) => {
      globalDb.storefrontMongo = undefined;
      throw error;
    });
  const client = await globalDb.storefrontMongo;
  return new CommerceStore(
    client.db(dbName),
    client,
    process.env.STOREFRONT_STORE_ID || "milk-shop",
  );
}
