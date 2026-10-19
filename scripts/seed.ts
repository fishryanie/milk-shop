import { MongoClient, ObjectId } from "mongodb";
import { mongoConfig } from "../lib/mongo-config";
import { defaultSettings } from "../shared/commerce/types";
import { setupDb } from "./setup-db";
const storeId = process.env.STOREFRONT_STORE_ID || "milk-shop";
// Menu do chủ tiệm cung cấp. Chạy lại chỉ thêm món thiếu, giữ chỉnh sửa từ admin.
const menu = [
  {
    seedKey: "snow",
    name: "Sữa tuyết",
    category: "Sữa tuyết",
    description: "Chọn size M hoặc L và một loại topping bạn thích.",
    price: 35000,
    unit: "ly",
    imageUrl: "/images/milk-hero.png",
    imagePosition: "65% 55%",
    badge: "",
    sizes: [
      { id: "m", name: "M", price: 35000, available: true },
      { id: "l", name: "L", price: 40000, available: true },
    ],
    toppingSelection: "single",
    toppings: [
      { id: "strawberry", name: "Dâu sấy", price: 0, available: true },
      { id: "yogurt", name: "Sữa chua sấy", price: 0, available: true },
      { id: "coconut", name: "Dừa sấy giòn", price: 0, available: true },
      { id: "oreo", name: "Oreo", price: 0, available: true },
      { id: "milo", name: "Ngũ cốc Milo", price: 0, available: true },
    ],
  },
  {
    seedKey: "flan-mini",
    name: "Flan mini",
    category: "Flan",
    description: "6.000đ/cái · Bán theo lốc 5 cái.",
    price: 30000,
    unit: "lốc 5 cái",
    imageUrl: "",
    badge: "",
    toppings: [],
  },
  {
    seedKey: "flan-cup",
    name: "Flan chén",
    category: "Flan",
    description: "Flan đựng trong chén.",
    price: 20000,
    unit: "chén",
    imageUrl: "",
    badge: "",
    toppings: [],
  },
  {
    seedKey: "flan-bucket",
    name: "Flan xô",
    category: "Flan",
    description: "Flan đựng trong xô.",
    price: 30000,
    unit: "xô",
    imageUrl: "",
    badge: "",
    toppings: [],
  },
];
// Ẩn các món mẫu cũ, giữ bản ghi để không ảnh hưởng lịch sử đơn hàng.
const retiredSeedKeys = [
  "snow-m",
  "snow-l",
  "snow-pearl",
  "strawberry",
  "cacao",
  "matcha",
  "fresh",
  "snow-flan",
];
export async function seed(client: MongoClient, dbName: string) {
  await setupDb(client, dbName);
  const db = client.db(dbName);
  const now = new Date();
  for (const [index, item] of menu.entries())
    await db
      .collection("storefront_products")
      .updateOne(
        { storeId, seedKey: item.seedKey },
        {
          $setOnInsert: {
            ...item,
            _id: new ObjectId(),
            storeId,
            status: "available",
            stock: null,
            sortOrder: index,
            revision: 1,
            createdAt: now,
            updatedAt: now,
          },
        },
        { upsert: true },
      );
  await db.collection("storefront_products").updateMany(
    { storeId, seedKey: { $in: retiredSeedKeys }, status: { $ne: "hidden" } },
    { $set: { status: "hidden", updatedAt: now }, $inc: { revision: 1 } },
  );
  await db
    .collection("storefront_settings")
    .updateOne(
      { _id: storeId as never },
      { $setOnInsert: { ...defaultSettings, updatedAt: now } },
      { upsert: true },
    );
  console.log(
    "Đã chuẩn bị 4 món; Sữa tuyết chọn size M/L và tối đa một topping miễn phí. Đã ẩn menu mẫu và các món tách size cũ. Chạy lại seed giữ nguyên những gì admin đã sửa.",
  );
}
if (import.meta.main) {
  const { uri, dbName } = mongoConfig();
  const client = await new MongoClient(uri, {
    serverSelectionTimeoutMS: 10000,
  }).connect();
  try {
    await seed(client, dbName);
  } finally {
    await client.close();
  }
}
