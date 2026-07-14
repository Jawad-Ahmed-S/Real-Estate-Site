export default function sendToken(res,user,StatusCode,msg){

    const token = user.getJWT();

    res.status(StatusCode).json({success:true,message:msg,user,token})
}