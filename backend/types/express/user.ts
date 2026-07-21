import type { Types } from "mongoose";

export interface IImage{
    url:string,
    public_id:string
}

export interface IUser{
    firstName:string,
    lastName:string,
    email:string,
    password:string,
    avatar:IImage,
    resetPasswordToken:string,
    resetPasswordExpire:Date,
    createdAt:Date,
    updatedAt:Date,
}

export interface IUserMethods{
    comparePassword(enteredPassword:string):Promise<boolean>;
    getJWT():string;
}