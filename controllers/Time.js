import { connectToDatabase } from "../config/db.js";
import { ObjectId } from "mongodb";

// Controller to update countdown
export async function Countdown(req, res) {
  try {
    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");

    const { _id, time } = req.body;

    if (!_id) {
      return res.status(400).json({
        message: "Missing required fields: _id",
      });
    }

    if (!ObjectId.isValid(_id)) {
      return res.status(400).json({
        message: "Invalid _id",
      });
    }

    const objectId = new ObjectId(_id);

    // Cari user berdasarkan ObjectId tertentu
    const user = await collection.findOne({ _id: objectId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate countdown end time
    const startTime = Date.now();
    const endTime = startTime + parseInt(time) * 1000; // Convert seconds to milliseconds

    const result = await collection.updateOne(
      {
        _id: objectId,
      },
      {
        $set: {
          time: time,
          countdownStart: startTime,
          countdownEnd: endTime,
        },
      }
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).send(error.toString());
  }
}

// Controller to get remaining countdown time
export async function getCountdown(req, res) {
  try {
    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");

    const { _id } = req.body;

    if (!ObjectId.isValid(_id)) {
      return res.status(400).json({
        message: "Invalid _id",
      });
    }

    const objectId = new ObjectId(_id);

    const user = await collection.findOne({ _id: objectId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Calculate remaining time
    const now = Date.now();
    const remainingTime = user.countdownEnd - now;

    // If countdown has expired, return 0
    const countdown = Math.max(0, Math.floor(remainingTime / 1000)); // Convert to seconds

    res.status(200).json({
      countdown: countdown,
      originalTime: user.time,
      status: countdown > 0 ? "active" : "expired",
    });
  } catch (error) {
    res.status(500).send(error.toString());
  }
}
