import fs from "fs"
import { v2 as cloudinary} from "cloudinary"
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET 
});
const upload_Cloudinary = async (localfilepath) =>{
    try{
        if(!localfilepath){
            console.log("No such file...");
            return null;
        }
        const response = await cloudinary.uploader.upload(localfilepath,{
            resource_type: "auto"
        })
        fs.unlinkSync(localfilepath)
        return response;
    }
    catch(err)
    {
        fs.unlinkSync(localfilepath)
        return null;
    }
}

export {upload_Cloudinary}