
import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/Playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { Video } from "../models/Video.model.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    console.log("Hello   ");
    
    if(!name || !description)throw new ApiError(400,"Need name and description to create a playlist")
    const playlist = await Playlist.create({
        name : name,
        description : description,
        owner : req.user._id
    })

    if(!playlist)throw new ApiError(500,"Error while creating a playlist")

    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"Playlist created sucessfully"))
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    const userPlaylists = await Playlist.aggregate([
        {
            $match : {
                owner : new  mongoose.Types.ObjectId(userId)
            }
        },
        {
            $project : {
                name : 1,
                description : 1,
                
            }
        }
    ])
    return res
    .status(200)
    .json(new ApiResponse(200,userPlaylists,"playlists fetched sucessfully"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    const playlist = await Playlist.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup : {
                from : "videos",
                localField : "videos",
                foreignField : "_id",
                as : "videoDetails"
            }
        }, 
        {
            $project: {
              name: 1,
              description: 1,
              videoDetails: 1
            }
        }
        
    ])
    return res
    .status(200)
    .json(new ApiResponse(200,playlist,"playlists fetched sucessfully"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!playlistId)throw new ApiError(400,"Invalid playlist id")
    if(!videoId)throw new ApiError(400,"Invalid video id")

    const video = await Video.findById(videoId)
    if(!video)throw new ApiError(404,"Video doess'nt exist")

    const playlist = await Playlist.findById(playlistId)
    if(!playlist)throw new ApiError(404,"Playlist doesn't exist")
         
        console.log(playlist.owner);       
        console.log(req.user._id);    
              
    if(playlist?.owner.toString() !== req.user._id.toString())throw new ApiError(408,"You don't have permissions to add a video")

    if(playlist.videos.includes(videoId))throw new ApiError(405,"video is already in the playlist")
    
    const addedVideo = await Playlist.findByIdAndUpdate(playlistId,
        {
            $addToSet : {
                videos : videoId
            }
        },
        {
            new : true
        }
    )
      
    if(!addedVideo)throw new ApiError(500,"something went wrong when adding your video to playlist")

    return res
    .status(200)
    .json(new ApiResponse(200,addedVideo,"video added to playlist successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    if(!playlistId)throw new ApiError(400,"Playlist id is invalid")
    
    if(!videoId)throw new ApiError(400,"videoId is invalid")

    const playlist = await Playlist.findById(playlistId)
    if(!playlist)throw new ApiError(404,"Playlist does'nt exists")
    
    const video = await Video.findById(videoId)
    if(!video)throw new ApiError(404,"Video does'nt exists")

    if(playlist.owner.toString() !== req.user._id.toString())throw new ApiError(408,"You don't have the permissions to delete a video from this playlist")

    if(!playlist.videos.includes(videoId))throw new ApiError(405,"video is not in the playlist")

    const deletedVideo = await Playlist.findByIdAndUpdate(playlistId,
        {
            $pull : {
                videos : {
                    $in : [`${videoId}`]
                }  
            }
        },
        {
            new:true
        }
    )

    if(!deletedVideo)throw new ApiError(500,"Something went wrong while deleting the video")

    return res
    .status(200)
    .json(new ApiResponse(200,deletedVideo,"Video deleted from the playlit sucessfully"))
    
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    if(!playlistId)throw new ApiError(400,"Playlist id is invalid")
    
    const playlist = await Playlist.findById(playlistId)

    if(!playlist)throw new ApiError(404,"Playlist not found")

    if(playlist.owner.toString() !== req.user._id.toString())throw new ApiError(508,"Permission denied ")

    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId)

    if(!deletedPlaylist)throw new ApiError(500,"Something went wrong while deleting the video")

    return res
    .status(200)
    .json(new ApiResponse(200,deletedPlaylist,"Playlist deleted sucessfully"))
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!playlistId)throw new ApiError(400,"Playlist id is invalid")

    if(!name && !description)throw new ApiError(404,"Atleast provide a name and description")

    const playlist = await Playlist.findById(playlistId)

    if(!playlist)throw new ApiError(404,"Playlist does'nt exists")

    if(playlist.owner.toString() !== req.user._id.toString())throw new ApiError(508,"Permission denied")
    
    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlistId,{
        $set:{
            name:name || playlist?.name,
            description : description || playlist?.description
        }
    },
    {
        new : true,        
    })
    if(!updatedPlaylist){
        throw new ApiError(500,"something went wrong when updating the playlist")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,updatedPlaylist,"The playlist is updated"))
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}
