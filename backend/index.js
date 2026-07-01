import express from "express";
import dotenv, { configDotenv } from "dotenv"
import mongoose from "mongoose";

const app = express()
configDotenv()

mongoose.connect(process.env.MONGODB_URI)

app.listen(8000,()=>{console.log("Server Started!")})