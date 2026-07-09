import Listing from "../models/listing.model.js";
import catchAsyncError from "../utils/catchAsyncError.js";
import errorHandler from "../utils/errorHandler.js";


export const createListing = catchAsyncError(async(req,res,next)=>{
    const listingData =  req.body;
    if(!listingData){
        return next(new errorHandler(404,"Listing Data is not avilable for creation!"))
    }
    const listing = await Listing.create(listingData)
    
    return res.status(200).json({sucess:true,message:"Listing Created!",listing})
})


