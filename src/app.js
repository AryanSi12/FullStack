import express from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import bodyParser from 'body-parser';
const app=express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({limit:"16kb"}))
app.use(express.static("public"))        
app.use(cookieParser())
app.use(bodyParser.json()); // For parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); 

export {app}


//imports

import userRouter from "./routes/User.routes.js"
import subscriptionRouter from "./routes/Subscription.routes.js"

app.use("/api/v1/users", userRouter)
app.use("/api/v1/users", subscriptionRouter)     