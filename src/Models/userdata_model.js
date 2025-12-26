import mongoose from "mongoose"

const user_detail = new mongoose.Schema({
    username: {
        required: true,
        type: String
    },
    email: {
        required: true,
        type: String
    },
    phonenumber: {
        required: true,
        type: String
    },
    password: {
        required: true,
        type: String
    },
    friends:[
      {  type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }
    ]
},
{
    timestamps: true
})

const USER_DETAIL= mongoose.model("user",user_detail)
export default USER_DETAIL