import multer from 'multer'

const storage = multer.diskStorage({  //diskStorage() -> "I want uploaded files to be stored on the server's disk."
    // destination --> tells us where the files should be stored
    destination: function(req, file, cb){   
        cb(null, "./public/temp")
    },

    // filename --> what should file be called  
     filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })    


export const upload = multer({
    storage,
})
//This is the real upload middleware 
// upload --> "Create a Multer uploader and use this storage configuration."


// (req, file , cb) 
// 1. file -> contain things like 
// fieldname
// originalname
// encoding
// mimetype
// size

// 2. req --> express request object , contain information  about the incoming HTTP request

// 3. cb --> Callback function
//         cb(null, "./public/temp") --> "There is no error. Save the file here."

 