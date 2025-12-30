import express from "express"
const routing=express.Router()
import { handlecancelrequest, handlecheckrequest, handledeleterequest, handlefriends, handlehome, handleloadfriend, handleloadrequest, 
handlelogin,handlelogout,handlepost,handleregister, handlerequstsend, users } from "../controller/controller.js"
import handleprotection from "../middleware/token.js"
import uploads from "../middleware/multer.js"
import rateLimit from "express-rate-limit"

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // max 10 requests per IP in window
  message: "Too many login/register attempts, please try again later."
});

routing.post('/login',authLimiter ,handlelogin);
routing.post('/register',authLimiter ,handleregister);



routing.get('/home',handleprotection,handlehome)
routing.post('/post',handleprotection,uploads.single("image"),handlepost)
routing.get('/protected',handleprotection,(req,res)=>res.json({message: "Protected route accessed", success:true}))
routing.get('/users',handleprotection,users)
routing.post('/requestsent/:userId',handleprotection,handlerequstsend)
routing.delete('/cancelrequest/:userId',handleprotection,handlecancelrequest)
routing.delete('/deleterequest/:userId',handleprotection,handledeleterequest)



routing.get('/checkrequest',handleprotection,handlecheckrequest)
routing.get('/loadrequest',handleprotection,handleloadrequest)
routing.post('/friends',handleprotection,handlefriends)
routing.get('/loadfriend',handleprotection,handleloadfriend)
routing.post('/logout',handleprotection,handlelogout)

export default routing