import {createAppointment,getMyBookedAppointments,getRequestedAppointments,updateAppointmentComplete,updateAppointmentRequest,updateAppointmentStatus,cancelAppointment} from '../controllers/appointment.controller.js';
import express from 'express'
import verifyUser from "../middlewares/auth.js";


const router = express.Router()
 

router.route('/create').post(verifyUser,createAppointment)
router.route('/sentAppointments').get(verifyUser,getMyBookedAppointments)
router.route('/recievedAppointments').get(verifyUser,getRequestedAppointments)
router.route('/:id').patch(verifyUser,updateAppointmentRequest).delete(cancelAppointment)
router.route('/complete/:id').patch(verifyUser,updateAppointmentComplete)
router.route('/statusUpdate/:id').patch(verifyUser,updateAppointmentStatus)


export default router;