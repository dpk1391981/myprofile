import mongoose from "mongoose";
let isConnected = false;

export const connectToDB = async () => {
  console.log(`Connecting with : `, process.env.MONGO_URI);
  mongoose.set("strictQuery", true);
  if (isConnected) {
    return;
  }
  try {
    await mongoose.connect(process.env.MONGO_URI, {
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
