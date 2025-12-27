import express, { json } from "express"
import dotenv from "dotenv"
import connectdb from "./database/database_connection.js"
import routing from "./route/routing.js"
import cors from "cors"
import cookieparser from "cookie-parser"


const app=express()
dotenv.config()
const port=process.env.PORT
const allowedOrigins = [
  "https://sujalkarkiii-receipesharing-fronten.vercel.app" // deployed frontend
];

app.use(cors({
  origin: function(origin, callback) {
    if(!origin) return callback(null, true); // allow Postman/cURL
    if(!allowedOrigins.includes(origin)) {
      return callback(new Error("Not allowed by CORS"), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Handle preflight OPTIONS requests;
app.use(express.json())
app.use(cookieparser())
app.use("/uploads", express.static("uploads"));



app.use('/',routing)



connectdb().then(()=>{
    app.listen(port,()=>{
        console.log(`DataBase is runing in port ${port}`)
    })
})
