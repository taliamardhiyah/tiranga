import express from "express";
import vipController from "../controllers/vipController.js";

const router = express.Router();

// Endpoint untuk mendapatkan informasi level VIP pengguna
router.get("/vip-level", vipController.getMyVIPLevelInfo);

// Endpoint untuk mendapatkan riwayat VIP pengguna
router.get("/vip-history", vipController.getVIPHistory);

// Endpoint untuk merilis level VIP pengguna (hanya admin atau sistem yang memicu ini)
router.post("/release-vip", vipController.releaseVIPLevel);

export default router;
