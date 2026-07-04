import express from "express";
import { signin,login } from "../controllers/user.controller.js";

const router = express.Router()


router.post('/register',signin)
router.get('/login',login)

export default router;