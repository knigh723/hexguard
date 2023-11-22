import mongoose from "mongoose";

const ConnectToDB = async (): Promise<boolean> => {
  mongoose.set("strictQuery", true);
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "hexguard",
    });
    console.log("Connected to Database");
    
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export default ConnectToDB;
