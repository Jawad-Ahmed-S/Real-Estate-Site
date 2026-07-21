import mongoose, { type Model } from "mongoose";
import  validator  from "validator";
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import type {IUser,IUserMethods} from '../types/express/user.js'

const userSchema = new mongoose.Schema<IUser, Model<IUser, {}, IUserMethods>, IUserMethods>(
    {
        firstName:{
            type:String,
            required:[true,"first name is required"],
        },
        lastName:{
            type:String,
        },
        email:{
            type:String,
            required:[true,"Email is required"],
            unique:true,
            validate:[validator.isEmail,"Please enter a valid email."]
        },
        password:{
            type:String,
            required:[true,"Password is required"],
            minLength:[8,"Password should be atleast 8 charcters."]
        },
        avatar:{
            url: { 
                type: String, 
            },
            public_id: { 
                type: String, 
            }
        },
        resetPasswordToken: String,
        resetPasswordExpire:Date,
        
    },
    {timestamps:true}
)

userSchema.pre("save",async function (){
    if(!this.isModified("password")){
        return
    }

    this.password = await bcrypt.hash(this.password,10)
})

userSchema.methods.comparePassword = function(Enteredpassword:string){
    
    return bcrypt.compare(Enteredpassword,this.password)
}

userSchema.methods.getJWT = function(){
    const token = jwt.sign({id:this._id},(process.env.JWT_SECRET|| ""),{expiresIn:process.env.JWT_EXPIRE as any})
    return token
}
const User = mongoose.model<IUser, Model<IUser, {}, IUserMethods>>("User",userSchema);
export default User 