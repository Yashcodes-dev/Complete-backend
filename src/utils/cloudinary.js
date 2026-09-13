import {v2 as cloudinary} from "cloudinary"
import fs from "fs"

// "Here are the credentials/configuration needed to connect to my Cloudinary account."   
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

// When multer store the uploaded files temporarily it gives us a path --> that path is LocalFilePath
const uploadonCloudinary = async(localFilePath)=>{

 try {
   //If this localFilePath doesn't exists return null
    if(!localFilePath) return null;

   //upload the file on cloudinary 
   //.uploader is the Cloudinary's upload functionality 
   // .uploads() --> perform the actual upload --> tells the cloudinary to upload the file in this path
  const response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto" //Automatically determine what kind of resource this file is
      //   useful because your backend might upload different kinds of media.
    })

    console.log("file is uploaded on cloudinary", response.url)
    //file has been uploaded succesfully 
    return response;
   // The response contains things such as the uploaded resource's URL and other metadata.

 } catch (error) {
   // this simply means unlink the file from server we didn't want the file to be present on the server forever 
    fs.unlinkSync(localFilePath)// removes the locally saved temporary file as the upload operation got failed
    return null;
 }
}

export {uploadonCloudinary};




// Important Note --> fs.unlinkSync(localFilePath) this is inside our catch block it means this code delets the temporary file only when the Cloudinary uplad fails 
// it doesn't delete it after a successfull upload 
