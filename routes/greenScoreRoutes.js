import express from "express";
import { submitGreenScore, getUserGreenScore,getLeaders  } from "../controllers/greenScoreController.js";

const router = express.Router();

router.post("/submit", submitGreenScore);
router.get("/leaders", getLeaders);
router.get("/:userId", getUserGreenScore);


export default router;
