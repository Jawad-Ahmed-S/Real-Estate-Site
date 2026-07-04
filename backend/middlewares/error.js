import errorHandler from "../utils/errorHandler.js";

export default (err,req,res,next)=>{
    err.statusCode = err.statusCode || 500,
    err.message = err.message || "Internal Server Error"

    if(err.name == "CastError"){
        err = new errorHandler(400,"Resource Not Found");
    }
    if(err.code == "11000"){
        err = new errorHandler(400,`Duplicate ${Object.keys(err.keyValue)} Entered!.`);
    }

    res.status(err.statusCode).json({
        sucess:false,
        error:err.message
})
}