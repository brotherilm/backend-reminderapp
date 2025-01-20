import { connectToDatabase } from "../../config/db.js";
import { ObjectId } from "mongodb";

export async function supportDesktop(req, res) {
  try {
    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");

    const { _id, airdropId, support } = req.body;

    if (!_id || !airdropId) {
      return res
        .status(400)
        .json({ message: "Missing required fields: _id, airdropId" });
    }

    // Validasi _id agar sesuai dengan format ObjectId MongoDB
    if (!_id || !ObjectId.isValid(_id) || !ObjectId.isValid(airdropId)) {
      return res
        .status(400)
        .json({ message: "Invalid or missing _id or airdropId" });
    }

    const objectId = new ObjectId(_id);
    const objectAirdropId = new ObjectId(airdropId);

    // Tambahkan catatan ke user yang ditemukan
    const result = await collection.updateOne(
      { _id: objectId, "additionalAirdrop.airdropId": objectAirdropId },
      {
        $set: {
          "additionalAirdrop.$.support": support,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "User or Airdrop not found",
      });
    }

    res.status(201).json(result);
  } catch (error) {
    res.status(500).send(error.toString());
  }
}
