import mongoose, { Schema } from "mongoose";

const appointmentSchema = new mongoose.Schema(
    {
        sender:{
            type:Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        reciever:{
            type:Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        listing:{
            type:Schema.Types.ObjectId,
            ref:'Listing',
            required:true
        },
        message:{
            type:String,
            required:true
        }
    },{timestamps:true}
)


const Appointment = mongoose.model('Appointment',appointmentSchema)
export default Inquiry;