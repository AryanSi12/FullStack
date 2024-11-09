import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
     getCurrUser,
     loginUser, 
     logoutUser, 
     registerUser, 
     updateAccountDetails, 
     updateAvatar, 
     updateCoverImage,
     getUserProfile,
     getWatchHistory
} from "../controllers/User.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router=Router();

router.route("/register").post(
    upload.fields([
        {
            name : "avatar",
            maxCount : 1
        },
        {
            name : "coverImage",
            maxCount : 1
        }
    ]),
    registerUser
)
router.route("/login").post(loginUser)
router.route("/logout").post(verifyJWT,logoutUser)
router.route("/current-user").get(verifyJWT, getCurrUser)
router.route("/update-account").patch(verifyJWT, updateAccountDetails)
router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateAvatar)
router.route("/cover-image").patch(verifyJWT, upload.single("coverImage"), updateCoverImage)
router.route("/channel/:username").get(verifyJWT, getUserProfile)
router.route("/history").get(verifyJWT, getWatchHistory)
export default router         