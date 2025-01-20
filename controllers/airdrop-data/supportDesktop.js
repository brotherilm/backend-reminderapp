import { connectToDatabase } from "../../config/db.js";
import { ObjectId } from "mongodb";

export async function supportDesktop(req, res) {
  try {
    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");

    // Get userId from JWT token that was decoded in verifyToken middleware
    const tokenUserId = req.user.userId;

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

    // Verify that the requesting user matches the user they're trying to modify
    if (tokenUserId !== _id) {
      return res.status(403).json({
        message: "Not authorized to create airdrop for this user",
      });
    }

    // Cari user berdasarkan ObjectId tertentu
    const user = await collection.findOne({ _id: objectId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Additional validation to double-check user ownership
    if (user._id.toString() !== tokenUserId) {
      return res.status(403).json({
        message: "Token user ID does not match requested user ID",
      });
    }

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
