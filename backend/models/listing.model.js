import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
    {
        name:{
            type:String,
            required:true
        },
        description:{
            type:String,
            required:true
        },
        address:{
            type:String,
            required:true
        },
        regularPrices:{
            type:Number,
            required:true
        },
        discountedPrices:{
            type:Number,
            required:true
        },
        bedrooms:{
            type:Number,
            required:true
        },
        bathrooms:{
            type:Number,
            required:true
        },
        furnished:{
            type:Boolean,
            required:true
        },
        parking:{
            type:Boolean,
            required:true
        },
        type:{
            type:String,
            enum:['sell','rent'],
            required:true,
            message:'Not a valid option. Select from "sell" or "rent" '
        },
        offer:{
            type:Number,
            required:true
        },
        imageUrls:{
            type:Array,
            required:true
        },
        userRef:{
            type:String,
            required:true
        }
    },
    {timestamps:true}
)


const Listing = mongoose.model('Listing',listingSchema)
export default Listing;