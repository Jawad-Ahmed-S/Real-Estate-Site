import Listing from "../models/listing.model.js";
import catchAsyncError from "../utils/catchAsyncError.js";
import errorHandler from "../utils/errorHandler.js";


export const createListing = catchAsyncError(async(req,res,next)=>{
    const {name,description,address,regularPrices,discountedPrices,bedrooms,bathrooms,furnished,parking,type,offer,imageUrls} =  req.body;
    const owner = req.user.id
    const listingData = {name,description,address,regularPrices,discountedPrices,bedrooms,bathrooms,furnished,parking,type,offer,imageUrls,owner}
    if(!listingData){
        return next(new errorHandler(404,"Listing Data is not avilable for creation!"))
    }
    const listing = await Listing.create(listingData)
    
    return res.status(200).json({sucess:true,message:"Listing Created!",listing})
})

export const updateListing = catchAsyncError(async (req,res,next)=>{
    const newData = req.body
    const listingId = req.params.id

    const listing = await Listing.findById(listingId);

    if(!listing){
        return next(new errorHandler(404,"Lisitng Not found!"))
    }

    const updatedListing = await Listing.findByIdAndUpdate(listingId,newData,{ new: true,runValidators:true})

    return res.status(200).json({message:"Listing Updated Sucessfully!",updatedListing})
})
 
export const getSingleListing = catchAsyncError(async (req,res,next)=>{
    const listingId = req.params.id

     const listing = await Listing.findById(listingId);

    if(!listing){
        return next(new errorHandler(404,"Lisitng Not found!"))
    }

    return res.status(200).json({sucess:true,listingData:listing})

})

export const getAllListings = catchAsyncError(async (req,res,next)=>{

     const listings = await Listing.findById();

    if(!listings){
        return next(new errorHandler(404,"Listings Not found!"))
    }

    return res.status(200).json({sucess:true,AllListings:listings})

})



export const deleteListing = catchAsyncError(async (req,res,next)=>{
    const listingId = req.params.id

    const listing = await Listing.findById(listingId);

    if(!listing){
        return next(new errorHandler(404,"Lisitng Not found!"))
    }

    const deletedListing = await Listing.findByIdAndDelete(listingId)

    return res.status(200).json({"message":"Listing Deleted Sucessfully!",deletedListing})
})