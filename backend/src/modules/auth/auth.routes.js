import express from "express";
import authController from "./auth.controller.js";

const { login, register } = authController;
const router = express.Router();

router.post("/login", login);
router.post("/register", register);

export default router;