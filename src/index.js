import express, { json } from "express"
import dotenv from "dotenv"
import connectdb from "./database/database_connection.js"
import routing from "./route/routing.js"
import cors from "cors"
import cookieparser from "cookie-parser"


const app=express()
dotenv.config()
const port=process.env.PORT

app.use(cors({
  origin: "https://sujalkarkiii-receipesharing-fronten.vercel.app",
  credentials: true
}));
app.use(express.json())
app.use(cookieparser())
app.use("/uploads", express.static("uploads"));



app.use('/',routing)

connectdb().catch(err => console.error("DB connection failed:", err))


connectdb().then(()=>{
    app.listen(port,()=>{
        console.log(`DataBase is runing in port ${port}`)
    })
})
