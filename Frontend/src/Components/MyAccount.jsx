import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from 'axios';
import { useNavigate } from "react-router-dom";

const MyAccount = () => {
  const { username } = useParams();
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await axios.get(
          `http://localhost:7000/api/v1/users/channel/${username}`,
          {
            withCredentials: true,
          }
        );
        setUserDetails(response.data.data);
        console.log(response.data.data);
        
      } catch (error) {
        console.error("Error fetching user details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserDetails();
  }, [username]);

  if (loading) return <div className="text-center text-white">Loading...</div>;
  if (!userDetails) return <div className="text-center text-white">User not found</div>;

  return (
    <div className="flex flex-col items-center w-full h-auto bg-slate-950 p-5 min-h-screen">
      <div className="w-full max-w-5xl bg-slate-900 text-white shadow-lg rounded-xl overflow-hidden">
        <div className="relative w-full h-48 bg-slate-800">
          <img
            src={userDetails?.coverImage || "https://via.placeholder.com/900x300"}
            alt="Cover"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/900x300";
            }}
          />
          <div className="absolute -bottom-12 left-1/2 transform -translate-x-1/2">
            <img
              src={userDetails.avatar || "https://via.placeholder.com/150"}
              alt="Avatar"
              className="w-24 h-24 rounded-full border-4 border-slate-950 shadow-md"
            />
          </div>
        </div>

        <div className="flex flex-col items-center text-center mt-16 px-6">
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

        <div className="flex justify-center space-x-6 mt-6">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700">
            Videos
          </button>
          <button className="px-4 py-2 bg-slate-800 text-gray-300 rounded-lg shadow-md hover:bg-slate-700">
            Playlists
          </button>
        </div>

        <div className="mt-8 px-6 pb-6">
          <h2 className="text-xl font-semibold text-gray-100 border-b border-gray-700 pb-2 mb-4">
            {userDetails.username}'s Videos
          </h2>
          <div className="grid p-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {userDetails.videosUploaded?.length > 0 ? (
              userDetails.videosUploaded.map((video) => (
                <div
                  key={video._id}
                  className="rounded-md  shadow-md hover:scale-105 transform transition-all duration-300 cursor-pointer"
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
                  <h3 className="text-lg px-2 font-medium truncate">{video.title}</h3>
                  <p className="text-sm px-2 pb-1 text-gray-500">
                    {userDetails.username || "Unknown"}
                  </p>
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

export default MyAccount;
