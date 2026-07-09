import User from "../models/user.model.js";
import catchAsyncError from "../utils/catchAsyncError.js";
import errorHandler from '../utils/errorHandler.js'
import jwt from 'jsonwebtoken'
const verifyUser = catchAsyncError(async(req,res,next)=>{
;
    const {token} = req.cookies
    console.log(token);
    if(!token){
        return next(new errorhandler(404,"Token Not Found!"))
    }

    const decodeData = jwt.verify(token,process.env.JWT_SECRET)
    req.user =await User.findById(decodeData.id)
    
    next();

})

export default verifyUser;