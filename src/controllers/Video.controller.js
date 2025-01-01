import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/Video.model.js"
import {User} from "../models/User.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {upload_Cloudinary} from "../utils/Cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 100, query = "", sortBy="createdAt", sortType=1, userId="" } = req.query
    //TODO: get all videos based on query, sort, pagination
    const allVideos = Video.aggregate([
        {
            $match : { 
                $or: [
                    { title: { $regex: query, $options: "i" } },
                    { description: { $regex: query, $options: "i" } }
                ]
            }
        },
        {
            $lookup : {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            _id :1,
                            fullName: 1,
                            avatar: "$avatar.url",
                            username: 1,
                            createdAt : 1,
                        }
                    },
                ] 
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner",
                },
            },
        },
        {
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1,
            }
        },
    ])                
    const options = {
        page,
        limit,
        customLabels: {
            totalDocs: "totalVideos",
            docs: "videos",

        },
        skip: (page - 1) * limit,
        limit: parseInt(limit),
    }

    const videoCollected = Video.aggregatePaginate(allVideos, options)
        .then(result => {
             console.log("first")
             console.log(result);
               
            if (result?.videos?.length === 0 ) {
                return res.status(200).json(new ApiResponse(200, [], "No videos found"))
            }

            return res.status(200)
                .json(
                    new ApiResponse(
                        200,
                        result,
                        "video fetched successfully"
                    )
                )
        })
         if(!videoCollected)throw new ApiError(500, error?.message || "Internal server error in video aggregate Paginate")
    
}) 

const getRandomVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 15, sortBy="createdAt", sortType=1 } = req.query
    //TODO: get all videos based on query, sort, pagination
    console.log("req.user._id"  );
    
    const allVideos = Video.aggregate([
        {
            $match : { 
                isPublished : true,   
            }
        },
        {
            $lookup : {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            _id :1,
                            fullName: 1,
                            avatar: 1,
                            username: 1,
                            createdAt : 1,
                        }
                    },
                ] 
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner",
                },
            },
        },
        {
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1,
            }
        },
    ])                
    const options = {
        page,
        limit,
        customLabels: {
            totalDocs: "totalVideos",
            docs: "videos",

        },
      
        limit: parseInt(limit),
    }

    const videoCollected = Video.aggregatePaginate(allVideos, options)
        .then(result => {
             console.log("first")
             console.log(result);
               
            if (result?.videos?.length === 0 ) {
                return res.status(200).json(new ApiResponse(200, [], "No videos found"))
            }

            return res.status(200)
                .json(
                    new ApiResponse(
                        200,
                        result,
                        "video fetched successfully"
                    )
                )
        })
         if(!videoCollected)throw new ApiError(500, error?.message || "Internal server error in video aggregate Paginate")
    
}) 

const getUserVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sortBy="createdAt", sortType=1 } = req.query
    //TODO: get all videos based on query, sort, pagination
    console.log("req.user._id"  );
    
    const allVideos = Video.aggregate([
        {
            $match : { 
                isPublished : true, 
                owner : new mongoose.Types.ObjectId(req.user._id)  
            }
        },
        {
            $lookup : {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "owner",
                pipeline: [
                    {
                        $project: {
                            _id :1,
                            fullName: 1,
                            avatar: "$avatar.url",
                            username: 1,
                            createdAt : 1,
                        }
                    },
                ] 
            }
        },
        {
            $addFields: {
                owner: {
                    $first: "$owner",
                },
            },
        },
        {
            $sort: {
                [sortBy]: sortType === "asc" ? 1 : -1,
            }
        },
    ])                
    const options = {
        page,
        limit,
        customLabels: {
            totalDocs: "totalVideos",
            docs: "videos",

        },
      
        limit: parseInt(limit),
    }

    const videoCollected = Video.aggregatePaginate(allVideos, options)
        .then(result => {
             console.log("first")
             console.log(result);
               
            if (result?.videos?.length === 0 ) {
                return res.status(200).json(new ApiResponse(200, [], "No videos found"))
            }

            return res.status(200)
                .json(
                    new ApiResponse(
                        200,
                        result,
                        "video fetched successfully"
                    )
                )
        })
         if(!videoCollected)throw new ApiError(500, error?.message || "Internal server error in video aggregate Paginate")
    
}) 

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description} = req.body
    console.log(title);
     
    if(!title || !description)throw new ApiError(400,"Title and description both are mandatory")
        const videoPath = req.files.videoFile[0].path
        const thumbnailPath = req.files.thumbnail[0].path
        console.log(videoPath);
        console.log(thumbnailPath);
        
        
    if(!videoPath || !thumbnailPath)throw new ApiError(404,"provide proper video and thumbnail to publish a video")
        const video = await upload_Cloudinary(videoPath) 
    console.log(video);
        const thumbnail = await upload_Cloudinary(thumbnailPath)
    console.log(thumbnail);
     
    
    
     
    if(!video || !thumbnail)throw new ApiError(500,"Some error occured while publishing the video")

    const publish = await Video.create({
        owner:req.user._id,
        title,
        description,
        videoFile:video.url,
        thumbnail:thumbnail.url,
        duration:video.duration
    })
    if(!publish){
        throw new ApiError(500,"something went wrong when making a document")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,publish,"video uploaded successfully"))
})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id 
    if(!videoId)throw new ApiError(400,"Please provide a video id")

    const videoDetails = await Video.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup : {
                from : "users",
                localField : "owner",
                foreignField : "_id",
                as : "uploadedBy"
            }
        },
        {
            $unwind:"$uploadedBy"
        },
        {
            $lookup : {
                from : "likes",
                localField : "_id",
                foreignField : "video",
                as : "likes"
            }
        },
        {
            $addFields : {
                TotalLikes : {
                    $size : "$likes"
                },
                isLiked :{
                    $cond : {
                        if:{$in : [req.user._id,"$likes.likedBy"]},
                        then : true,
                        else : false
                    }
                }
            }
        },
        {
            $lookup : {
                from : "subscriptions",
                localField : "owner",
                foreignField : "channel",
                as : "subscribers"
            }
        },
        {
            $addFields:{
                totalSubscribers:{
                    $size:"$subscribers"
                },
                isSubscriber:{
                    $cond:{
                        if:{$in:[req.user._id,"$subscribers.subscriber"]},
                        then:true,
                        else:false
                    }
                }
            }
        },
        {
            $project:{
                title:1,
                views:1,
                thumbnail:1,
                videoFile:1,
                description : 1,
                uploadedBy:{
                    fullname:1,
                    username:1,
                    avatar:1,
                    _id : 1,
                },
                TotalLikes:1,
                isLiked:1,
                totalSubscribers:1,
                isSubscriber:1
            }
        }
    ])
    return res
    .status(200)
    .json(new ApiResponse(200,videoDetails,"video fetched"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    if(!videoId){
        throw new ApiErrors(400,"provide valid videoId")
    }

    const video = await Video.findById(videoId)

    if(!video){
        throw new ApiErrors(404,"video not found")
    }

    const deleted = await Video.findByIdAndDelete(videoId)

    if(!deleted){
        throw new ApiErrors(500,"something went wrong when deleting a video")
    }

    await Like.deleteMany({video:videoId})

    await Comment.deleteMany({video:videoId})

    await User.updateMany({watchHistory:videoId},{$pull:{watchHistory:videoId}})

    return res
    .status(200)
    .json(new ApiResponse(200,deleted,"deleted"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getRandomVideos,
    getUserVideos
}