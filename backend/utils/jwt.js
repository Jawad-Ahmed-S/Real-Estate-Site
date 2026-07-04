export default function sendToken(res,user,StatusCode,msg){

    const token = user.getJWT();

    const option = {
        expires:new Date(Date.now()+process.env.COOKIE_EXPIRE*24*60*60*1000),
        httpOnly:true
    }
    res.status(StatusCode).cookie("token",token,option).json({sucess:true,message:msg,user,token})

}