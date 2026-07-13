import errorHandler from "../utils/errorHandler.js"
import catchAsyncError from "../utils/catchAsyncError.js"
import Wishlist from "../models/wishlist.model.js"
import Listing from "../models/listing.model.js"
import User from "../models/user.model.js"




export const markFavourite = catchAsyncError(async (req,res,next)=>{
        const {listingId} = req.body
        const userId = req.user.id

        if(!listingId){
            return next(new errorHandler(400,"listingId is required!"))
        }

        const listing = await Listing.findById(listingId)
        if(!listing){
            return next(new errorHandler(404,"Listing not found!"))
        }

        const alreadyMarked = await Wishlist.findOne({user:userId,listing:listingId})
        if(alreadyMarked){
            return next(new errorHandler(400,"This listing is already in your Wishlist!"))
        }

        const wishlist = await Wishlist.create({user:userId,listing:listingId})

        return res.status(200).json({sucess:true,message:"Favourite included in Wishlist Sucessfully!",wishlist});
})

export const demarkFavourite = catchAsyncError(async(req,res,next)=>{
    const favouriteId = req.params.id
    const userId = req.user.id

    const favourite = await Wishlist.findById(favouriteId)

    if(!favourite){
        return next(new errorHandler(404,"Favourite not found!"))
    }

    if(favourite.user.toString() !== userId){
        return next(new errorHandler(403,"You don't have permission to remove this favourite!"))
    }

    await favourite.deleteOne()

    return res.status(200).json({sucess:true,message:"Favourite Demarked!",favourite})
})


export const getMyFavourites = catchAsyncError(async(req,res,next)=>{
    
    const userId = req.user.id
    const favourites = await Wishlist.find({user:userId}).populate('listing')

    if(!favourites){
        return next(new errorHandler(404,"Favourites not found!"))
    }
    
    return res.status(200).json({sucess:true,message:"All Favourites Fetched!",favourites})
})
export const getSingleFavourite = catchAsyncError(async(req,res,next)=>{
    
    const favouriteId = req.params.id
    const favourite = await Wishlist.findById(favouriteId).populate('listing')

    if(!favourite){
        return next(new errorHandler(404,"Not Favourite!"))
    }
    
    return res.status(200).json({sucess:true,message:"Favourite Fetched!",favourite})
})