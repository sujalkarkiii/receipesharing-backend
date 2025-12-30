import express from "express"
import dotenv from "dotenv"
import connectdb from "./database/database_connection.js"
import routing from "./route/routing.js"
import cors from "cors"
import cookieparser from "cookie-parser"

const app=express()
dotenv.config()
const port=process.env.PORT

const allowedOrigins = [
  "http://localhost:5173",             
  "https://receipesharing.vercel.app" 
];


app.use(cors({
  origin: function(origin,callback){
     if (!origin) return callback(null, true); 
    if(allowedOrigins.includes(origin)){
      callback(null,true)
    }else{
            callback(new Error("Not allowed by CORS"));
    }
    
  }
}))

app.use(express.json())
app.use(cookieparser())
app.use("/uploads", express.static("uploads"));


app.use('/',routing)



connectdb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`)
    })
  })
  .catch((err) => {
    console.error("Database connection failed:", err)
  })

