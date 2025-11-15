import express from "express";
import { createProfile,getAllProfiles,getProfileById,updateTimezone } from "../controllers/profileController.js";

const router = express.Router();

router.post("/", createProfile);
router.get("/", getAllProfiles);
router.get("/:id", getProfileById);
router.put("/:id/timezone", updateTimezone);

export default router;