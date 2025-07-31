import express from "express";
import { crashPage, betCrash, getCrashStatus, cashoutCrash } from "../controllers/crashControllers.js";

const router = express.Router();

// Halaman utama crash game
router.get("/", crashPage);

// Submit taruhan
router.post("/bet", betCrash);

// Ambil status multiplier & history (bisa dipanggil via AJAX/Socket)
router.get("/status", getCrashStatus);

// Cashout (jika user klik cashout)
router.post("/cashout", cashoutCrash);

export default router;