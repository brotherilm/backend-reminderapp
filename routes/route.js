import express from "express";
import { verifyToken } from "../middleware/jwtToken.js";
import { register, login } from "../controllers/userController.js";
import { createAirdrop } from "../controllers/airdrop-data/createAirdrop.js";
import {
  deleteAirdrop,
  editAirdrop,
} from "../controllers/airdrop-data/editAirdrop.js";
import { editNote } from "../controllers/airdrop-data/editNote.js";
import {
  addLink,
  editLink,
  deleteLink,
} from "../controllers/airdrop-data/addLink.js";
import { supportDesktop } from "../controllers/airdrop-data/supportDesktop.js";
import { ratingAidrop } from "../controllers/airdrop-data/rating.js";
import { attemptAirdrop } from "../controllers/airdrop-data/attempt.js";
import { Countdown, getCountdown } from "../controllers/Time.js";
import {
  userSubscription,
  getSubscriptionStatus,
} from "../controllers/userSubscription.js";

const router = express.Router();

router.post("/login", login);
router.post("/register", register);

// subcription
router.post("/subcription", userSubscription);
router.get("/subcription", getSubscriptionStatus);

// verify token for all route
router.use(verifyToken);

// form
router.post("/create-airdrop", createAirdrop);

// airdrop
router.post("/edit-airdrop", editAirdrop);
router.delete("/delete-airdrop", deleteAirdrop);

// note
router.post("/edit-note", editNote);

// link
router.post("/add-link", addLink);
router.post("/edit-link", editLink);
router.delete("/delete-link", deleteLink);

// support
router.post("/support-desktop", supportDesktop);

// rating
router.post("/rating", ratingAidrop);

// attempt
router.post("/attempt", attemptAirdrop);

// Global Time
router.post("/time", Countdown);
router.get("/time", getCountdown);

export default router;
