import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

const connectDB = async () => {
    try{
    const instance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
    //console.log(instance);
    console.log(`\n MongoDB connected !! DB HOST: ${instance.connection.host}`);
    
    }
    catch(error)
    {
        console.log("Error in building the connection with the database " + error);
        process.exit(1);
    }

}

export default connectDB;