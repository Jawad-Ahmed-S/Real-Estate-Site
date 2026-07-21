import type { Types } from "mongoose";

export interface IImage{
    url:string,
    public_id:string
}

export interface IListing{
    name:string,
    description:string,
    address:string,
    regularPrice:number,
    discountedPrice:number,
    bedrooms:number,
    bathrooms:number,
    furnished:boolean,
    parking:boolean,
    type:string,
    offer:boolean,
    owner:Types.ObjectId,
    imageUrls:IImage[],
    createdAt:Date,
    updatedAt:Date,
}