import dotenv from "dotenv"
import mongoose from "mongoose";
import { DB_NAME } from "./constants.js";
import connectDB from "./db/index.js";
import { app } from "./app.js";
import cloudinary from 'cloudinary'




dotenv.config({
  path: '.env'
})

// console.log("Cloudinary cloud:", cloudinary.config().cloud_name);
// console.log("Cloudinary API key exists:", !!cloudinary.config().api_key);
// console.log("Cloudinary API secret exists:", !!cloudinary.config().api_secret);



// database connection 
connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,  ()=>{
        console.log(`Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MONGODB connection failed !!! ", err);
})



/*
import express from "express";
const app = express();


;(async ()=>{
    try{
        await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
        app.on("error",(error)=>{
            console.log("ERROR: ", error);
            throw error
        })

        app.listen(process.env.PORT, ()=>{
            console.log(`APP is listening on port ${process.env.PORT}` );
        })
    }catch(error){
        console.log("ERROR: ", error)
        throw console.error();
        
    }
})()

*/