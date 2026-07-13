import mongoose, { Schema } from "mongoose";

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
        regularPrice:{
            type:Number,
            required:true
        },
        discountedPrice:{
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
            type:Boolean,
            required:true,
            default:false
        },
        imageUrls: [
            { url: { type: String, required: true }, public_id: { type: String, required: true } }
        ],
        owner:{
            type:Schema.Types.ObjectId,
            ref:'User',
            required:true
        }
    },
    {timestamps:true}
)


const Listing = mongoose.model('Listing',listingSchema)
export default Listing;