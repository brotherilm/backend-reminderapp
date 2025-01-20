import { connectToDatabase } from "../../config/db.js";
import { ObjectId } from "mongodb";

export async function editAirdrop(req, res) {
  try {
    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");

    const {
      _id,
      airdropId,
      name,
      timer,
      LinkTelegramPlay,
      LinkWebPlay,
      LinkTelegramChannel,
      LinkWebAnnountcmenet,
      LinkX,
    } = req.body;

    if (!_id || !airdropId || !name || !timer) {
      return res.status(400).json({
        message: "Missing required fields: _id, airdropId ,name, timer",
      });
    }

    // Validasi _id agar sesuai dengan format ObjectId MongoDB
    if (!ObjectId.isValid(_id) || !ObjectId.isValid(airdropId)) {
      return res.status(400).json({
        message: "Invalid _id or airdropId format",
      });
    }

    const objectId = new ObjectId(_id);
    const objectAirdropId = new ObjectId(airdropId);

    // Tambahkan catatan ke user yang ditemukan
    const result = await collection.updateOne(
      { _id: objectId, "additionalAirdrop.airdropId": objectAirdropId },
      {
        $set: {
          "additionalAirdrop.$": {
            airdropId: objectAirdropId,
            name,
            timer,
            LinkTelegramPlay,
            LinkWebPlay,
            LinkTelegramChannel,
            LinkWebAnnountcmenet,
            LinkX,
          },
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
``;

export async function deleteAirdrop(req, res) {
  try {
    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");

    const { _id, airdropId } = req.body;

    // Perbaikan validasi parameter
    if (!_id || !airdropId) {
      return res.status(400).json({
        message: "Missing required fields: _id and airdropId",
      });
    }

    // Validasi format ObjectId
    if (!ObjectId.isValid(_id) || !ObjectId.isValid(airdropId)) {
      return res.status(400).json({
        message: "Invalid _id or airdropId format",
      });
    }

    const objectId = new ObjectId(_id);
    const objectAirdropId = new ObjectId(airdropId);

    // Gunakan updateOne dengan $pull untuk menghapus airdrop spesifik
    const result = await collection.updateOne(
      { _id: objectId },
      {
        $pull: {
          additionalAirdrop: {
            airdropId: objectAirdropId,
          },
        },
      }
    );

    // Cek apakah user ditemukan
    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Cek apakah airdrop berhasil dihapus
    if (result.modifiedCount === 0) {
      return res.status(404).json({
        message: "Airdrop not found in user's collection",
      });
    }

    // Kirim response sukses
    return res.status(200).json({
      message: "Airdrop successfully deleted",
      result,
    });
  } catch (error) {
    res.status(500).send(error.toString());
  }
}
