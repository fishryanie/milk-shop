export function mongoConfig(env = process.env) {
  let uri = env.MONGODB_URI?.trim();
  if (!uri || !/^mongodb(\+srv)?:\/\//.test(uri))
    throw new Error("Chưa cấu hình MongoDB trên server.");
  if (Boolean(env.MONGODB_USERNAME) !== Boolean(env.MONGODB_PASSWORD))
    throw new Error("Cần cả username và password MongoDB.");
  if (env.MONGODB_USERNAME && env.MONGODB_PASSWORD)
    uri = uri.replace(
      /^(mongodb(?:\+srv)?:\/\/)(?:[^@/?]+@)?/,
      (_, protocol) =>
        `${protocol}${encodeURIComponent(env.MONGODB_USERNAME!)}:${encodeURIComponent(env.MONGODB_PASSWORD!)}@`,
    );
  return { uri, dbName: env.MONGODB_DB_NAME || "snowmilk" };
}
