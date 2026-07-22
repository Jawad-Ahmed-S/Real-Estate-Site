type ListingType = "sell" | "Sell" | "rent" | "Rent";

export interface ListingInterface{
    _id:string,
    name:string,
    description?: string,
    address:string, 
    regularPrice:number, 
    discountedPrice:number,
    bedrooms:number, 
    bathrooms:number, 
    furnished:boolean, 
    parking:boolean, 
    type:ListingType, 
    offer:boolean,
    owner:string,
    imageUrls?:{public_id:string,url:string}[]
  } 