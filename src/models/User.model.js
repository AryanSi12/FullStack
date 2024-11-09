import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new Schema(
    {
        username:{
            type:String,
            required : [true,"This field can not be empty"],
            lowercase:true,
            index:true,
            unique:true,
            trim:true
        },
        fullname:{
            type:String,
            required : [true,"This field can not be empty"],
            unique:false,
            trim:true,
            index:true
        },
        email:{
            type:String,
            required : [true,"This field can not be empty"],
            unique:true,
            lowercase:true,
            trim:true
        },
        avatar:{
            type:String,  //third-party image url provider
            required : [true,"This field can not be empty"],
        },
        coverImage:{
            type:String,
        },
        password:{
            type:String,
            required : [true,"This field can not be empty"],
        },
        watchHistory:[
            {
            type:Schema.Types.ObjectId,
            ref:"Video",
            }
        ],
        refreshToken:{
            type:String,
        }

    },
    {
        timestamps: true
    }
)

userSchema.pre("save",async function(next){
    if(this.isModified("password")){
        this.password = await bcrypt.hash(this.password, 10)
        next()
    }
    else return next();
})
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccestToken = function()
{
    return jwt.sign(
        {
            _id:this._id,
            fullname:this.fullname,
            email:this.email,
            username:this.username
        },
        process.env.ACCESS_TOKEN,
        {
            expiresIn: process.env.ACCESS_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id,   
        },
        process.env.REFRESH_TOKEN,
        {
            expiresIn: process.env.REFRESH_EXPIRY
        }
    )
}
export const User = mongoose.model("User",userSchema)