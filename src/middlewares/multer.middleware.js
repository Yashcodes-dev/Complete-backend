import multer from 'multer'

const storage = multer.diskStorage({  //diskStorage() -> "I want uploaded files to be stored on the server's disk."
    // destination --> tells us where the files should be stored
    destination: function(req, file, cb){ // req, file , cb --> arguments given by Multer  
        cb(null, "./public/temp")
    },

    // filename --> what should file be called  
    filename: function(req, file, cb){
      crypto.randomBytes(16, function (err, raw) {
          if (err) return cb(err)
          cb(null, file.fieldname + '-' + raw.toString('hex'))
    })// this is generating a random string to put in the file name so that two files don't overide eachother or to prevent files from having same name 
    }
})
// we haven't created any uplading middleware we've just told multer to use these rules when u upload files 



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

 