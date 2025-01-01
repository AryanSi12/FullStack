import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from 'axios';

const MyVideos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await axios.get("http://localhost:7000/api/v1/videos/video/user-videos", {
          withCredentials: true, // Include credentials if needed
        });
        console.log(response);
        
        console.log(response.data.data); // Check the response structure
        if(response.data.data.videos.length > 0)setVideos(response.data.data.videos); // Assuming the API returns the videos list
      } catch (error) {
        console.error("Error fetching videos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
    
    
  }, []);
  if (loading) return <div>Loading...</div>;
  if (videos.length === 0) return <p className="text-gray-400 text-xl font-semibold min-h-screen flex items-center justify-center">
  No videos found 
</p>              


  return (
    <div className="flex flex-col items-center w-full h-auto bg-slate-950 p-5 min-h-screen">
      {/* Main Container */}
      <div className="w-4/5 max-w-5xl bg-slate-900 text-white shadow-lg rounded-xl overflow-hidden">
        
        {/* Content Section */}
        <div className="mt-8 px-6 pb-6">
          <h2 className="text-xl font-semibold text-gray-100 border-b border-gray-700 pb-2 mb-4">
            My Videos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {videos.length > 0 ? (
              videos.map((video) => (
                <div
                  key={video._id}
                  className="rounded-md shadow-md hover:scale-105 transform transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/video/${video._id}`)} // Navigate to video page
                >
                  {/* Video Thumbnail with Duration Overlay */}
                  <div className="relative">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-44 object-cover rounded-md mb-2"
                    />
                    <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 rounded-md">
                      {formatDuration(video.duration)} {/* Format duration */}
                    </span>
                  </div>

                  {/* Video Title */}
                  <h3 className="text-lg font-medium">{video.title}</h3>

                  {/* Channel Username */}
                  <p className="text-sm text-gray-500">{video.owner?.username || "Unknown"}</p>
                </div>
              ))
            ) : (
                <p className="text-gray-400 text-xl font-semibold min-h-screen flex items-center justify-center">
                No videos found 
              </p>              
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyVideos;
