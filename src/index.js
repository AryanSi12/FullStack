import dotenv  from "dotenv";
import connectDB from "./db/connection.js";
import { app } from "./app.js";
dotenv.config({
    path: './.env'
})

connectDB()
.then(()=>{
    app.get("/",(req,res)=>{
        res.send("Hello")
    })
    app.listen(process.env.PORT || 5000 ,()=>{
        console.log(`Server started at Port : http://localhost:${process.env.PORT}`);
        
    }) 
})
.catch((err)=>{console.log("Server failed to Start");})
