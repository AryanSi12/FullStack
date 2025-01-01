import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/User.model.js";
import { upload_Cloudinary } from "../utils/Cloudinary.js";
import mongoose from "mongoose";
import { v2 as cloudinary} from "cloudinary"
const generateAccessandRefreshTokens = async (UserId) =>{
    try {
        const user =await User.findById(UserId);
        console.log(user);
        
        const accessToken = user.generateAccestToken()
        const refreshToken = user.generateRefreshToken()
        console.log(refreshToken);
        
        //store the refresh token in the database for further use whenever an access token expires
        user.refreshToken = refreshToken;
        //save the token in the db without a password check
        await user.save({ validateBeforeSave: false })
        return {accessToken, refreshToken}

    } catch (error) { 
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

//Sign up
const registerUser = asyncHandler(async(req,res)=>{
    console.log("HELLO");
    
    const {fullname , username , email , password} = req.body
    if(
        [fullname , username , password , email].some((field)=>field?.trim()==="")
    ){
        throw new ApiError(400,"All fields are required");
    }
    const userExist =await User.findOne({
        $or:[{username} , {email}]
    })
    if(userExist)throw new ApiError(409,"User already exists");
    const avatarPath = req.files?.avatar[0]?.path;
    let coverImagePath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImagePath = req.files.coverImage[0].path
    }
    if(!avatarPath)throw new ApiError(400,"Avatar file is required");
    const avatar = await upload_Cloudinary(avatarPath)
    const coverImage = await upload_Cloudinary(coverImagePath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }
   
    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email, 
        password,
        username: username.toLowerCase()
    })
    const createdUser = await User.findById(user._id).select(
        " -refreshToken"
    )
    if(!createdUser)throw new ApiError(500,"Some error occured while registration!!");
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    );
}) 
  
//Login
const loginUser = asyncHandler(async(req,res)=> {
    const {username, email , password}=req.body;
    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    console.log(req.body);
    
    const user=await User.findOne({
        $or: [{username},{email}]
    })
    if(!user)throw new ApiError(404,"User does not exists");
    const isPasswordValid = await user.isPasswordCorrect(password);
    
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }
    console.log(user._id);
    
    const {accessToken, refreshToken} = await generateAccessandRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    
    const options = {
        httpOnly: true,
        secure: true
    }   
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200, 
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged In Successfully"
        )
    )

})

//logout
const logoutUser = asyncHandler(async(req,res)=>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            //remover refreshToken from the database
            $unset: {
                refreshToken: 1
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})

//To change password
const changePassword = asyncHandler(async(req,res)=>{
    const {oldPassword,newPassword}=req.body;
    const user=User.findById(req.user._id);
    const isPasswordCorrect = await user.isPasswordValid(oldPassword)
    if(!isPasswordCorrect)throw new ApiError(400, "Invalid old password")
    user.password=newPassword;
    await user.save({validateBeforeSave: false})
    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))

})

//Fetch the details of current user
const getCurrUser = asyncHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new ApiResponse(
        200,
        req.user,
        "User fetched successfully"
    ))
})

//to change the username
const updateAccountDetails = asyncHandler(async(req,res)=>{
    const {fullname}=req.body;
    if(!fullname)new ApiError(400, "All fields are required")
    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullname
            }
        },
        {new:true}

    ).select("-password")
    return res
    .status(200)
    .json(new ApiResponse(200,  user, "Account details updated successfully"))
})

//To change the avatar image
const updateAvatar = asyncHandler(async (req, res) => {
    const avatarLocationPath = req.file?.path;
    console.log(avatarLocationPath);
    
    if (!avatarLocationPath) {
        throw new ApiError(400, "Avatar file is missing");
    }
    
    // Delete the existing image from Cloudinary to reduce the overhead
    const user = await User.findById(req.user._id).select("avatar");
    console.log(user);
    
    const oldUrl = user.avatar;
    if (oldUrl) {
        // Use Cloudinary's built-in extraction by public ID from the URL (no need for getPublicIdFromUrl)
        const oldUrlPublicID = oldUrl.split('/').pop().split('.')[0]; // Extracts the public ID
        await cloudinary.uploader.destroy(oldUrlPublicID);
    }

    // Upload the new avatar
    const avatar = await upload_Cloudinary(avatarLocationPath);
    if (!avatar.url) {
        throw new ApiError(400, "Error while uploading the image on Cloudinary");
    }

    // Update the user's avatar URL in the database
    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: { avatar: avatar.url },
        },
        { new: true }
    ).select("-password");
    console.log(updatedUser);
    
    return res.status(200).json(new ApiResponse(200, updatedUser, "Avatar image updated successfully"));
});


//To change the coverImage 
const updateCoverImage = asyncHandler(async(req,res)=>{
    const coverImageUrl = req.file?.path;
    if(!coverImageUrl)throw new ApiError(400,"Cover image not provided")
        //dlete existing image from cloudinary
    const oldCoverUrl = await User.findById(req.user._id).select("coverImage")
    const oldCoverPublicID = getPublicIdFromUrl(oldCoverUrl)
    
    if(oldCoverPublicID)await cloudinary.uploader.destroy(oldCoverPublicID)

        const cover = await upload_Cloudinary(coverImageUrl)
        if(!cover.url)new ApiError(400,"Error while uploading the image on Cloudinary")
        
        const updatedUser = await User.findByIdAndUpdate(
            req.user._id,
            {
                $set:{
                    coverImage : cover.url
                }

            },
            {new:true}
        ).select("-password")
        return res.status(200).json(new ApiResponse(200, updatedUser, "Cover image updated successfully"))
})

//To fetch the user channel profile
const getUserProfile = asyncHandler(async (req,res) => {
    const {username} = req.params;
    if(!username?.trim())throw new ApiError(400,"username is missing")
    console.log(username);
     
    const channel = await User.aggregate([
        {
            $match : {
                username : username.toLowerCase()
            }
        },
        {
            $lookup : {
                from : "subscriptions", 
                localField : "_id",       
                foreignField : "channel",
                as : "Subscribers"
            }
        },
        {
            $lookup : {
                from : "subscriptions",
                localField : "_id",
                foreignField : "subscribers",
                as : "SubscribedTo"

            }
        },
        {
            $addFields : {
                subscribersCount : {
                    $size : "$Subscribers"
                },
                ChannelsSubscribedCount : {
                    $size : "$SubscribedTo"
                },
                isSubscribedTo : {
                    $cond : {
                        if : {$in : [req.user._id , "$Subscribers.subscriber"]},
                        then : true,
                        else : false
                    }
                }
            }
        },
        {
            $lookup : {
                from : "videos",
                localField : "_id",
                foreignField : "owner",
                as : "videosUploaded"
            }
        },  
             
        {
            $project : {
                fullname: 1,
                username: 1,
                subscribersCount: 1,
                ChannelsSubscribedCount: 1,
                isSubscribedTo: 1,
                avatar: 1,
                coverImage: 1,
                email: 1,
                videosUploaded : 1, 
            }
        }    
    ])
    
    
    if (!channel?.length) {
        throw new ApiError(404, "channel does not exists")
    }

    return res.status(200).json(new ApiResponse(200, channel[0], "User Profile details  "))
})

//To retrieve watch history of any user

const getWatchHistory = asyncHandler(async(req,res) => {
    const user = await User.aggregate([
        {
            $match : {
                _id : new mongoose.Types.ObjectId(req.user._id)       
            }
        },
        {
            $lookup : {
                from : "videos",    
                localField : "watchHistory",
                foreignField : "_id",
                as : "WatchHistory",
                pipeline : [
                    {
                        $lookup : {
                            from : "User",
                            localField : "owner",
                            foreignField : "_id",
                            as : "OwnerDetails",
                            pipeline : [
                                {
                                    $project : {
                                        fullname : 1,
                                        username : 1,
                                        avatar : 1
                                    }
                                }      
                            ]
                        }
                    },
                    {
                        $addFields : {
                            OwnerDetails : {
                                "$first" : "$OwnerDetails"
                            }
                        }
                    }
                ]
            }
        }
    ])
    console.log(user);
            
    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user[0].watchHistory,
            "Watch history fetched successfully"
        )
    )
})
export {
    registerUser,
    loginUser,
    logoutUser,
    changePassword,
    getCurrUser,
    updateAccountDetails,
    updateAvatar,
    updateCoverImage,
    getUserProfile,
    getWatchHistory,
               
};