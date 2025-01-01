import mongoose, {isValidObjectId} from "mongoose"
import { User } from "../models/User.model.js";
import { Subscription } from "../models/Subscriptions.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    console.log("Hello");
    
    const {channelId} = req.params
    const userID = req.user._id
        
    if(!channelId)throw new ApiError(400,"Error in fetching the channel name")
    const isSubscribed = await Subscription.findOne({
        subscriber: userID,
        channel: channelId
    });
   
    if(!isSubscribed)
    {
        const newSubscription = new Subscription({
            subscriber : userID,
            channel : channelId
        })
        await newSubscription.save();
        res.status(201).json({ message: "Subscribed successfully" });
    }
    else{
        await Subscription.deleteOne({_id : isSubscribed._id})
        res.status(200).json({ message: "Unsubscribed successfully" }); 
    }
})
     
// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    
    if(!channelId)throw new ApiError(400,"channel id not provided")     
        const channelSubscribers = await User.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup : {
                from : "subscriptions",
                localField : "_id",
                foreignField : "channel",
                as : "subscriberDetails"
            }
        },
        {
            $unwind: "$subscriberDetails" 
        },
        {    
            $project: {
                _id: 0,
                "subscriberDetails._id": 1,
                "subscriberDetails.username": 1,
                "subscriberDetails.fullname": 1,
                "subscriberDetails.avatar": 1

            }
        }
    ]) 
    if(!channelSubscribers)throw new ApiError(400,"Enter valid id")    
        console.log(channelSubscribers);         
        
        res.status(200).json({
            subscribers: channelSubscribers.map(sub => sub),
            count: channelSubscribers.length
        });              
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params 
     
    if(!subscriberId)throw new ApiError(400,"subscriber id not provided")
    const subscribedChannels = await Subscription.aggregate([
        {
            $match : {
                subscriber : new mongoose.Types.ObjectId(subscriberId)
            }
        },
        {
            $lookup : {
                from : "users",   
                localField : "channel",
                foreignField : "_id",        
                as : "channelDetails"     
            }
        },
        { $unwind: "$channelDetails" },
      
    ])
    if(!subscribedChannels)throw new ApiError(400,"Enter valid id") 
    console.log(subscribedChannels);

 
     
    return res
    .status(200)
    .json(new ApiResponse(200,subscribedChannels,"subscribed channel fetched successfully"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}