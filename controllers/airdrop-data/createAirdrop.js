import { connectToDatabase } from "../../config/db.js";
import { ObjectId } from "mongodb";

export async function createAirdrop(req, res) {
  try {
    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");

    const { _id, name, timer } = req.body;

    if (!_id || !name || !timer) {
      return res
        .status(400)
        .json({ message: "Missing required fields: _id, name, timer" });
    }

    // Validasi _id agar sesuai dengan format ObjectId MongoDB
    if (!_id || !ObjectId.isValid(_id)) {
      return res.status(400).json({ message: "Invalid or missing _id" });
    }

    const objectId = new ObjectId(_id);

    // Cari user berdasarkan ObjectId tertentu
    const user = await collection.findOne({ _id: objectId });

    if (user) {
      // Membuat ID khusus untuk airdrop
      const airdropId = new ObjectId();

      // Tambahkan catatan ke user yang ditemukan, dengan ID baru untuk airdrop
      const result = await collection.updateOne(
        { _id: objectId },
        {
          $push: {
            additionalAirdrop: {
              airdropId, // ID baru untuk airdrop
              name,
              timer,
            },
          },
        }
      );

      res.status(201).json(result);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).send(error.toString());
  }
}
