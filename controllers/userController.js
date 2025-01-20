import { connectToDatabase } from "../config/db.js";

export async function getAllUsers(req, res) {
  try {
    const client = await connectToDatabase();
    const database = client.db("airdrop"); // Pilih database
    const collection = database.collection("users");

    const users = await collection.find().toArray();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).send(error.toString());
  }
}

export async function register(req, res) {
  try {
    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");

    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const emailDomain = email.split("@")[1];
    if (!emailDomain || emailDomain.toLowerCase() !== "gmail.com") {
      return res
        .status(400)
        .json({ message: "Only gmail.com emails are allowed" });
    }

    const existingUser = await collection.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const newUser = { email, password };
    const result = await collection.insertOne(newUser);

    res.status(201).json(result);
  } catch (error) {
    res.status(500).send(error.toString());
  }
}

export async function login(req, res) {
  try {
    const client = await connectToDatabase();
    const database = client.db("airdrop");
    const collection = database.collection("users");

    const { email, password } = req.body;

    const user = await collection.findOne({ email, password });

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).send(error.toString());
  }
}
