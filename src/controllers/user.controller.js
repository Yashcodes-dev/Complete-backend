import {asyncHandler} from "../utils/asynchandler.js"
import { ApiError } from "../utils/APIError.js";
import { User } from "../models/user.model.js";
import { uploadonCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";



const generateAccessAndRefreshTokens = async(userId) =>{
   try {
      const user = await User.findById(userId)
      const refreshToken = user.generateRefreshToken()
      const accessToken = user.generateAccessToken()

      user.refreshToken = refreshToken
      await user.save({validateBeforeSave: false})

      return{
         accessToken, refreshToken
      }

   } catch (error) {
      throw new ApiError(500, "Something went wrong while generating tokens")
   }
}





// const registerUser = asyncHandler( async(req, res, next) => { // registration logic } )
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
   
   // console.log(req.files)

   const avatarLocalPath = req.files?.avatar[0]?.path;
   // console.log(req.file);
   // const coverImageLocalPath = req.files?.coverImage[0]?.path;

   let coverImageLocalPath;

   if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
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


   return res
   .status(201)
   .json(
      new ApiResponse(200, createduser, "User registered successfully")
   )
   

})

const loginUser = asyncHandler( async(req, res, next) => {
   // take creadentials from user 
   // validate --> not empty
   // verify them --> correct id pass or not 
   // check if the user exist or not if no then  redirect to register page
   // login success -> generate Access token, and refresh token
   // send cookie
   // display login page 
   // success response 

   const {username, email, password} = req.body

   if(!username && !email){
      throw new ApiError(400, "username or email is required")
   }

   const user = await User.findOne({
      $or: [{username}, {email}]
   })

   if(!user){
      throw new ApiError(404, "User doesn't exist")
   }

   const isPasswordValid = await user.isPasswordCorrect(password)

   if(!isPasswordValid){
      throw new ApiError(401, "Invalid user creadentials")
   }

   const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

   const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

   const options = {
      httpOnly: true,
      secure: true
   }

   return res
   .status(200)
   .cookie("accessToken", accessToken, options)
   .cookie("refreshToken", refreshToken, options)
   .json(
      new ApiResponse(
         200,
         {
           user: loggedInUser, accessToken ,refreshToken
         },
         "User logged in successfully"
      )
   )

})

const logoutUser = asyncHandler( async(req, res)=> {
   User.findByIdAndUpdate(
         req.user._id,
         {
            $set: {
               refreshToken: undefined
            }
         },
         {
            new: true
         }
   )
})


const refreshAccessToken = asyncHandler( async(req, res)=>{
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

  if(!incomingRefreshToken){
   throw new ApiError(401, "Unauthorized Request")
  }

try {
     const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);

  const user = await User.findById(decodedToken._id)

  if(!user){
   throw new ApiError(401, "Invalid refresh Token")
  }

  if(incomingRefreshToken !== user?.refreshToken){
      throw new ApiError(401, "Refresh Token is expired or used")
  }

  const options ={
   httpOnly: true,
   secure: true
  }

  const {accesToken, newrefreshToken} = await generateAccessAndRefreshTokens(user._id)

  return res
  .status()
  .cookie("acessToken", accessToken, options)
  .cookie("refreshToken", newrefreshToken, options)
  .json(
   new ApiResponse(
      200,
      {accessToken, refreshToken :newrefreshToken},
      "Access Token refreshed "
   )
  )
} catch (error) {
    throw new ApiError(401, error?.message || "Invalid Refresh token")  
}

})

const changeCurrentPassword = asyncHandler( async(req, res)=>{

   const {oldPassword, newPassword} = req.body

   //req.user --> coming from auth middleware
   const user = await User.findById(req.user?._id)

   const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

   if(!isPasswordCorrect){
      throw new ApiError(400, "Invalid old Password")
   }

   user.passwrod = newPassword
   await user.save({validateBeforeSave: false})

   return res
   .status(200)
   .json(new ApiResponse(200, {}, "Password changed successfully"))
})

const getCurrentUser = asyncHandler( async(req, res)=>{

   return res
   .status(200)
   .json(200, req.user, "current user fetched successfullly")
})

const updateAccountDetails = asyncHandler( async(req, res)=>{
   const {fullname, email, } = req.body 

   const user = User.findByIdAndUpdate(
      req.user?._id,
      {
         $set: {
            fullname,
            email,   
         }
      },
      {new : true}
   ).select("-password")

   return res
   .status(200)
   .json(new ApiResponse(200, user, "Account details updated successfully "))

})

const updateUserAvatar = asyncHandler( async(req, res)=>{
  const avatarLocalPath = req.file?.path

  if(!avatarLocalPath){
   throw new ApiError(400, "Avatar file is missing")
  }

  const avatar = await uploadonCloudinary(avatarLocalPath)

  if(!avatar.url){
   throw  new ApiError(400, "Error while uploading on avatar")
  }

  const user = await User.findByIdAndUpdate(
   req.user?._id,
   {
      $set:{
         avatar: avatar.url
      }
   },
   {new: true}
  ).select("-password")

    return res
  .status(200)
  .json(new ApiResponse(200, "Avatar updated successfully"))

})

const updateUserCoverImage = asyncHandler( async(req, res)=>{
  const coverImageLocalPath = req.file?.path

  if(!coverImageLocalPath){
   throw new ApiError(400, "CoverImage file is missing")
  }

  const coverImage = await uploadonCloudinary(coverImageLocalPath)

  if(!coverImage.url){
   throw  new ApiError(400, "Error while uploading on avatar")
  }

  const user = await User.findByIdAndUpdate(
   req.user?._id,
   {
      $set:{
         coverImage: coverImage.url
      }
   },
   {new: true}
  ).select("-password")

  return res
  .status(200)
  .json(new ApiResponse(200, "CoverImage updated successfully"))

})




export {
   registerUser,
   loginUser,
   logoutUser,
   refreshAccessToken,
   changeCurrentPassword,
   updateUserAvatar,
   getCurrentUser,
   updateUserCoverImage
}