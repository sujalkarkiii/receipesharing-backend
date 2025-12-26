import mongoose from "mongoose"

const connectdb=async()=>{
    try {
        await mongoose.connect(process.env.MONGO_URI)
        console.log("Connecting to Database")
    } catch (error) {
        console.log("Error detected",error);
    }
}
export default connectdb