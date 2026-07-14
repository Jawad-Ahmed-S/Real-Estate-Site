import User from "../models/user.model.js";
import catchAsyncError from "../utils/catchAsyncError.js";
import errorHandler from '../utils/errorhandler.js'
import jwt from 'jsonwebtoken'
const verifyUser = catchAsyncError(async(req,res,next)=>{
;
    const {token} = req.cookies
    if(!token){
        return next(new errorHandler(404,"User token not Found!"))
    }

    const decodeData = jwt.verify(token,process.env.JWT_SECRET)
    req.user =await User.findById(decodeData.id)
    
    next();

})

export default verifyUser;