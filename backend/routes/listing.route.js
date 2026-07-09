import { createListing } from "../controllers/listing.controller.js";
import express from 'express'
import verifyUser from "../middlewares/auth.js";

const router = express.Router()


router.post('/create',verifyUser,createListing)

export default router;