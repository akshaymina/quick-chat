import mongoose from "mongoose";

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    // Fail fast with a clear message instead of letting mongoose throw a
    // cryptic "undefined" connection error later.
    throw new Error("MONGO_URI is not defined in environment variables.");
  }

  // NOTE: no try/catch here — we intentionally let connection errors
  // propagate up to the caller (index.js), which decides how to respond
  // (e.g. exit the process) rather than silently swallowing them here.
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Database connected");
};

export default connectDB;