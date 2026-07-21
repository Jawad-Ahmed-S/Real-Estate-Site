import mongoose, { Schema } from "mongoose";

const appointmentSchema = new mongoose.Schema(
    {
        buyer:{
            type:Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:'User',
            required:true
        },
        listing:{
            type:Schema.Types.ObjectId,
            ref:'Listing',
            required:true
        },
        proposedDateTime:{
            type:Date,
            required:true
        },
        status:{
            type:String,
            enum:['pending','confirmed','rejected','completed'],
            default:'pending',
            message:"Not a valid option. Select from `confirmed` or `rejected`"
        }
    },{timestamps:true}
)


const Appointment = mongoose.model('Appointment',appointmentSchema)
export default Appointment; 