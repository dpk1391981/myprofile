import mongoose from "mongoose";
let isConnected = false;

export const connectToDB = async () => {
  // Never log the URI itself — it carries the database password, and server
  // logs are the easiest place in a deployment to read a credential from.
  console.log("Connecting to MongoDB…");
  mongoose.set("strictQuery", true);
  if (isConnected) {
    return;
  }
  try {
    await mongoose.connect(process.env.NEXT_PUBLIC_MONGO_URI, {
      dbName: "myprofile",
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log(`MongoDB connected!!!`);
  } catch (error) {
    console.log(`error`, error);
  }
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log(`Disconnected!`)
  }
}