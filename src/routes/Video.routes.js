import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getRandomVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
    getUserVideos
} from "../controllers/Video.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router
    .route("/video")
    .get(getAllVideos)
    .post(
        upload.fields([
            {      
                name: "videoFile",
                maxCount: 1,
            },
            {
                name: "thumbnail",
                maxCount: 1,
            },
            
        ]),
        publishAVideo
    );
 
router
    .route("/:videoId")
    .get(getVideoById)       
    .delete(deleteVideo)
    .patch(upload.single("thumbnail"), updateVideo);

router.route("/video/random-videos").get(getRandomVideos)
router.route("/video/user-videos").get(getUserVideos)
router.route("/toggle/publish/:videoId").patch(togglePublishStatus);

export default router         