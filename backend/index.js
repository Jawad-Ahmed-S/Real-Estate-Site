import './utils/loadEnv.js'

import express from "express";
import mongoose from "mongoose";
import userRouter from './routes/user.route.js'
import listingRouter from './routes/listing.route.js'
import inquiryRouter from './routes/inquiry.route.js'
import AppointmentRouter from './routes/appointment.route.js'
import WishlistRouter from './routes/wishlist.route.js'
import errorMiddleware from './middlewares/error.js'
import cookieParser from "cookie-parser";
import cors from 'cors'
import cloudinary from './config/cloudinary.js'

const app = express()


app.set('query parser', 'extended') 



app.use(express.json())
app.use(express.urlencoded())
app.use(cookieParser())


app.use(cors({
    origin:process.env.CLIENT_URL,
    credentials:true
}))


mongoose.connect(process.env.MONGODB_URI).then(console.log("MongoDB connected!"))


app.use('/api/v1/user',userRouter)
app.use('/api/v1/listing',listingRouter)
app.use('/api/v1/inquiry',inquiryRouter)
app.use('/api/v1/appointment',AppointmentRouter)
app.use('/api/v1/wishlist',WishlistRouter)


app.use(errorMiddleware)



app.listen(8000,()=>{console.log("Server Started!")})