import { MongoClient } from "mongodb";
import { mongoConfig } from "../lib/mongo-config";
export async function setupDb(client: MongoClient, dbName: string) {
  const db = client.db(dbName);
  await Promise.all([
    db
      .collection("storefront_products")
      .createIndex({ storeId: 1, status: 1, sortOrder: 1 }),
    db
      .collection("storefront_orders")
      .createIndex(
        { storeId: 1, ownerHash: 1, idempotencyKey: 1 },
        { unique: true },
      ),
    db
      .collection("storefront_orders")
      .createIndex({ storeId: 1, code: 1 }, { unique: true }),
    db
      .collection("storefront_orders")
      .createIndex({ storeId: 1, status: 1, expiresAt: 1 }),
    db
      .collection("storefront_orders")
      .createIndex({ storeId: 1, ownerHash: 1, _id: -1 }),
    db
      .collection("storefront_orders")
      .createIndex({ storeId: 1, "customer.phone": 1, _id: -1 }),
    db
      .collection("storefront_limits")
      .createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
  ]);
}
if (import.meta.main) {
  const { uri, dbName } = mongoConfig();
  const client = await new MongoClient(uri).connect();
  try {
    await setupDb(client, dbName);
    console.log("Đã tạo indexes cho các collection storefront_*.");
  } finally {
    await client.close();
  }
}
