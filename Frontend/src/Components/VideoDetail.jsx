import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FaHeart } from 'react-icons/fa';

const VideoDetail = () => {
  const { id } = useParams(); // Get video ID from the URL
  const [video, setVideo] = useState(null);
  const [suggestedVideos, setSuggested] = useState([]);
  const [likes, setLikes] = useState(0);
  const [liked, setLiked] = useState(false);
  const [dislikes, setDislikes] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false); // State for subscription
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch video details by ID (replace this with your API endpoint)
    console.log(id);
    
    const fetchVideo = async () => {
      const response = await axios.get(`http://localhost:7000/api/v1/videos/${id}`, {
        withCredentials: true,
      });
      const suggVideos = await axios.get(
        "http://localhost:7000/api/v1/videos/video/random-videos?page=1&limit=10&sortBy=createdAt&sortType=1",
        { withCredentials: true }
      );
      console.log(response.data);
      
      setSuggested(suggVideos.data.data.videos);
      setVideo(response.data.data);
      setLikes(response.data.data[0]?.TotalLikes || 0);
      setIsSubscribed(response.data.data[0].isSubscriber)
      setLiked(response.data.data[0]?.isLiked || false);
    };


    fetchVideo();
    
  }, [id]);

  if (!video) return <div className="text-center text-white">Loading...</div>;

  const handleLike = async () => {
    try {
      const response = await axios.post(
        `http://localhost:7000/api/v1/likes/toggle/v/${video[0]._id}`,
        null,
        { withCredentials: true }
      ); 
      console.log(response);
      
      if (response.data.message === "like added") {
        setLikes(likes + 1);
        setLiked(true);
      } else if (response.data.message === "like removed") {
        setLikes(likes > 0 ? likes - 1 : 0);
        setLiked(false);
      }
    } catch (error) {
      console.error("Error toggling like:", error.response?.data?.message || error.message);
    }
  };


  const handleSubscribe = async () => {
    console.log(video[0]);
    try{
    const toggleSubscribe = await axios.get(`http://localhost:7000/api/v1/users/subscribe/${video[0].uploadedBy._id}`,{
      withCredentials: true,
    });
    console.log(toggleSubscribe);
    if(toggleSubscribe.data.message == "Unsubscribed successfully")setIsSubscribed(false)
      else setIsSubscribed(true);
    // Optionally, call an API to update subscription state
    }
    catch(error)
    {
      if (error.response) {
        console.error("Error in subscribing from video details:", error.response.data.message || error.response.data);
      } else {
        console.error("An error occurred during subcriber:", error.message);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row p-4 bg-gray-900 text-white min-h-screen">
      {/* Main Video Section */}
      <div className="w-full lg:w-3/4 bg-gray-800 p-4 rounded-lg shadow-lg">
        {/* Video Player */}
        <div className="w-full h-64 md:h-96 bg-black">
          <video
            src={video[0].videoFile}
            controls
            className="w-full h-full object-cover"
          />
        </div>

        {/* Video Title */}
        <h1 className="text-2xl font-semibold mt-4">{video[0].title}</h1>

        {/* Video Details */}
        <div className="flex items-center justify-between text-sm text-gray-400 mt-2">
          {/* Uploader Info */}
          <div className="flex items-center space-x-2">
            {/* Avatar */}
            <img
              src={video[0].uploadedBy?.avatar || "default-avatar-url.jpg"} // Provide a default avatar if none exists
              alt={video[0].uploadedBy?.username || "Unknown"}
              className="w-8 h-8 rounded-full cursor-pointer"
              onClick={() => navigate(`/account/${video[0].uploadedBy?.username || "unknown"}`)}
            />
            {/* Username */}
            <p>
              Uploaded by: {" "}
              <span
                className="text-blue-500 hover:underline cursor-pointer"
                onClick={() => navigate(`/account/${video[0].uploadedBy?.username || "unknown"}`)}
              >
                {video[0].uploadedBy?.username || "Unknown"}
              </span>
            </p>
          </div>

          {/* Views */}
          <p>Views: {video[0].views || 0}</p>
        </div>

        {/* Like, Dislike, and Subscribe Section */}
        <div className="flex items-center space-x-4 mt-4">
        <button
            className={`px-4 py-2 rounded-lg flex items-center ${liked ? 'text-red-500' : 'text-white'}`}
            onClick={handleLike}
          >
            <FaHeart className="mr-2 text-2xl" /> {likes}
          </button>
          <button
            className={`px-4 py-2 rounded-lg flex items-center ${isSubscribed ? 'bg-gray-600' : 'bg-red-500 hover:bg-red-600'}`}
            onClick={handleSubscribe}
          >
            {isSubscribed ? 'Subscribed' : 'Subscribe'}
          </button>
        </div>

        {/* Description Section */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Description</h2>
          <p className="text-gray-300">{video[0].description || "No description available."}</p>
        </div>
      </div>

      {/* Suggested Videos Section */}
      <div className="w-full lg:w-1/4 p-4 bg-gray-800 rounded-lg shadow-lg ml-0 lg:ml-4 mt-4 lg:mt-0">
        <h2 className="text-lg font-semibold mb-4">Up Next</h2>
        {suggestedVideos.map((suggestedVideo) => (
          <div
            key={suggestedVideo._id}
            className="flex flex-col gap-3 mb-6 bg-gray-700 rounded-lg shadow-md hover:shadow-lg cursor-pointer overflow-hidden transition-transform transform hover:scale-105"
            onClick={() => navigate(`/video/${suggestedVideo._id}`)} // Navigate to video playback page
          >
            {/* Thumbnail */}
            <img
              src={suggestedVideo.thumbnail}
              alt={suggestedVideo.title}
              className="w-full h-36 object-cover"
            />

            {/* Video Details */}
            <div className="p-3">
              <h3 className="text-md font-medium text-white mb-1">
                {suggestedVideo.title}
              </h3>
              <p className="text-sm text-gray-400">
                {suggestedVideo.owner?.username || "Unknown"}
              </p>
              <p className="text-xs text-gray-500">
                {Math.floor(suggestedVideo.duration / 60)}:
                {String(Math.floor(suggestedVideo.duration % 60)).padStart(2, "0")} mins
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoDetail;
