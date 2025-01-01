import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/Like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    const userId = req.user._id
    const isLiked = await Like.findOne({
        video : videoId,
        likedBy : userId
    })
    console.log(isLiked);
    
    if(!isLiked)
    {
        const newLike = await Like.create({
            video : videoId,
            likedBy : userId
        })
        return res
        .status(200)
        .json(new ApiResponse(200,newLike,"like added"))
    }
    else {
        await Like.findOneAndDelete({
            video : videoId,
            likedBy : userId
        })
        return res
            .status(200)
            .json(new ApiResponse(200,"unliked ","like removed"))
    }
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
    //TODO: toggle like on comment

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet 
}  
)

const getLikedVideos = asyncHandler(async (req, res) => {
    console.log("HELLO ");
    const userID = req.user._id;
    if(!userID)throw new ApiError(400,"No user found")
   
            
    const likedVideos = await Like.aggregate([  
        {
            $match : {
                likedBy : new mongoose.Types.ObjectId(userID) 
            }
        },   
        {
            $lookup : {
                from : "videos",
                localField : "video",  
                foreignField : "_id",
                as : "video"
            }
        },
        {
            $unwind:"$video"
        },
        {
            $lookup : {      
                from : "users",
                localField : "video.owner",
                foreignField : "_id",
                as : "owner"
            }
        },
        {
            $unwind:"$owner"
        },
        {
            $project : {
                id : "$video._id",
                title:"$video.title",
                thumbnail:"$video.thumbnail",
                videoFile:"$video.videoFile",
                description:"$video.description",
                duration:"$video.duration",
                views:"$video.views",
                owner:{
                    fullname:"$owner.fullname",
                    username:"$owner.username",
                    avatar:"$owner.avatar"
                }
            }
        }
    ])
    console.log(likedVideos);
    
    return res
    .status(200)
    .json(new ApiResponse(200, likedVideos,"liked videos fetched successfully"))
}) 

export {
    toggleCommentLike,
    toggleTweetLike,   
    toggleVideoLike,
    getLikedVideos
}