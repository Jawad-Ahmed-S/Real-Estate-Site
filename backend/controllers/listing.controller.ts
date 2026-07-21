import Listing from "../models/listing.model.js";
import catchAsyncError from "../utils/catchAsyncError.js";
import errorHandler from "../utils/errorhandler.js";
import ApiFeatures from "../utils/apiFeatures.js";
import { uploadBufferToCloudinary, deleteFromCloudinary } from "../utils/cloudinaryUpload.js";
import type { Request,Response,NextFunction } from "express";
import type { UploadApiResponse } from "cloudinary";


interface IImage{
    url:string,
    public_id:string
}



export const createListing = catchAsyncError(async (req:Request, res:Response, next:NextFunction) => {
    let { name, description, address, regularPrice, discountedPrice, bedrooms, bathrooms, furnished, parking, type, offer } = req.body;
    const owner = req.user.id;
    const files = req.files as Express.Multer.File[];
    if (!req.files || req.files.length === 0) {
        return next(new errorHandler(400, "At least one image is required!"));
    }

    const hasOffer = offer === true || offer === 'true';

    
    if (!hasOffer) {
        discountedPrice = regularPrice;
    }

    const uploadResults:UploadApiResponse[] = await Promise.all(

        files.map((file) => uploadBufferToCloudinary(file.buffer, "listings"))
    );

    const imageUrls:IImage[] = uploadResults.map((r)  => ({ url: r.secure_url, public_id: r.public_id }));

    let listingData = { name, description, address, regularPrice, discountedPrice, bedrooms, bathrooms, furnished, parking, type, offer:hasOffer, imageUrls, owner };

    if (!listingData) {
        return next(new errorHandler(404, "Listing Data is not avilable for creation!"));
    }
    
    const listing = await Listing.create(listingData);

    return res.status(200).json({ sucess: true, message: "Listing Created!", listing });
});
 


export const updateListing = catchAsyncError(async (req:Request, res:Response, next:NextFunction) => {
    const newData = req.body;
    const listingId = req.params.id;

    const listing = await Listing.findById(listingId);
    const files = req.files as Express.Multer.File[];
    if (!listing) {
        return next(new errorHandler(404, "Lisitng Not found!"));
    }

    if (String(listing.owner) !== String(req.user.id)) {
        return next(new errorHandler(403, "Not authorized to update this listing!"));
    }
    if (newData.offer !== undefined) {
        const hasOffer = newData.offer === true || newData.offer === 'true';
        newData.offer = hasOffer;
        
        
        if (!hasOffer) {
            newData.discountedPrice = newData.regularPrice || listing.regularPrice; 
        }
    }

    const keptImages:IImage[] = newData.existingImages ? JSON.parse(newData.existingImages) : [];
    const keptPublicIds = new Set(keptImages.map(img => img.public_id));
    const toDelete = listing.imageUrls.filter(img => !keptPublicIds.has(img.public_id));

    await Promise.all(toDelete.map(img => deleteFromCloudinary(img.public_id)));

    let newImages:IImage[] = [];
    if (files && files.length > 0) {
        const uploadResults = await Promise.all(
            files.map(file => uploadBufferToCloudinary(file.buffer, "listings"))
        );
        newImages = uploadResults.map(r => ({ url: r.secure_url, public_id: r.public_id }));
    }

    const imageUrls = [...keptImages, ...newImages];

    if (imageUrls.length === 0) {
        return next(new errorHandler(400, "At least one image is required!"));
    }

    delete newData.existingImages;
    newData.imageUrls = imageUrls;

    const updatedListing = await Listing.findByIdAndUpdate(listingId, newData, { new: true, runValidators: true });

    return res.status(200).json({ message: "Listing Updated Sucessfully!", updatedListing });
});


export const getSingleListing = catchAsyncError(async (req:Request, res:Response, next:NextFunction)=>{
    const listingId = req.params.id

     const listing = await Listing.findById(listingId);

    if(!listing){
        return next(new errorHandler(404,"Lisitng Not found!"))
    }

    return res.status(200).json({sucess:true,listingData:listing})

})


export const getAllListings = catchAsyncError(async (req:Request, res:Response, next:NextFunction)=>{

    
     
     const listingCount = await Listing.countDocuments()
     const resultsPerPage = 10
     
    const apifeature = new ApiFeatures(Listing.find(),req.query).search().filter().pagination(resultsPerPage)
    const listings = await apifeature.query
    


    if(!listings){
        return next(new errorHandler(404,"Listings Not found!"))
    }

    return res.status(200).json({sucess:true,AllListings:listings})

})
export const getFeaturedListings = catchAsyncError(async (req:Request, res:Response, next:NextFunction)=>{

    //  console.log("RAW req.query:", JSON.stringify(req.query))
      
     const listingCount = await Listing.countDocuments()
     const resultsPerPage = 10
        // console.log("RAW req.query 2:", JSON.stringify(req.query))
    const apifeature = new ApiFeatures(Listing.find(),req.query).pagination(resultsPerPage)
    const listings = await apifeature.query
    


    if(!listings){
        return next(new errorHandler(404,"Listings Not found!"))
    }

    return res.status(200).json({sucess:true,AllListings:listings})

})
export const getMyListings = catchAsyncError(async (req:Request, res:Response, next:NextFunction)=>{
    const userId = req.user.id
    

    const listings = await Listing.find({owner:userId}).sort({createdAt: -1})

    if(!listings){
        return next(new errorHandler(404,"Listings not Found!"));
    }

    return res.status(200).json({
        sucess:true,
        listings
    })
})

export const deleteListing = catchAsyncError(async (req:Request, res:Response, next:NextFunction) => {
    const listingId = req.params.id;

    const listing = await Listing.findById(listingId);

    if (!listing) {
        return next(new errorHandler(404, "Lisitng Not found!"));
    }

    if (String(listing.owner) !== String(req.user.id)) {
        return next(new errorHandler(403, "Not authorized to delete this listing!"));
    }

    await Promise.all(listing.imageUrls.map(img => deleteFromCloudinary(img.public_id)));

    const deletedListing = await Listing.findByIdAndDelete(listingId);

    return res.status(200).json({ "message": "Listing Deleted Sucessfully!", deletedListing });
});