import express from "express";
import authController from "./auth.controller.js";

const { login, register, checkEmail } = authController;
const router = express.Router();

router.post("/login", login);
router.post("/register", register);
router.get("/check-email", checkEmail);

export default router;