import express from "express";
import { signin,login,updateUser,deleteUser,logoutUser } from "../controllers/user.controller.js";
import verifyUser from '../middlewares/auth.js'
import { uploadSingle } from "../middlewares/multer.js";
const router = express.Router()
 
console.log("User router Called!")
router.post('/register',signin)
router.post('/login',login)
router.put('/update',verifyUser,uploadSingle,updateUser)
router.delete('/delete',verifyUser,deleteUser)
router.post('/logout',verifyUser,logoutUser)

export default router;