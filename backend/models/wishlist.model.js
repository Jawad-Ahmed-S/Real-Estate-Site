import mongoose, { Schema } from "mongoose";

const wishlistSchema = new mongoose.Schema(
    {
        user:{
            type:Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        listing:{
            type:Schema.Types.ObjectId,
            ref:'Listing',
            required:true
        },
    },{timestamps:true}
)


const wishlist = mongoose.model('Wishlist',wishlistSchema)
export default wishlist;