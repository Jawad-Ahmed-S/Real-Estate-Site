import User from '../models/user.model.js'
import asyncHandler from '../utils/catchAsyncError.js'
import errorHandler from '../utils/errorHandler.js'
import sendToken from '../utils/jwt.js'
import jsonwebtoken from 'jsonwebtoken'
export const  signin = asyncHandler(async (req,res,next)=>{
        
    const {firstName,lastName,email,password} = req.body

    const user  =await User.create({firstName,lastName,email,password});

    
    sendToken(res,user,200,"User Created sucsessfully")


}
)

export const  login = asyncHandler(async(req,res,next)=>{
    const {email,password} = req.body

    if(!email || !password){
        return next(new errorHandler(404,"Please Enter both password and email!"))
    }
    const user = await User.findOne({email})
    console.log(user)
    if(!user){
        return next(new errorHandler(404,"User Not Found!"))
    }
    
    const isPasswordMatched = await user.comparePassword(password)
    
    if(!isPasswordMatched){
        return next(new errorHandler(404,"Invalid Password!"))
    }

    sendToken(res,user,200,"User Loggedin! ")

})