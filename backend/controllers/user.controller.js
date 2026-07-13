import User from '../models/user.model.js'
import asyncHandler from '../utils/catchAsyncError.js'
import errorHandler from '../utils/errorhandler.js'
import sendToken from '../utils/jwt.js'
import jsonwebtoken from 'jsonwebtoken'
import { uploadBufferToCloudinary,deleteFromCloudinary } from '../utils/cloudinaryUpload.js'
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
export const updateUser = async (req, res) => {
  try {
    const updates = {};
    if (req.body.firstName) updates.firstName = req.body.firstName;
    if (req.body.lastName) updates.lastName = req.body.lastName;
    if (req.body.email) updates.email = req.body.email;

    if (req.file) {
      const currentUser = await User.findById(req.userId); 

      if (currentUser?.avatar?.public_id) {
        await deleteFromCloudinary(currentUser.avatar.public_id);
      }

      const result = await uploadBufferToCloudinary(req.file.buffer, "avatar", {
        transformation: [{ width: 300, height: 300, crop: "fill", gravity: "face" }],
      });

      updates.avatar = { url: result.secure_url, public_id: result.public_id };
    }

    const updatedUser = await User.findByIdAndUpdate(req.user, updates, {
      new:true,runValidators:true
    }).select("-password");
    
    

    res.status(200).json({ user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: err.message || "Update failed" });
  }
};

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
    res.status(200).json({success:true,message:"User Loggedout Successfully!"})
})