import { connectToDatabase } from "../../config/db.js";
import { ObjectId } from "mongodb";

// Add Link
export async function addLink(req, res) {
  try {
    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");

    const { _id, airdropId, label, url } = req.body;

    if (
      !_id ||
      !ObjectId.isValid(_id) ||
      !airdropId ||
      !ObjectId.isValid(airdropId)
    ) {
      return res.status(400).json({ message: "Invalid or missing _id" });
    }

    const objectId = new ObjectId(_id);
    const objectAirdropId = new ObjectId(airdropId);

    const result = await collection.updateOne(
      { _id: objectId, "additionalAirdrop.airdropId": objectAirdropId },
      {
        $push: {
          "additionalAirdrop.$.additionalLinks": {
            label: label,
            url: url,
          },
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        message: "User or Airdrop not found",
      });
    }

    res.status(201).json({ message: "Link added successfully", result });
  } catch (error) {
    res.status(500).send(error.toString());
  }
}

// Edit Link
export async function editLink(req, res) {
  try {
    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");

    const { _id, airdropId, index, label, url } = req.body;

    if (
      !_id ||
      !ObjectId.isValid(_id) ||
      !airdropId ||
      !ObjectId.isValid(airdropId) ||
      index == null
    ) {
      return res
        .status(400)
        .json({ message: "Invalid or missing _id or index" });
    }

    const objectId = new ObjectId(_id);
    const objectAirdropId = new ObjectId(airdropId);

    const updateQuery = {};
    if (label !== undefined)
      updateQuery["additionalAirdrop.$.additionalLinks." + index + ".label"] =
        label;
    if (url !== undefined)
      updateQuery["additionalAirdrop.$.additionalLinks." + index + ".url"] =
        url;

    const result = await collection.updateOne(
      { _id: objectId, "additionalAirdrop.airdropId": objectAirdropId },
      { $set: updateQuery }
    );

    if (result.modifiedCount > 0) {
      res.status(200).json({ message: "Link edited successfully", result });
    } else {
      res.status(404).json({ message: "User or link not found" });
    }
  } catch (error) {
    res.status(500).send(error.toString());
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
