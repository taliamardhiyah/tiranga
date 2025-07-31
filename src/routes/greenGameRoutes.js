import express from "express";
import { greenPage, betGreen, getGreenStatus } from '../controllers/greenGameController.js';
const router = express.Router();

router.get("/", greenPage);
router.post("/bet", betGreen);
router.get("/status", getGreenStatus);



export default router;