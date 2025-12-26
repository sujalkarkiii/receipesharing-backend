import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema(
  {
    sentby: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",

    },
    sentto: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "user"

    }],
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

const FRIEND_REQUEST = mongoose.model("friendRequest", friendRequestSchema);
export default FRIEND_REQUEST;
