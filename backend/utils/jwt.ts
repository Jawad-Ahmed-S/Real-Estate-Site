import type { Response } from "express";


export default function sendToken(res:Response,user:any,StatusCode:number,msg:string){

    const token = user.getJWT();

    res.status(StatusCode).json({success:true,message:msg,user,token})
} 