import express from "express";
import { dicePage, playClassicDice } from "../controllers/classicDiceController.js";
const router = express.Router();

router.get("/", dicePage);
router.post("/play", playClassicDice);


export default router;