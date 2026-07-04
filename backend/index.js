import express from "express";
import dotenv, { configDotenv } from "dotenv"
import mongoose from "mongoose";
import userRouter from './routes/user.route.js'
import errorMiddleware from './middlewares/error.js'
const app = express()

configDotenv()

mongoose.connect(process.env.MONGODB_URI)


app.use(express.json())
app.use('/api/v1/user',userRouter)
app.use(errorMiddleware)


app.listen(8000,()=>{console.log("Server Started!")})