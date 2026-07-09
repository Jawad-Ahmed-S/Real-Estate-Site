import { createListing, deleteListing, getAllListings, getSingleListing, updateListing } from "../controllers/listing.controller.js";
import express from 'express'
import verifyUser from "../middlewares/auth.js";

const router = express.Router()


router.post('/create',verifyUser,createListing)
router.route('/:id').get(getSingleListing).patch(verifyUser,updateListing).delete(verifyUser,deleteListing)
router.route('/Listings').get(getAllListings)

export default router;