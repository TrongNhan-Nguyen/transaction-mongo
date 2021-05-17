import mongoose from "mongoose";
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  balance: {
    type: Number,
    min: 0,
    default: 0,
  },
});

export const User = mongoose.model("User", UserSchema);
