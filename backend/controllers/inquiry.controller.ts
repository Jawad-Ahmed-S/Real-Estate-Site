import errorHandler from "../utils/errorhandler.js"
import catchAsyncError from "../utils/catchAsyncError.js"
import Inquiry from "../models/inquiry.model.js"
import Listing from "../models/listing.model.js"
import User from "../models/user.model.js"
import type{ Request,Response,NextFunction } from "express"

type ListingParams = {
    id: string;
};

export const createInquiry = catchAsyncError(async (req:Request, res:Response, next:NextFunction)=>{
        const {listingId,message} = req.body
        const sender =req.user.id
        
        
        const listing = await Listing.findById(listingId)
        if(!listing){
            return next(new errorHandler(404,"Listing not found!"))
        }
        const recieverId = listing.owner;

        if(recieverId.toString() == sender.toString()){
            return next(new errorHandler(400,"You can't send inquiry to your own listing!"))
        }

        const inquiry = await Inquiry.create({sender,reciever:recieverId,listing:listingId,message})

        return res.status(200).json({sucess:true,message:"Inquiry Sent Sucessfully!"});
})

export const getMySentInquiries = catchAsyncError(async (req:Request, res:Response, next:NextFunction)=>{
    const userId = req.user.id
    
    const myInquiries = await Inquiry.find({
        sender:userId
    })
    .populate('listing', 'name address')
    .populate('reciever','firstName lastName')
    .sort({createdAt:-1});
    

    if(!myInquiries){
        return next(new errorHandler(404,'No Inquires Found'))
    }

    return res.status(200).json({sucess:true,message:"My Inquiries Fetched!",myInquiries})
}) 


export const getListingInquiries = catchAsyncError(async(req:Request<ListingParams>, res:Response, next:NextFunction)=>{
    const listingId = req.params.id
    const ListingInquiries = await Inquiry.find({
        listing:listingId
    })
    .populate('sender','name')
    .sort({createdAt:-1});
    

    if(!ListingInquiries){
        return next(new errorHandler(404,'No Inquires Found'))
    }

    return res.status(200).json({sucess:true,message:"Listing's Inquiries Fetched!",ListingInquiries})
})

export const getRecievedInquiries = catchAsyncError(async (req:Request, res:Response, next:NextFunction)=>{
    const userId = req.user.id
    
    const myInquiries = await Inquiry.find({
        reciever:userId
    })
    .populate('listing', 'name address')
    .populate('sender','firstName lastName')
    .sort({createdAt:-1});
    

    if(!myInquiries){
        return next(new errorHandler(404,'No Inquires Found'))
    }

    return res.status(200).json({sucess:true,message:"My Inquiries Fetched!",myInquiries})
})

export const updateInquiry = catchAsyncError(async(req:Request, res:Response, next:NextFunction)=>{
    const inquiryId = req.params.id
    const inquiry = await Inquiry.findById(inquiryId)
    if(!inquiry){
        return next(new errorHandler(404,"Inquiry Not Found!"))
    } 
    const updatedMessage = req.body.message

    const updatedInquiry = await Inquiry.findByIdAndUpdate(inquiryId,{message:updatedMessage},
    { new: true, runValidators: true })


    return res.status(200).json({sucess:true,message:"Inquiry Updated!",updatedInquiry})
    
})

export const deleteInquiry = catchAsyncError(async(req:Request, res:Response, next:NextFunction)=>{
    const inquiryId = req.params.id
    const inquiry = await Inquiry.findById(inquiryId)
    if(!inquiry){
        return next(new errorHandler(404,"Inquiry Not Found!"))
    } 
    const deletedInquiry = await Inquiry.findByIdAndDelete(inquiryId)

    return res.status(200).json({sucess:true,message:"Inquiry Deleted!",deletedInquiry})
    
})

export const getInquiry = catchAsyncError(async(req:Request, res:Response, next:NextFunction)=>{
    const inquiryId = req.params.id
    const inquiry = await Inquiry.findById(inquiryId)
    if(!inquiry){
        return next(new errorHandler(404,"Inquiry Not Found!"))
    } 

    return res.status(200).json({sucess:true,message:"Inquiry Fetched!",inquiry})
    
})


