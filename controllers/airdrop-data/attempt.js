import { connectToDatabase } from "../../config/db.js";
import { ObjectId } from "mongodb";

export async function attemptAirdrop(req, res) {
  try {
    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");

    const { _id, airdropId, attempt } = req.body;

    if (!_id || !airdropId) {
      return res.status(400).json({
        message: "Missing required fields: _id, airdropId",
      });
    }

    // Validasi _id dan airdropId
    if (!ObjectId.isValid(_id) || !ObjectId.isValid(airdropId)) {
      return res.status(400).json({
        message: "Invalid _id or airdropId format",
      });
    }

    const objectId = new ObjectId(_id);
    const objectAirdropId = new ObjectId(airdropId);

    // Cari user dan update rating pada additionalAirdrop yang sesuai
    const result = await collection.updateOne(
      {
        _id: objectId,
        "additionalAirdrop.airdropId": objectAirdropId,
      },
      {
        $set: {
          "additionalAirdrop.$.attempt": attempt,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "User or Airdrop not found",
      });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).send(error.toString());
  }
}
