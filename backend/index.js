import express from "express";
import dotenv, { configDotenv } from "dotenv"
import mongoose from "mongoose";
import userRouter from './routes/user.route.js'
import listingRouter from './routes/listing.route.js'
import errorMiddleware from './middlewares/error.js'
import cookieParser from "cookie-parser";
import cors from 'cors'
const app = express()


configDotenv()
mongoose.connect(process.env.MONGODB_URI).then(console.log("MongoDB connected!"))

app.use(cors())
app.use(express.json())
app.use(cookieParser())

app.use('/api/v1/user',userRouter)
app.use('/api/v1/listing',listingRouter)


app.use(errorMiddleware)



app.listen(8000,()=>{console.log("Server Started!")})