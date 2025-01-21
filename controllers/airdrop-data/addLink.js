import { connectToDatabase } from "../../config/db.js";
import { ObjectId } from "mongodb";
import validator from "validator";

// Simple sanitize untuk text input (bukan URL)
const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;
  return validator.escape(input.trim());
};

export async function addLink(req, res) {
  try {
    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");

    let { _id, airdropId, label, url } = req.body;

    // Basic validation
    if (
      !_id ||
      !ObjectId.isValid(_id) ||
      !airdropId ||
      !ObjectId.isValid(airdropId)
    ) {
      return res.status(400).json({ message: "Invalid or missing _id" });
    }

    // Sanitize label saja, url dibiarkan apa adanya
    label = sanitizeInput(label);

    const objectId = new ObjectId(_id);

    // Authorization check

    const objectAirdropId = new ObjectId(airdropId);

    const result = await collection.updateOne(
      {
        _id: objectId,
        "additionalAirdrop.airdropId": objectAirdropId,
      },
      {
        $push: {
          "additionalAirdrop.$.additionalLinks": {
            label,
            url,
          },
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "User or Airdrop not found",
      });
    }

    res.status(201).json({
      message: "Link added successfully",
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("Error in addLink:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function editLink(req, res) {
  try {
    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");

    let { _id, airdropId, index, label, url } = req.body;

    // Basic validation
    if (
      !_id ||
      !ObjectId.isValid(_id) ||
      !airdropId ||
      !ObjectId.isValid(airdropId) ||
      index == null
    ) {
      return res.status(400).json({ message: "Invalid or missing parameters" });
    }

    const objectId = new ObjectId(_id);

    const objectAirdropId = new ObjectId(airdropId);

    const updateQuery = {};
    if (label !== undefined) {
      updateQuery["additionalAirdrop.$.additionalLinks." + index + ".label"] =
        sanitizeInput(label);
    }
    if (url !== undefined) {
      updateQuery["additionalAirdrop.$.additionalLinks." + index + ".url"] =
        url;
    }

    const result = await collection.updateOne(
      {
        _id: objectId,
        "additionalAirdrop.airdropId": objectAirdropId,
      },
      { $set: updateQuery }
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({
        message: "Link edited successfully",
        modifiedCount: result.modifiedCount,
      });
    } else {
      res.status(404).json({ message: "User or link not found" });
    }
  } catch (error) {
    console.error("Error in editLink:", error);
    res.status(500).json({ message: "Internal server error" });
  }
}

// Delete Link
export async function deleteLink(req, res) {
  try {
    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");

    const { _id, airdropId, index } = req.body;

    if (!_id || !airdropId || index === undefined || index < 0) {
      return res.status(400).json({
        message:
          "Missing required fields: _id, airdropId, index or invalid index",
      });
    }

    if (!ObjectId.isValid(_id) || !ObjectId.isValid(airdropId)) {
      return res.status(400).json({
        message: "Invalid _id or airdropId format",
      });
    }

    const objectId = new ObjectId(_id);

    // Cari user berdasarkan ObjectId tertentu
    const user = await collection.findOne({ _id: objectId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const objectAirdropId = new ObjectId(airdropId);

    // Menghapus link pada index tertentu menggunakan $unset
    const result = await collection.updateOne(
      {
        _id: objectId,
        "additionalAirdrop.airdropId": objectAirdropId,
      },
      {
        $unset: {
          [`additionalAirdrop.$.additionalLinks.${index}`]: 1,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "User or Airdrop not found",
      });
    }

    // Membersihkan null values dari array menggunakan $pull
    await collection.updateOne(
      {
        _id: objectId,
        "additionalAirdrop.airdropId": objectAirdropId,
      },
      {
        $pull: {
          "additionalAirdrop.$.additionalLinks": null,
        },
      }
    );

    res.status(200).json({
      message: "Link deleted successfully",
      result,
    });
  } catch (error) {
    res.status(500).send(error.toString());
  }
}
