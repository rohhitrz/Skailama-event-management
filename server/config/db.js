import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()
const connectDB=async ()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URI)
        console.log("MongoDb connected Successfully")
    }catch(error){
        console.error('MongoDb connection Error',error)
        process.exit(1);
    }
}

export default connectDB;