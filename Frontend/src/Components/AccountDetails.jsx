import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const AccountDetails = () => {
  const { username } = useParams();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:7000/api/v1/users/channel/${username}`, {
          withCredentials: true
        });
        console.log(response.data.data);
        
        setUserDetails(response.data.data);
        setIsSubscribed(response.data.data.isSubscribedTo || false);
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [username]);

  const handleSubscribe = async () => {
    try{
    const toggleSubscribe = await axios.get(`http://localhost:7000/api/v1/users/subscribe/${userDetails._id}`,{
      withCredentials: true,
    });
    console.log(toggleSubscribe);
    if(toggleSubscribe.data.message === "Unsubscribed successfully") setIsSubscribed(false);
    else setIsSubscribed(true);
    }
    catch(error)
    {
      if (error.response) {
        console.error("Error in subscribing from account details:", error.response.data.message || error.response.data);
      } else {
        console.error("An error occurred during subscriber:", error.message);
      }
    }
  };

  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  if (loading) return <div>Loading...</div>;
  if (!userDetails) return <div>User not found</div>;

  return (
    <div className="flex flex-col items-center w-full h-auto bg-slate-950 p-5 min-h-screen">
      <div className="w-full max-w-6xl bg-slate-900 text-white shadow-lg rounded-xl overflow-hidden">
        <div className="relative w-full h-56 bg-slate-800">
          <img
            src={userDetails?.coverImage || "https://via.placeholder.com/900x300"}
            alt="Cover"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/900x300";
            }}
          />
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2 sm:left-10 sm:translate-x-0">
            <img
              src={userDetails.avatar || "https://via.placeholder.com/150"}
              alt="Avatar"
              className="w-24 h-24 rounded-full border-4 border-slate-950 shadow-md"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mt-14 px-6 text-center sm:text-left">
          <div className="mt-4 md:mt-0">
            <h1 className="text-2xl font-semibold text-gray-100">
              {userDetails.username || "Unknown User"}
            </h1>
            <p className="text-gray-400">
              {userDetails.subscribersCount || 0} Subscribers
            </p>
            <p className="text-gray-400">
              {userDetails.videosUploaded.length || 0} Videos
            </p>
          </div>

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-6 mt-4 md:mt-0">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 w-full sm:w-auto">
              Videos
            </button>
            <button className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg shadow-md hover:bg-slate-700 w-full sm:w-auto">
              Playlists
            </button>
            <button
              className={`px-4 py-2 rounded-lg shadow-md ${isSubscribed ? 'bg-gray-700' : 'bg-red-600'} text-white hover:opacity-80 w-full sm:w-auto`}
              onClick={handleSubscribe}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </button>
          </div>
        </div>

        <div className="mt-8 px-6 pb-6">
          <h2 className="text-xl font-semibold text-gray-100 border-b border-gray-700 pb-2 mb-4">
            {userDetails.username}'s Videos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userDetails.videosUploaded?.length > 0 ? (
              userDetails.videosUploaded.map((video) => (
                <div
                  key={video._id}
                  className="rounded-md bg-slate-800 shadow-md hover:scale-105 transform transition-all duration-300 cursor-pointer"
                  onClick={() => navigate(`/video/${video._id}`)}
                >
                  <div className="relative">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-44 object-cover rounded-md mb-2"
                    />
                    <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 rounded-md">
                      {formatDuration(video.duration)}
                    </span>
                  </div>
                  <h3 className="text-lg px-2 font-medium">{video.title}</h3>
                  <p className="text-sm px-2 pb-1 text-gray-500">{userDetails.username || "Unknown"}</p>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No videos found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountDetails;
