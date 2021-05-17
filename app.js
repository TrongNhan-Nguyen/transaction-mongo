import express from "express";
import mongoose from "mongoose";
import { User } from "./User.js";
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
(async function () {
  try {
    await mongoose.connect(
      "mongodb://localhost:27017,localhost:27018,localhost:27019/transaction",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false,
      }
    );
    console.log("Connect to db successfully!");
    const beforeNhan = await User.findOne({ username: "nhan" });
    const beforeNgan = await User.findOne({ username: "ngan" });
    console.log("Before transfer balance's Nhan: ", beforeNhan.balance);
    console.log("Before transfer balance's Ngan: ", beforeNgan.balance);
    await transfer("nhan", "ngan", 30);
    const afterNhan = await User.findOne({ username: "nhan" });
    const afterNgan = await User.findOne({ username: "ngan" });
    console.log("After transfer balance's Nhan: ", afterNhan.balance);
    console.log("After transfer balance's Ngan: ", afterNgan.balance);
  } catch (error) {
    console.log(`Failed to connect db with error: ${error}`);
  }
})();

const transfer = async (from, to, amount) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const opts = { session, returnOriginal: false };
  try {
    const A = await User.findOneAndUpdate(
      { username: from },
      { $inc: { balance: -amount } },
      opts
    );
    if (A.balance < 0) {
      throw new Error(
        `Not enough money:\nCurrent money: ${
          A.balance + amount
        }.\nMoney transfer: ${amount}`
      );
    }

    const B = await User.findOneAndUpdate(
      { username: to },
      { $inc: { balance: amount } },
      opts
    );

    await session.commitTransaction();
    session.endSession();
    return { from: A, to: B };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.log(error);
  }
};

const insertUser = async (user) => {
  try {
    await new User(user).save();
    console.log(`Insert user ${user} successfully!`);
  } catch (error) {
    console.log(error);
  }
};
app.get("", (req, res) => {
  return res.send("Hello world");
});
app.listen(3000, () => console.log("App listen on port 3000"));
