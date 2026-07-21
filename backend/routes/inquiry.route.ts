import { createInquiry, deleteInquiry, getListingInquiries, getMySentInquiries, getRecievedInquiries, updateInquiry,getInquiry } from '../controllers/inquiry.controller.js';
import express from 'express'
import verifyUser from "../middlewares/auth.js";


const router = express.Router()
 

router.route('/create').post(verifyUser,createInquiry)
router.route('/sentInquiries').get(verifyUser,getMySentInquiries)
router.route('/listing/:id').get(verifyUser,getListingInquiries)
router.route('/recievedInquiries').get(verifyUser,getRecievedInquiries)
router.route('/:id').get(verifyUser,getInquiry).patch(verifyUser,updateInquiry).delete(deleteInquiry)

export default router;