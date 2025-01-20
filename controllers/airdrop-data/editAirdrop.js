import { connectToDatabase } from "../../config/db.js";
import validator from "validator";
import { ObjectId } from "mongodb";

// Helper function untuk sanitasi input (hanya untuk teks biasa)
const sanitizeInput = (input) => {
  if (input === undefined || input === null) return "";
  if (typeof input !== "string") return input.toString();
  return validator.escape(input.trim());
};

export async function editAirdrop(req, res) {
  try {
    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");

    const tokenUserId = req.user.userId;

    let {
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

    // Validasi basic
    if (!_id || !airdropId || !name || !timer) {
      return res.status(400).json({
        message: "Missing required fields: _id, airdropId, name, timer",
      });
    }

    // Validasi ObjectId untuk mencegah injection
    if (!ObjectId.isValid(_id) || !ObjectId.isValid(airdropId)) {
      return res.status(400).json({
        message: "Invalid _id or airdropId format",
      });
    }

    // Sanitize hanya untuk field non-URL
    const updatedData = {
      name: sanitizeInput(name),
      timer: sanitizeInput(timer),
      // URL tidak di-sanitize
      LinkTelegramPlay,
      LinkWebPlay,
      LinkTelegramChannel,
      LinkWebAnnountcmenet,
      LinkX,
    };

    const objectId = new ObjectId(_id);
    const objectAirdropId = new ObjectId(airdropId);

    // Verifikasi user
    if (tokenUserId !== _id) {
      return res.status(403).json({
        message: "Not authorized to modify this airdrop",
      });
    }

    // Update dengan data yang sudah diproses
    const result = await collection.updateOne(
      {
        _id: objectId,
        "additionalAirdrop.airdropId": objectAirdropId,
      },
      {
        $set: {
          "additionalAirdrop.$": {
            airdropId: objectAirdropId,
            ...updatedData,
          },
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "Airdrop not found",
      });
    }

    res.status(200).json({
      message: "Airdrop updated successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function deleteAirdrop(req, res) {
  try {
    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");

    // Get userId from JWT token that was decoded in verifyToken middleware
    const tokenUserId = req.user.userId;

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
