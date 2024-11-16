import mongoose from "mongoose";
let isConnected = false;

export const connectToDB = async () => {
  console.log(`Connecting with : `, process.env.NEXT_PUBLIC_MONGO_URI);
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