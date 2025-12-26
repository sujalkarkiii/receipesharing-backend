import USER_DETAIL from "../Models/userdata_model.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
import postmodel from "../Models/postsdata_model.js"
import mongoose from "mongoose";
import FRIEND_REQUEST from "../Models/friendmodel.js";


export const handleregister = async (req, res) => {
  try {
    const { username, email, phonenumber, password } = req.body
    const existeduser = await USER_DETAIL.findOne({ email: email })
    if (existeduser) {
      console.log("USER ALREADY EXISTED")
      return res.status(409).json({ error: "user already registered" });
    }
    const hashedpassword = await bcrypt.hash(password, 10)
    const userdetail = new USER_DETAIL({
      username, email, phonenumber, password: hashedpassword
    })
    await userdetail.save()
    res.status(201).json({ messege: "New User Registered", success: true })
  } catch (error) {
    res.status(500).json({ messege: "Internal Server Error" })
  }
}


// login function

export const handlelogin = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    const user = await USER_DETAIL.findOne({
      $or: [{ email: identifier }, { phonenumber: identifier }]
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const validate = await bcrypt.compare(password, user.password);

    if (!validate) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    }).status(200).json({ message: "Login successful", success: true });

  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ "500": "Internal Server Error" });
  }
};
// home function

export const handlehome = async (req, res) => {
  try {

    const homedata = await postmodel.find().populate("postedBy", "username").sort({ createdAt: -1 });
    res.status(200).json({ homedata, message: "data send succesfully", success: true })

  } catch (error) {
    res.status(500).json({ "500": "Internal Server Error" })

  }
}

// post function

export const handlepost = async (req, res) => {
  try {
    const { title, description } = req.body
    const postedBy = req.user.id
    const image = req.file
    const imageurl = `http://localhost:${process.env.PORT}/uploads/${image.filename}`
    const postdata = new postmodel({
      title,
      description, image: imageurl, postedBy
    })
    await postdata.save();
    res.status(200).json({ message: "Posted Succesfullt", success: true })

  } catch (error) {
    res.status(500).json({ "500": "Internal Server Error" })

  }
}

export const users = async (req, res) => {
  try {
    const logged_in_user = new mongoose.Types.ObjectId(req.user.id);
    const homedata = await USER_DETAIL.find({
      _id: { $ne: logged_in_user }
    });

    res.status(200).json({
      homedata,
      message: "data sent successfully",
      success: true
    });

  } catch (error) {
    res.status(500).json({ "500": "Internal Server Error" });
  }
};

// request send by the many 
export const handlerequstsend = async (req, res) => {
  try {
    const to = req.params.userId
    const from = req.user.id
    const validare = await FRIEND_REQUEST.findOne({
      "sentby": from,
      "sentto": { $in: [to] }

    })
    if (validare) {
      return res.status(400).json({ message: "Friend request already exists" });
    }

    const newRequest = new FRIEND_REQUEST({
      sentby: from,
      sentto: [to]
    });
    await newRequest.save()
    return res.status(201).json({ message: "Friend request sent successfully" });



  } catch (error) {
    res.status(500).json({ "500": "Internal Server Error" });

  }

}

export const handlecancelrequest = async (req, res) => {
  try {

    const to = req.params.userId;
    const from = req.user.id;

    const deleted = await FRIEND_REQUEST.deleteOne({
      sentby: from,
      sentto: { $in: [to] }
    });

    if (deleted.deletedCount) {
      return res.status(200).json({ message: "Friend request canceled" });
    } else {
      return res.status(404).json({ message: "No friend request found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ "500": "Internal Server Error" });
  }
};


// frinedrequest pathayepaxi ani if page is reloaded then it will check if already sent or not


export const handlecheckrequest = async (req, res) => {
  try {
    const from = req.user.id;

    const validare = await FRIEND_REQUEST.find({
      sentby: from,
      status: "pending",
    });

    if (validare) {
      return res.status(200).json({
        exists: true,
        validare,
        message: "Friend request already exists"
      });
    } else {
      return res.status(200).json({
        exists: false,
        validare: null,
        message: "No pending requests"

      });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ "500": "Internal Server Error" });
  }
};



export const handleloadrequest = async (req, res) => {
  const loginuser = req.user.id

  try {
    const requests = await FRIEND_REQUEST.find({
      sentto: { $in: [loginuser] },
      status: "pending",
    }).populate("sentby", "username")

    if (requests) {
      return res.status(200).json({ requests, exist: true, message: "Fetched request" })
    }
    else {
      return res.status(200).json({ requests, exist: false, message: "no request" })

    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ "500": "Internal Server Error" });

  }
}


// accept gareypaxi delete garda delete hunxa ani accept garda logedin user ko friend array ma garah add hunca


export const handlefriends = async (req, res) => {
  try {

    const acceptfrinedrequest = req.body.userid
    const me = req.user.id

    const id = new mongoose.Types.ObjectId(me)
    const addfriend = await USER_DETAIL.findByIdAndUpdate(id,
      {
        $addToSet: { friends: acceptfrinedrequest },
        status: "accepted"
      },
      {
        new: true
      }
    )

    const deleterequest = await FRIEND_REQUEST.findOne({
      sentby: acceptfrinedrequest,
      sentto: { $in: [id] }
    })
    if (deleterequest) {
      await deleterequest.deleteOne()
    }
    res.status(200).json({ message: "Friend request accepted", user: addfriend });


  } catch (error) {
    console.error(error);
    res.status(500).json({ "500": "Internal Server Error" });
  }
}



// delete request by the receives user 

export const handledeleterequest = async (req, res) => {
  try {

    const senderid = req.params.userId;
    const logedinuser = req.user.id;

    const deleted = await FRIEND_REQUEST.deleteOne({
      sentby: senderid,
      sentto: { $in: [logedinuser] }
    });

    if (deleted.deletedCount) {
      return res.status(200).json({ message: "Friend request canceled" });
    } else {
      return res.status(404).json({ message: "No friend request found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ "500": "Internal Server Error" });
  }
};


export const handleloadfriend = async (req, res) => {
  try {
    const logedinuser = req.user.id;

    const id = new mongoose.Types.ObjectId(logedinuser);

    // Fetch the user and populate friends array
    const myfriends = await USER_DETAIL.findById(id).populate("friends", "username");

    return res.status(200).json({ myfriends, message: "Friends loaded" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ "500": "Internal Server Error" });
  }
};




// logout function

export const handlelogout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: false,    
      sameSite: "strict"
    });

    return res.status(200).json({ message: "Logged out successfully" });

  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
