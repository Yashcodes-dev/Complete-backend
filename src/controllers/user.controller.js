import {asyncHandler} from "../utils/asynchandler.js"
import { ApiError } from "../utils/APIError.js";
import { User } from "../models/user.model.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler( async(req, res, next) => {

   //Problem --> we want to register user  --> done
   // we need to take email and pass from user , get details from frontend 
   // we need to validate those email and pass -- check not empty
   // check if user already exist : username, email
   // check for images , check for avatar 
   // upload them to cloudinary , check avatar seprately 
   // create user object -- create entry in DB (.create) 
   // remove pass and refresh token field from response 
   // check for user creation --> just to check if user is created successfully or not if not then throw error
   // return response

   const {fullname, email, username, password } = req.body
   // console.log("email: ", email);

   if(
      [fullname, email, username, password].some((fields) => fields?.trim() == "")
      // .some() --> tells if atleast any one item from the array satisfies the given condition or not 
      // ? --> optional changing --> if field exists ,call trim() . if it doesn't exist , don't crash 
      // without ? --> imagine filed = undefined  then field.trim() will throw an error = cannot read properties of undefined  because undefined doesn't have a .trim() method
   ){
      throw new ApiError(400, "All fields are required")
   }
      
   const existeduser = await User.findOne({
      $or:[
         {username},{email}
      ]
   })

   if(existeduser) {
      throw new ApiError(409, "User already exists")
   }
   
   console.log(req.files)

   const avatarLocalPath = req.files?.avatar[0]?.path;
   // console.log(req.file);
   // const coverImageLocalPath = req.files?.coverImage[0]?.path;

   let coverImageLocalPath;
   if(req.filse && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
      coverImageLocalPath = req.files.coverImage[0].path;
   }

   
   if(!avatarLocalPath){
      throw new ApiError(400, "Avatar file is required01")
   }

   const avatar = await uploadonCloudinary(avatarLocalPath)
   // console.log("FILES:", req.files);
   const coverImage = await uploadonCloudinary(coverImageLocalPath)
   // console.log("AVATAR PATH:", avatarLocalPath);



   if(!avatar){
        throw new ApiError(400, "Avatar file is required")
   }


   const user = await User.create({
      fullname,
      avatar: avatar.url,
      coverImage: coverImage?.url || "",
      email,
      password,
      username: username.toLowerCase(),
   })

   const createduser = await User.findById(user._id).select(
      "-password -refreshToken"
   )

   if(!createduser){
      throw new ApiError(500,"Something went wrong while registering the user")
   }


   return res.status(201).json(
      new ApiResponse(200, createduser, "User registered successfully")
   )
   

})

export {registerUser}