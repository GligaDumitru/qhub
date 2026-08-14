import "@/database";
import mongoose, { Mongoose } from "mongoose";
import logger from "./logger";

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  var mongooseCached: MongooseCache | undefined;
}

let cached = global.mongooseCached;
if (!cached) {
  cached = global.mongooseCached = { conn: null, promise: null };
}

const dbConnect = async (): Promise<Mongoose> => {
  const MONGODB_URI = process.env.MONGODB_URI as string | undefined;

  if (!MONGODB_URI) {
    // Throw only when attempting to connect at runtime.
    throw new Error("MONGODB_URI is not defined");
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "qhub",
      })
      .then((mongoose) => {
        logger.info("Connected to MongoDB");
        return mongoose;
      })
      .catch((err) => {
        logger.error("Error connecting to MongoDB", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default dbConnect;
