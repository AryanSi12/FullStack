import { ApiError } from "../utils/ApiError.js"
import { User } from "../models/User.model.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"

export const verifyJWT = asyncHandler(async(req,_,next)=>{
    try {        
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "") 
        console.log("verifyjwt");
         
        if(!token)throw new ApiError(401, "Unauthorized request")
            console.log(token);
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN)
        const user = await User.findById(decodedToken._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(401, "Invalid Access Token")
        }
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token")
    }  
})  