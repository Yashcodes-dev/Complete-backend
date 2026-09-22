import {Router} from "express"
import { loginUser, registerUser, logoutUser } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
import jwt from 'jsonwebtoken';



const router = Router();

router.route('/register').post(
    
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ]),

    registerUser
) // express will run registerUser(req, res, next)

router.route('/login').post(loginUser)

//secured routes
router.route('/logout').post(verifyJWT, logoutUser)

export default router 