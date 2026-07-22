
interface InquiryPersons {
    _id: string;
    firstName: string;
    lastName: string;
}

interface InquiryListing {
    _id: string;
    name: string;
    address: string;
}
export interface InquiryInterface{
    _id:string,
    sender:InquiryPersons,
    reciever: InquiryPersons, 
    listing:InquiryListing, 
    message:string,
    createdAt:Date
  } 