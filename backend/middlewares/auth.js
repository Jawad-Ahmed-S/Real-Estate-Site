import User from "../models/user.model.js";
import catchAsyncError from "../utils/catchAsyncError.js";
import errorHandler from '../utils/errorhandler.js'
import jwt from 'jsonwebtoken'
const verifyUser = catchAsyncError(async(req,res,next)=>{
;
      const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new errorHandler(401,"Please login to access this resource"));
    }

    const token = authHeader.split(" ")[1];
    if(!token){
        return next(new errorHandler(404,"User token not Found!"))
    }

    const decodeData = jwt.verify(token,process.env.JWT_SECRET)
    req.user =await User.findById(decodeData.id)
    
    next();

})

export default verifyUser;