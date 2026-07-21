import {markFavourite,demarkFavourite,getMyFavourites,getSingleFavourite} from '../controllers/wishlist.controller.js'
import express from 'express'
import verifyUser from "../middlewares/auth.js";


const router = express.Router()

router.route('/mark').post(verifyUser,markFavourite)
router.route('/:id').get(verifyUser,getSingleFavourite).delete(verifyUser,demarkFavourite)
router.route('/').get(verifyUser,getMyFavourites)


export default router; 