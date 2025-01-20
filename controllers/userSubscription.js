import { connectToDatabase } from "../config/db.js";
import { ObjectId } from "mongodb";

// Controller to update subscription
export async function userSubscription(req, res) {
  try {
    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");

    const { _id, subcription } = req.body;

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

    // Calculate subscription end time (60 minutes = 3600000 milliseconds)
    const startTime = Date.now();
    const endTime = startTime + 3600000; // 60 minutes in milliseconds

    const result = await collection.updateOne(
      {
        _id: objectId,
      },
      {
        $set: {
          subcription: subcription,
          subscriptionStart: startTime,
          subscriptionEnd: endTime,
        },
      }
    );

    // Schedule subscription reset after 3 minutes
    setTimeout(async () => {
      try {
        const resetResult = await collection.updateOne(
          { _id: objectId },
          {
            $set: {
              subcription: "0",
            },
          }
        );
        console.log(`Subscription reset for user ${_id}`, resetResult);
      } catch (error) {
        console.error("Error resetting subscription:", error);
      } finally {
        // Ensuring the database client is properly closed after operation
        await client.close();
      }
    }, 3600000);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).send(error.toString());
  }
}

// Controller to get subscription status and remaining time
export async function getSubscriptionStatus(req, res) {
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
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Calculate remaining time
    const now = Date.now();
    const remainingTime = user.subscriptionEnd ? user.subscriptionEnd - now : 0;

    // Convert to seconds and ensure non-negative
    const remainingSeconds = Math.max(0, Math.floor(remainingTime / 1000));

    // Format remaining time
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;

    res.status(200).json({
      subscription: user.subcription,
      remainingTime: {
        total: remainingSeconds,
        formatted: `${minutes}:${seconds.toString().padStart(2, "0")}`,
      },
      status: remainingSeconds > 0 ? "active" : "expired",
    });
  } catch (error) {
    res.status(500).send(error.toString());
  }
}
