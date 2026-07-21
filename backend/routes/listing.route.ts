import { createListing, deleteListing, getAllListings, getSingleListing, updateListing,getFeaturedListings, getMyListings } from "../controllers/listing.controller.js";
import express from 'express'
import verifyUser from "../middlewares/auth.js";
import { uploadMultiple } from "../middlewares/multer.js"; 

const router = express.Router()
 

router.post('/create',verifyUser,uploadMultiple,createListing)
router.route('/my-listings').get(verifyUser,getMyListings)
router.route('/featured').get(getFeaturedListings)
router.route('/:id').get(getSingleListing).patch(verifyUser,uploadMultiple,updateListing).delete(verifyUser,deleteListing)
router.route('/').get(getAllListings)

export default router;