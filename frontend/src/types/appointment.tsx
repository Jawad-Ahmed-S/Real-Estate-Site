interface AppointmentPersons {
    _id: string;
    firstName: string;
    lastName: string;
}

interface AppointmentListing {
    _id: string;
    name: string;
    address: string;
}

type StatusOptions = "pending"|"confirmed"|"rejected"|"completed"

export interface AppointmentInterface{
    _id:string,
    buyer:AppointmentPersons,
    owner: AppointmentPersons, 
    listing:AppointmentListing, 
    proposedDateTime:Date,
    status:StatusOptions
    createdAt:Date
  } 