import express from "express";
import {
  sewaMesinMining,
  getMiningHistory,
  getMiningStatus
} from "../controllers/miningController.js";

const router = express.Router();

router.post("/sewa", sewaMesinMining);
router.get("/history", getMiningHistory);
router.get("/status", getMiningStatus);
// Render halaman mining
router.get("/", (req, res) => {
  res.render("mining/mining.ejs");
});

export default router;