import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router=Router(); 
import {
    getSubscribedChannels,
    getUserChannelSubscribers,
    toggleSubscription,
} from "../controllers/Subscriptions.controller.js"
router.use(verifyJWT)
router.route("/subscribe/:channelId").get(toggleSubscription)  
router.route("/getChannels/:subscriberId").get(getSubscribedChannels);
router.route("/getSubscribers/:channelId").get(getUserChannelSubscribers);
export default router           