import User from '../models/user.model.js'
import asyncHandler from '../utils/catchAsyncError.js'
import errorHandler from '../utils/errorhandler.js'
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
    
    if(!user){
        return next(new errorHandler(404,"User Not Found!"))
    }
    
    const isPasswordMatched = await user.comparePassword(password)
    
    if(!isPasswordMatched){
        return next(new errorHandler(404,"Invalid Password!"))
    }

    sendToken(res,user,200,"User Loggedin! ")

})
export const updateUser = asyncHandler(async (req,res,next)=>{
    
    const userid = req.user.id
    
    const user =await  User.findById(userid)
    if(!user){
        return next(new errorHandler(400,"User Not found!"))
    } 
    const updatedUserData = {
        firstName: req.body.firstName || user.firstName,
        lastName: req.body.lastName || user.lastName,
        email: req.body.email || user.email,
    }
    console.log("i am here")
    const updatedUser = await User.findByIdAndUpdate(userid,updatedUserData);
    

    return res.status(200).json({sucess:true,message:"User Updated Sucessfully!",user:updatedUser})
})

export const deleteUser = asyncHandler(async (req,res,next)=>{
    
    const userid = req.user.id
    
    const user =await  User.findById(userid)
    if(!user){
        return next(new errorHandler(404,"User Not found!"))
    } 
    const deletedUser = await User.findByIdAndDelete(userid);
    

    return res.status(200).json({sucess:true,message:"User Deleted Sucessfully!",user:deletedUser})
})
export const logoutUser = asyncHandler(async (req,res,next)=>{
    const userid = req.user.id

    const user = await User.findById(userid);
    res.cookie('token',null,{
        expires: new Date(Date.now()),
        httpOnly:true
    })
    res.status(200).json({sucess:true,message:"User Loggedout Successfully!"})
})