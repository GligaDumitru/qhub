import mongoose, { Mongoose } from "mongoose";
const MONGODB_URI = process.env.MONGODB_URI as string;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  var mongooseCached: MongooseCache;
}

let cached = global.mongooseCached;
if (!cached) {
  cached = global.mongooseCached = { conn: null, promise: null };
}

const dbConnect = async (): Promise<Mongoose> => {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        dbName: "qhub",
      })
      .then((mongoose) => {
        console.log("Connected to MongoDB");
        return mongoose;
      })
      .catch((err) => {
        console.log("Error connecting to MongoDB", err);
        throw err;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
};

export default dbConnect;
